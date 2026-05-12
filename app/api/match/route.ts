import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";

const VALID_SPECIALIZATIONS = [
  "Cardiologist",
  "Dermatologist",
  "Orthopedic",
  "General Physician",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
] as const;

export async function POST(req: NextRequest) {
  try {
    const { symptom } = await req.json();

    if (!symptom || typeof symptom !== "string") {
      return NextResponse.json({ specialization: "General Physician" });
    }

    const result = await groqChat({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 10,
      messages: [
        {
          role: "system",
          content:
            "You are a strict medical routing API. Evaluate the user's symptom and return EXACTLY ONE of the following specializations: [Cardiologist, Dermatologist, Orthopedic, General Physician, Neurologist, Pediatrician, Psychiatrist]. Do not include any conversational text, formatting, markdown, or punctuation. Output ONLY the exact word.",
        },
        { role: "user", content: symptom.trim() },
      ],
    });

    const matched = VALID_SPECIALIZATIONS.find(
      (s) => s.toLowerCase() === result.trim().toLowerCase()
    );

    return NextResponse.json({ specialization: matched ?? "General Physician" });
  } catch (err) {
    console.error("[POST /api/match]", err);
    return NextResponse.json({ specialization: "General Physician" });
  }
}
