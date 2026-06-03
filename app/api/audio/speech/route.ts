import { NextResponse } from "next/server";

import { synthesizeSpeech } from "@/lib/audio/synthesize-speech";

function parseBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const text = (body as Record<string, unknown>).text;
  if (typeof text !== "string" || !text.trim()) {
    return null;
  }

  return text.trim();
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = parseBody(body);
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const audio = await synthesizeSpeech(text);
    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speech synthesis failed";

    if (message === "OPENAI_API_KEY is not configured") {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    console.error("audio/speech error:", error);
    return NextResponse.json({ error: "Speech synthesis failed" }, { status: 500 });
  }
}
