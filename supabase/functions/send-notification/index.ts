import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  type: "booking_confirmed" | "payment_update" | "session_reminder" | "tutor_approved" | "tutor_rejected";
  recipientUserId: string;
  data: Record<string, any>;
}

const EMAIL_TEMPLATES: Record<string, (data: any) => { subject: string; html: string }> = {
  booking_confirmed: (d) => ({
    subject: `✅ Booking Confirmed: ${d.subject}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #1a3a6b, #1e2d4d); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">Campus-CONNECT</h1>
        </div>
        <h2 style="color: #1a3a6b; margin-top: 0;">Booking Confirmed! 🎉</h2>
        <p style="color: #555;">Your session has been booked successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8f9fa; border-radius: 8px;">
          <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Subject</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${d.subject}</td></tr>
          <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Tutor</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${d.tutorName}</td></tr>
          <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Date</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${d.date}</td></tr>
          <tr><td style="padding: 12px; font-weight: bold;">Time</td><td style="padding: 12px;">${d.time}</td></tr>
        </table>
        <p style="color: #555;">Don't forget to upload your payment proof in the dashboard.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">— Campus-CONNECT Team</p>
      </div>`,
  }),

  payment_update: (d) => ({
    subject: `💳 Payment ${d.paymentStatus === "confirmed" ? "Confirmed" : "Update"}: ${d.subject}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #1a3a6b, #1e2d4d); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">Campus-CONNECT</h1>
        </div>
        <h2 style="color: #1a3a6b;">Payment ${d.paymentStatus === "confirmed" ? "Confirmed ✅" : d.paymentStatus === "rejected" ? "Rejected ❌" : "Updated"}</h2>
        <p style="color: #555;">Your payment for <strong>${d.subject}</strong> has been <strong>${d.paymentStatus}</strong>.</p>
        ${d.paymentStatus === "confirmed" ? '<p style="color: #22c55e; font-weight: bold;">You now have access to the WhatsApp study group!</p>' : ""}
        ${d.paymentStatus === "rejected" ? '<p style="color: #ef4444;">Please re-upload a valid payment proof in your dashboard.</p>' : ""}
        <p style="color: #999; font-size: 12px; margin-top: 24px;">— Campus-CONNECT Team</p>
      </div>`,
  }),

  session_reminder: (d) => ({
    subject: `⏰ Reminder: ${d.subject} session ${d.when}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #1a3a6b, #1e2d4d); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">Campus-CONNECT</h1>
        </div>
        <h2 style="color: #1a3a6b;">Session Reminder ⏰</h2>
        <p style="color: #555;">Your <strong>${d.subject}</strong> session is coming up <strong>${d.when}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8f9fa; border-radius: 8px;">
          <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Date</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${d.date}</td></tr>
          <tr><td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">Time</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${d.time}</td></tr>
          <tr><td style="padding: 12px; font-weight: bold;">Location</td><td style="padding: 12px;">${d.location}</td></tr>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">— Campus-CONNECT Team</p>
      </div>`,
  }),

  tutor_approved: (d) => ({
    subject: `🎉 Your Tutor Application is Approved!`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #1a3a6b, #1e2d4d); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">Campus-CONNECT</h1>
        </div>
        <h2 style="color: #22c55e;">Congratulations, ${d.name}! 🎉</h2>
        <p style="color: #555;">Your tutor application has been <strong>approved</strong>. You can now log in and start creating tutoring sessions.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #166534;">Head to your Tutor Dashboard to create your first session and start helping fellow students!</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">— Campus-CONNECT Team</p>
      </div>`,
  }),

  tutor_rejected: (d) => ({
    subject: `Tutor Application Update`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #1a3a6b, #1e2d4d); border-radius: 12px; padding: 24px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">Campus-CONNECT</h1>
        </div>
        <h2 style="color: #1a3a6b;">Application Update</h2>
        <p style="color: #555;">Hi ${d.name}, unfortunately your tutor application was not approved at this time.</p>
        ${d.reason ? `<p style="color: #555;"><strong>Reason:</strong> ${d.reason}</p>` : ""}
        <p style="color: #555;">You're welcome to reapply in the future. Keep studying and growing!</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">— Campus-CONNECT Team</p>
      </div>`,
  }),
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, recipientUserId, data } = (await req.json()) as NotificationRequest;

    // Get recipient profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("name, email, phone_number")
      .eq("user_id", recipientUserId)
      .single();

    if (profileErr || !profile) {
      throw new Error(`Recipient profile not found: ${profileErr?.message}`);
    }

    const template = EMAIL_TEMPLATES[type];
    if (!template) throw new Error(`Unknown notification type: ${type}`);

    const { subject, html } = template({ ...data, name: profile.name });

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Campus-CONNECT <onboarding@resend.dev>",
        to: [profile.email],
        subject,
        html,
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
    }

    // Store notification in database
    await supabase.from("notifications").insert({
      user_id: recipientUserId,
      type,
      title: subject,
      message: html.replace(/<[^>]*>/g, "").substring(0, 500),
      channel: "email",
      status: emailRes.ok ? "sent" : "failed",
      email_sent: emailRes.ok,
      metadata: { ...data, resend_id: emailData?.id },
    });

    return new Response(
      JSON.stringify({ success: true, email_sent: emailRes.ok }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("send-notification error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
