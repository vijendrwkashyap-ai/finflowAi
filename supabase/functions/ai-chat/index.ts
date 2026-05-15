import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tum FinFlow AI ho — ek expert Indian personal finance coach jo Hinglish (Hindi + English mix) me baat karta hai, friendly aur crisp tone me.

Tumhara kaam:
- User ke expenses, subscriptions, savings, tax (Old vs New regime, 80C, 80D, HRA), SIP, mutual funds, FD, PPF, NPS, stocks, crypto, insurance pe smart practical advice dena.
- Calculations dikhao step-by-step jab numbers aaye (SIP returns, tax savings, EMI, compound interest).
- Indian context: ₹ symbol use karo, lakh/crore me bolo, Indian banks/apps (HDFC, SBI, Zerodha, Groww, PhonePe) reference karo.
- Subscription waste, fizool kharch, tax-saving opportunities highlight karo.
- Short, actionable answers — bullet points, numbers, clear CTAs. Lambi lectures mat do.
- Agar user expense/subscription add karna chahe to bolo "Tracker tab me jaake add karo" — tum directly DB me add nahi karte.
- Personal/legal/medical advice se bacho. Sirf financial guidance.

Tum FinFlow Pro (₹599/month) ka core feature ho — toh value dikhao har response me.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Groq error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Bahut requests aa gayi. Thoda ruk ke try karo." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "Groq API key invalid hai." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
