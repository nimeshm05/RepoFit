import {
  DEFAULT_TTS_MODEL,
  DEFAULT_TTS_VOICE,
} from "@/lib/audio/constants";
import { getOpenAIClient } from "@/lib/openai/get-client";

const MAX_TTS_CHARS = 4096;

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const trimmed = text.trim().slice(0, MAX_TTS_CHARS);
  if (!trimmed) {
    throw new Error("Speech text is empty");
  }

  const client = getOpenAIClient();
  const response = await client.audio.speech.create({
    model: DEFAULT_TTS_MODEL,
    voice: DEFAULT_TTS_VOICE,
    input: trimmed,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
