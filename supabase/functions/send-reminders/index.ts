import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find appointments happening tomorrow
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: appointments, error } = await supabase
      .from("service_requests")
      .select("id, first_name, last_name, email, service_type, next_appointment, city")
      .gte("next_appointment", tomorrowStart.toISOString())
      .lte("next_appointment", tomorrowEnd.toISOString())
      .in("status", ["confirmed", "in_progress"]);

    if (error) {
      console.error("Query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!appointments || appointments.length === 0) {
      console.log("No appointments for tomorrow");
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${appointments.length} appointment(s) for tomorrow`);

    const emailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;
    const emailHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
    };

    let sentCount = 0;

    for (const apt of appointments) {
      const appointmentDate = new Date(apt.next_appointment);
      const formattedDate = appointmentDate.toLocaleDateString("fr-BE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("fr-BE", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Rappel de rendez-vous</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #1e293b; margin-top: 0;">Bonjour ${apt.first_name} ${apt.last_name},</h2>
            <p style="color: #475569; line-height: 1.6;">
              Nous vous rappelons votre rendez-vous prévu <strong>demain</strong> :
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #64748b;">📅 Date</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${formattedDate}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">🕐 Heure</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${formattedTime}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">🏠 Service</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${apt.service_type}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">📍 Ville</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${apt.city}</td></tr>
              </table>
            </div>
            <p style="color: #475569; line-height: 1.6;">
              En cas d'empêchement, merci de nous prévenir au
              <a href="tel:+3271455745" style="color: #2563eb; font-weight: 600;">071 45 57 45</a>.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              KAP Services – Rue Winston Churchill 212A, 6180 Courcelles<br/>
              BE 0847.632.505
            </p>
          </div>
        </div>
      `;

      try {
        const res = await fetch(emailUrl, {
          method: "POST",
          headers: emailHeaders,
          body: JSON.stringify({
            to: apt.email,
            subject: `⏰ Rappel : votre rendez-vous KAP Services demain (${formattedDate})`,
            html,
          }),
        });

        if (res.ok) {
          sentCount++;
          console.log(`Reminder sent to ${apt.email}`);
        } else {
          const text = await res.text();
          console.error(`Failed to send to ${apt.email}:`, text);
        }
      } catch (e) {
        console.error(`Error sending to ${apt.email}:`, e);
      }
    }

    console.log(`Sent ${sentCount}/${appointments.length} reminders`);
    return new Response(JSON.stringify({ sent: sentCount, total: appointments.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Failed to process reminders" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
