import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find sessions happening tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: sessions, error: sessErr } = await supabase
      .from("sessions")
      .select("id, subject, date, time, location, tutor_id")
      .eq("date", tomorrowStr)
      .eq("status", "active");

    if (sessErr) throw sessErr;
    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({ message: "No sessions tomorrow" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let notificationsSent = 0;

    for (const session of sessions) {
      // Get bookings for this session
      const { data: bookings } = await supabase
        .from("bookings")
        .select("student_id")
        .eq("session_id", session.id)
        .neq("status", "cancelled");

      const recipientIds = [
        session.tutor_id,
        ...(bookings || []).map((b: any) => b.student_id),
      ];

      // Send notification to each participant
      for (const userId of recipientIds) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "session_reminder",
              recipientUserId: userId,
              data: {
                subject: session.subject,
                date: session.date,
                time: session.time,
                location: session.location,
                when: "tomorrow",
              },
            }),
          });
          notificationsSent++;
        } catch (e) {
          console.error(`Failed to notify ${userId}:`, e);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, sessions: sessions.length, notificationsSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("session-reminders error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
