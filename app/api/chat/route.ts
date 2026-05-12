import { NextRequest, NextResponse } from "next/server";
import { groqChat, GroqMessage } from "@/lib/groq";

const FLAG = "||DATA_COMPLETE||";

export async function POST(req: NextRequest) {
  try {
    const { messages, doctorName } = await req.json();

    if (!Array.isArray(messages) || !doctorName) {
      return NextResponse.json(
        { reply: "Invalid request.", isDataCollected: false },
        { status: 400 }
      );
    }

    const systemPrompt =
      `You are the virtual medical assistant for Dr. ${doctorName}. ` +
      "The doctor is currently offline. Politely collect three things from the patient: " +
      "1. Full name  2. Contact number  3. Brief description of their problem. " +
      "Ask for one piece at a time. Be empathetic. Do NOT give medical advice. " +
      `Once you have ALL THREE, append exactly '${FLAG}' at the very end of your reply.`;

    const groqMessages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m: GroqMessage) => m.role === "user" || m.role === "assistant")
        .map((m: GroqMessage) => ({ role: m.role, content: String(m.content) })),
    ];

    const raw = await groqChat({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 512,
      messages: groqMessages,
    });

    const isDataCollected = raw.includes(FLAG);
    const reply = raw.replaceAll(FLAG, "").trim();

    return NextResponse.json({ reply, isDataCollected });
  } catch (err) {
    console.error("[POST /api/chat]", err);
    return NextResponse.json({
      reply: "I'm having trouble connecting right now. Please try again shortly.",
      isDataCollected: false,
    });
  }
}
