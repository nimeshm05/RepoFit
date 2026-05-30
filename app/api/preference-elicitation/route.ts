import { NextResponse } from "next/server";

import { runElicitationStep } from "@/lib/preferences/runElicitationStep";
import type { ElicitationRequest, ElicitationTurn } from "@/lib/preferences/types";
import { isValidAnswer } from "@/lib/preferences/validation";

function isElicitationTurn(value: unknown): value is ElicitationTurn {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const turn = value as Record<string, unknown>;
  return (
    typeof turn.question === "string" &&
    typeof turn.answer === "string" &&
    isValidAnswer(turn.answer)
  );
}

function parseRequestBody(body: unknown): ElicitationRequest | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  if (!Array.isArray(record.turns) || record.turns.length === 0) {
    return null;
  }

  if (!record.turns.every(isElicitationTurn)) {
    return null;
  }

  return { turns: record.turns };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseRequestBody(body);
  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid request: turns must be a non-empty array of answered questions" },
      { status: 400 },
    );
  }

  try {
    const result = await runElicitationStep(parsed.turns);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Preference elicitation failed";

    if (message === "OPENAI_API_KEY is not configured") {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (message.includes("Model returned") || message.includes("Model response")) {
      return NextResponse.json({ error: "Invalid model response" }, { status: 502 });
    }

    console.error("preference-elicitation error:", error);
    return NextResponse.json(
      { error: "Preference elicitation failed" },
      { status: 500 },
    );
  }
}
