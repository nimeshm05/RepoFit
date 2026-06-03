/** Speech-to-text — cost-effective default per OpenAI docs */
export const DEFAULT_TRANSCRIBE_MODEL =
  process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";

/** Text-to-speech for agent questions */
export const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL ?? "tts-1";

export const DEFAULT_TTS_VOICE = process.env.OPENAI_TTS_VOICE ?? "nova";

/** Client recording cap (well under OpenAI 25 MB upload limit) */
export const MAX_RECORDING_MS = 120_000;
