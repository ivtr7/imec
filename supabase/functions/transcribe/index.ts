import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    const AI_API_URL = Deno.env.get("AI_API_URL");
    const AI_API_KEY = Deno.env.get("AI_API_KEY");

    if (!audio) {
      throw new Error("No audio data provided");
    }

    if (!AI_API_URL || !AI_API_KEY) {
      throw new Error("AI_API_URL or AI_API_KEY not configured");
    }

    // Gateway genérico para transcrição via chat multimodal
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Transcreva o áudio a seguir. Retorne APENAS o texto transcrito, sem explicações." },
              { type: "input_audio", input_audio: { data: audio, format: "webm" } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("Transcription error:", response.status);
      // Fallback: return empty transcription
      return new Response(
        JSON.stringify({ text: "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Transcribe error:", error);
    return new Response(
      JSON.stringify({ error: error.message, text: "" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
