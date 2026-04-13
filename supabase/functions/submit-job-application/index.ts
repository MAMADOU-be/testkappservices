import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

function validate(body: Record<string, unknown>): string | null {
  const strField = (key: string, max: number): string | null => {
    const val = body[key];
    if (typeof val !== "string") return `${key} is required`;
    const trimmed = val.trim();
    if (trimmed.length === 0) return `${key} cannot be empty`;
    if (trimmed.length > max) return `${key} exceeds max length (${max})`;
    return null;
  };

  const checks = [
    strField("first_name", 100),
    strField("last_name", 100),
    strField("street", 200),
    strField("house_number", 20),
    strField("postal_code", 10),
    strField("city", 100),
    strField("phone", 20),
    strField("email", 255),
    strField("employment_type", 50),
    strField("has_clientele", 10),
    strField("transport", 50),
    strField("plan_impulsion", 50),
  ];

  for (const err of checks) {
    if (err) return err;
  }

  const email = (body.email as string).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";

  const phone = (body.phone as string).trim();
  if (!/^[\d\s+\-.]{9,20}$/.test(phone)) return "Invalid phone format";

  const postalCode = (body.postal_code as string).trim();
  if (!/^\d{4}$/.test(postalCode)) return "Invalid postal code";

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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Trop de candidatures. Veuillez réessayer plus tard." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Honeypot
    if (body.website) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validationError = validate(body);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: insertError } = await supabase.from("job_applications").insert({
      first_name: (body.first_name as string).trim(),
      last_name: (body.last_name as string).trim(),
      street: (body.street as string).trim(),
      house_number: (body.house_number as string).trim(),
      postal_code: (body.postal_code as string).trim(),
      city: (body.city as string).trim(),
      phone: (body.phone as string).trim(),
      email: (body.email as string).trim(),
      employment_type: (body.employment_type as string).trim(),
      has_clientele: (body.has_clientele as string).trim(),
      transport: (body.transport as string).trim(),
      plan_impulsion: (body.plan_impulsion as string).trim(),
      message: body.message ? (body.message as string).trim() : null,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'enregistrement." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify staff by email (fire-and-forget)
    const emailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;
    fetch(emailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        template: "staff_notification",
        data: {
          type: "job_application",
          first_name: (body.first_name as string).trim(),
          last_name: (body.last_name as string).trim(),
          email: (body.email as string).trim(),
          phone: (body.phone as string).trim(),
          details: `Emploi: ${(body.employment_type as string).trim()}, Transport: ${(body.transport as string).trim()}`,
        },
      }),
    }).catch((e) => console.warn("Staff notification email failed:", e));

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
