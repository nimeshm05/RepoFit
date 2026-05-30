import OpenAI from "openai";

import { buildSystemPrompt } from "@/lib/preference-elicitation/build-system-prompt";
import { DEFAULT_OPENAI_MODEL, MAX_QUESTIONS } from "@/lib/preference-elicitation/constants";
import type {
  ElicitationResponse,
  ElicitationTurn,
  PreferenceProfile,
} from "@/lib/preference-elicitation/types";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

function buildConversationMessages(turns: ElicitationTurn[]) {
  return turns.flatMap((turn) => [
    { role: "assistant" as const, content: turn.question },
    { role: "user" as const, content: turn.answer },
  ]);
}

function isPreferenceProfile(value: unknown): value is PreferenceProfile {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseModelResponse(raw: string): ElicitationResponse {
  const parsed: unknown = JSON.parse(raw);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Model response is not an object");
  }

  const record = parsed as Record<string, unknown>;

  if (record.status === "continue" && typeof record.question === "string") {
    const question = record.question.trim();
    if (!question) {
      throw new Error("Model returned empty question");
    }
    return { status: "continue", question };
  }

  if (record.status === "complete" && isPreferenceProfile(record.profile)) {
    return { status: "complete", profile: record.profile };
  }

  throw new Error("Model response has invalid shape");
}

function buildEmptyProfile(): PreferenceProfile {
  return {
    skills: [],
    interests: [],
    experience: "",
    goal: "",
    contributionStyle: "",
    difficultyPreference: "",
    timeCommitment: "",
    careerDirection: "",
  };
}

export async function runElicitationStep(
  turns: ElicitationTurn[],
): Promise<ElicitationResponse> {
  if (turns.length >= MAX_QUESTIONS) {
    return { status: "complete", profile: buildEmptyProfile() };
  }

  const systemPrompt = await buildSystemPrompt();
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      ...buildConversationMessages(turns),
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Model returned no content");
  }

  const response = parseModelResponse(content);

  if (response.status === "continue" && turns.length >= MAX_QUESTIONS - 1) {
    return { status: "complete", profile: buildEmptyProfile() };
  }

  return response;
}
