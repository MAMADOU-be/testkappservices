import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limit store (per instance lifetime)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Server-side validation
function validate(body: Record<string, unknown>): string | null {
  const strField = (key: string, max: number, required = true): string | null => {
    const val = body[key];
    if (typeof val !== "string") return required ? `${key} is required` : null;
    const trimmed = val.trim();
    if (required && trimmed.length === 0) return `${key} cannot be empty`;
    if (trimmed.length > max) return `${key} exceeds max length (${max})`;
    return null;
  };

  const checks = [
    strField("first_name", 100),
    strField("last_name", 100),
    strField("email", 255),
    strField("phone", 20),
    strField("street", 300),
    strField("city", 100),
    strField("postal_code", 10),
    strField("service_type", 200),
    strField("frequency", 50),
    strField("preferred_day", 200, false),
    strField("comments", 1000, false),
  ];

  for (const err of checks) {
    if (err) return err;
  }

  // Email format check
  const email = (body.email as string).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";

  // Phone format check
  const phone = (body.phone as string).trim();
  if (!/^[\d\s+\-.]{9,20}$/.test(phone)) return "Invalid phone format";

  // Postal code check
  const postal = (body.postal_code as string).trim();
  if (!/^\d{4}$/.test(postal)) return "Invalid postal code";

  return null;
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
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      console.warn(`Rate limited IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: "Trop de demandes. Veuillez réessayer plus tard." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();

    // Honeypot check
    if (body.website) {
      console.log("Honeypot triggered");
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate
    const validationError = validate(body);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert using service role key to bypass RLS (we validated server-side)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: insertError } = await supabase.from("service_requests").insert({
      first_name: (body.first_name as string).trim(),
      last_name: (body.last_name as string).trim(),
      email: (body.email as string).trim(),
      phone: (body.phone as string).trim(),
      street: (body.street as string).trim(),
      city: (body.city as string).trim(),
      postal_code: (body.postal_code as string).trim(),
      service_type: (body.service_type as string).trim(),
      frequency: (body.frequency as string).trim(),
      preferred_day: body.preferred_day ? (body.preferred_day as string).trim() : null,
      comments: body.comments ? (body.comments as string).trim() : null,
      status: "pending",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'enregistrement." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send confirmation email to client
    const emailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;
    const emailHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
    };

    // Fire-and-forget: don't block the response
    const confirmationPayload = {
      template: "service_request_confirmation",
      data: {
        first_name: (body.first_name as string).trim(),
        last_name: (body.last_name as string).trim(),
        email: (body.email as string).trim(),
        service_type: (body.service_type as string).trim(),
        frequency: (body.frequency as string).trim(),
        city: (body.city as string).trim(),
      },
    };

    const staffPayload = {
      template: "staff_notification",
      data: {
        type: "service_request",
        first_name: (body.first_name as string).trim(),
        last_name: (body.last_name as string).trim(),
        email: (body.email as string).trim(),
        phone: (body.phone as string).trim(),
        details: `Service: ${(body.service_type as string).trim()} | Fréquence: ${(body.frequency as string).trim()} | Ville: ${(body.city as string).trim()}`,
      },
    };

    // Send emails in parallel (non-blocking)
    Promise.all([
      fetch(emailUrl, { method: "POST", headers: emailHeaders, body: JSON.stringify(confirmationPayload) }).catch((e) => console.warn("Confirmation email failed:", e)),
      fetch(emailUrl, { method: "POST", headers: emailHeaders, body: JSON.stringify(staffPayload) }).catch((e) => console.warn("Staff email failed:", e)),
    ]);

    console.log(`Service request submitted from IP: ${ip}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
