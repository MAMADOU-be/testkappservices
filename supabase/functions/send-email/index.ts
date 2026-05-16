import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from_name?: string;
}

async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  if (!SENDGRID_API_KEY) {
    return { success: false, error: "SENDGRID_API_KEY not configured" };
  }

  const fromEmail = "jolooftech@gmail.com";
  const fromName = payload.from_name || "KAP Services";

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: fromEmail, name: fromName },
      subject: payload.subject,
      content: [{ type: "text/html", value: payload.html }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`SendGrid error [${response.status}]:`, text);
    return { success: false, error: `SendGrid API error: ${response.status}` };
  }

  if (response.body) {
    await response.text();
  }

  return { success: true };
}

/**
 * Verify the caller is authenticated OR is an internal edge function call.
 * Returns: { allowed: true, role: 'service'|'admin'|'employee'|'user', user? } or { allowed: false, response }
 */
async function verifyAccess(req: Request): Promise<{
  allowed: boolean;
  response?: Response;
  role?: "service" | "admin" | "employee" | "user";
  userEmail?: string;
}> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      allowed: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const token = authHeader.replace("Bearer ", "");

  // Allow internal server-to-server calls using service role key
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey && token === serviceRoleKey) {
    return { allowed: true, role: "service" };
  }

  // Otherwise verify as a user JWT
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      allowed: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  // Determine role
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
  const role: "admin" | "employee" | "user" = roleSet.has("admin")
    ? "admin"
    : roleSet.has("employee")
    ? "employee"
    : "user";

  return { allowed: true, role, userEmail: user.email };
}

/** Strip HTML tags and escape entities to neutralize user-controlled content. */
function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Email templates — all interpolated values are sanitized
function serviceRequestConfirmationEmail(data: {
  first_name: string;
  last_name: string;
  service_type: string;
  frequency: string;
  city: string;
}): { subject: string; html: string } {
  const first = sanitizeText(data.first_name);
  const last = sanitizeText(data.last_name);
  const service = sanitizeText(data.service_type);
  const frequency = sanitizeText(data.frequency);
  const city = sanitizeText(data.city);
  return {
    subject: "✅ Confirmation de votre demande – KAP Services",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">KAP Services</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b; margin-top: 0;">Bonjour ${first} ${last},</h2>
          <p style="color: #475569; line-height: 1.6;">
            Nous avons bien reçu votre demande de service et nous vous en remercions !
            Voici un récapitulatif :
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${service}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Fréquence</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${frequency}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Ville</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${city}</td></tr>
            </table>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Notre équipe va traiter votre demande dans les plus brefs délais.
            Nous vous contacterons pour convenir d'un rendez-vous.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Pour toute question, n'hésitez pas à nous appeler au
            <a href="tel:+3271455745" style="color: #2563eb; font-weight: 600;">071 45 57 45</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            KAP Services – Rue Winston Churchill 212A, 6180 Courcelles<br/>
            BE 0847.632.505
          </p>
        </div>
      </div>
    `,
  };
}

function staffNotificationEmail(data: {
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  details?: string;
}): { subject: string; html: string } {
  const typeLabels: Record<string, string> = {
    service_request: "🏠 Nouvelle demande de service",
    contact_message: "✉️ Nouveau message de contact",
    job_application: "💼 Nouvelle candidature",
    new_user: "👤 Nouveau compte créé",
    profile_updated: "✏️ Profil mis à jour",
    role_changed: "🔑 Rôle modifié",
    status_changed: "📋 Statut demande modifié",
  };

  const label = typeLabels[data.type] || `📌 Notification: ${sanitizeText(data.type)}`;
  const first = sanitizeText(data.first_name);
  const last = sanitizeText(data.last_name);
  const email = sanitizeText(data.email);
  const phone = sanitizeText(data.phone);
  const details = data.details ? sanitizeText(data.details) : "";

  return {
    subject: label,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e293b; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px;">${label}</h1>
        </div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b;">Nom</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${first} ${last}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Téléphone</td><td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td></tr>
              ${details ? `<tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Détails</td><td style="padding: 8px 0; color: #1e293b;">${details}</td></tr>` : ""}
            </table>
          </div>
          <p style="color: #475569; margin-top: 16px; text-align: center;">
            Connectez-vous au <a href="https://testks.lovable.app/profile" style="color: #2563eb;">tableau de bord</a> pour traiter cette demande.
          </p>
        </div>
      </div>
    `,
  };
}

function userNotificationEmail(data: {
  event: string;
  user_name: string;
  details: string;
}): { subject: string; html: string } {
  const eventLabels: Record<string, string> = {
    role_added: "🔑 Rôle ajouté à votre compte",
    role_removed: "🔑 Rôle retiré de votre compte",
    status_changed: "📋 Mise à jour de votre demande",
    profile_updated: "👤 Profil mis à jour",
    welcome: "🎉 Bienvenue chez KAP Services",
  };

  const userName = sanitizeText(data.user_name);
  const details = sanitizeText(data.details);

  return {
    subject: eventLabels[data.event] || "Notification KAP Services",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">KAP Services</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b; margin-top: 0;">Bonjour ${userName},</h2>
          <p style="color: #475569; line-height: 1.6;">${details}</p>
          <p style="color: #475569; line-height: 1.6;">
            Connectez-vous à votre <a href="https://testks.lovable.app/profile" style="color: #2563eb;">espace personnel</a> pour plus de détails.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            KAP Services – Rue Winston Churchill 212A, 6180 Courcelles<br/>
            BE 0847.632.505
          </p>
        </div>
      </div>
    `,
  };
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify authentication
    const access = await verifyAccess(req);
    if (!access.allowed) {
      return access.response!;
    }

    const body = await req.json();
    const { template, data } = body;

    let emailContent: { subject: string; html: string };
    let to: string;

    switch (template) {
      case "service_request_confirmation":
        emailContent = serviceRequestConfirmationEmail(data);
        to = data.email;
        break;
      case "staff_notification":
        emailContent = staffNotificationEmail(data);
        to = "jolooftech@gmail.com";
        break;
      case "user_notification":
        emailContent = userNotificationEmail(data);
        to = data.email;
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown template" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const result = await sendEmail({ to, ...emailContent });

    if (!result.success) {
      console.error("Email send failed:", result.error);
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Email sent: ${template} -> ${to}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send email error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
