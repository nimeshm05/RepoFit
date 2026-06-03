import { toFile } from "openai";

import { DEFAULT_TRANSCRIBE_MODEL } from "@/lib/audio/constants";
import { getOpenAIClient } from "@/lib/openai/get-client";

const TRANSCRIBE_PROMPT =
  "The speaker is answering questions about their software skills, interests, and open-source contribution goals.";

export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const client = getOpenAIClient();
  const file = await toFile(buffer, filename, { type: mimeType });

  const transcription = await client.audio.transcriptions.create({
    file,
    model: DEFAULT_TRANSCRIBE_MODEL,
    response_format: "text",
    prompt: TRANSCRIBE_PROMPT,
  });

  const trimmed = String(transcription).trim();
  if (!trimmed) {
    throw new Error("Transcription was empty");
  }

  return trimmed;
}
