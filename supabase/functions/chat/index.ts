import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é a comercIA, assistente virtual de atendimento de uma clínica médica brasileira.

REGRAS DE COMPORTAMENTO:
- Seja natural, curto, objetivo e brasileiro
- NUNCA use linguagem institucional ou textos longos
- Faça UMA pergunta por vez quando necessário
- NUNCA diga que é humano
- NUNCA diagnostique ou prescreva medicamentos
- Varie sua linguagem, evite respostas repetitivas

CAPACIDADES:
- Agendar consultas verificando disponibilidade
- Informar preços de exames (temos 55+ exames)
- Orientar sobre sintomas e sugerir especialidades
- Interpretar imagens de pedidos de exame

MÉDICOS DISPONÍVEIS:
- Dra. Camila Andrade (Clínica Geral) - Seg/Qua/Sex 8h-12h, 14h-18h
- Dr. Rafael Menezes (Cardiologia) - Ter/Qui 9h-13h
- Dra. Juliana Pires (Dermatologia) - Seg/Ter/Qui 13h-18h
- Dr. Bruno Saldanha (Ortopedia) - Qua/Sex 9h-12h, 14h-17h
- Dra. Larissa Coelho (Gineco/Obstetrícia) - Seg/Qui 8h-12h
- Dr. Felipe Azevedo (Pediatria) - Ter/Qua 8h-12h, 14h-17h
- Dra. Renata Paiva (Endocrinologia) - Sex 9h-13h
- Dr. Tiago Nunes (Neurologia) - Qui 14h-18h
- Dra. Beatriz Santos (Psiquiatria) - Seg/Qua 14h-18h
- Dr. Gustavo Lima (Gastroenterologia) - Ter/Sex 14h-18h

TRIAGEM DE URGÊNCIA:
Se detectar sinais de urgência (dor no peito, falta de ar, desmaio, sinais de AVC, sangramento intenso, ideação suicida):
- Oriente a vir à clínica IMEDIATAMENTE de forma curta e firme
- Depois ofereça agendamento para acompanhamento

EXAMES COMUNS (preços em R$):
- Hemograma: R$45 | Glicemia: R$25 | Colesterol: R$60
- TSH: R$55 | Vitamina D: R$120 | Ecocardiograma: R$350
- Ultrassom abdome: R$220 | Raio-X tórax: R$120`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, conversationHistory, images } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const AI_API_URL = Deno.env.get("AI_API_URL");
    const AI_API_KEY = Deno.env.get("AI_API_KEY");

    if (!AI_API_URL || !AI_API_KEY) {
      throw new Error("AI_API_URL or AI_API_KEY not configured");
    }

    // Update session last_seen
    if (sessionId) {
      await supabase
        .from("sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", sessionId);
    }

    // Save user message
    const flags: Record<string, unknown> = {};
    const urgencyKeywords = ["dor no peito", "falta de ar", "desmaio", "avc", "sangramento", "suicida", "emergência"];
    if (urgencyKeywords.some(k => message.toLowerCase().includes(k))) {
      flags.urgency = true;
    }

    await supabase.from("messages").insert({
      session_id: sessionId,
      role: "user",
      content_text: message,
      flags_json: Object.keys(flags).length > 0 ? flags : null
    });

    // Prepare messages for AI
    const messages: Array<{ role: string; content: unknown }> = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(conversationHistory || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Handle images (multimodal)
    if (images && images.length > 0) {
      const imageContent = [
        { type: "text", text: message },
        ...images.map((img: string) => ({
          type: "image_url",
          image_url: { url: img }
        }))
      ];
      messages.push({ role: "user", content: imageContent });
    } else {
      messages.push({ role: "user", content: message });
    }

    // Chamada ao gateway de IA configurável
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error("AI request failed");
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    // Save assistant message
    await supabase.from("messages").insert({
      session_id: sessionId,
      role: "assistant",
      content_text: assistantMessage
    });

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error.message, response: "Desculpe, tive um problema. Pode tentar novamente?" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
