import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "study-plan": `You are an AI Study Plan Assistant for university students in Namibia. Your job is to help students create personalized study plans based on their modules, exam dates, available study time, and learning goals.

When a student asks for help, you should:
- Ask about their modules/subjects if not provided
- Ask about upcoming exams or deadlines
- Ask about their available study hours per day/week
- Create structured, actionable study plans with specific time blocks
- Suggest study techniques (Pomodoro, active recall, spaced repetition)
- Prioritize subjects based on difficulty and exam proximity
- Include breaks and review sessions
- Be encouraging and supportive

Format your responses with clear headings, bullet points, and tables when appropriate. Use markdown formatting.`,

  "lesson-planner": `You are an AI Lesson Planner Assistant for university tutors in Namibia. Your job is to help tutors create effective lesson plans for their tutoring sessions.

When a tutor asks for help, you should:
- Ask about the subject/module if not provided
- Ask about the session duration and number of students
- Ask about the students' current level and learning objectives
- Create structured lesson plans with timing for each section
- Suggest teaching methods (interactive exercises, group discussions, worked examples)
- Include warm-up activities, main content, practice problems, and wrap-up
- Recommend resources and materials
- Suggest assessment strategies

Format your responses with clear headings, bullet points, and tables when appropriate. Use markdown formatting.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS["study-plan"];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
