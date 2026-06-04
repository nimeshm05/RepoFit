/** Speech-to-text — cost-effective default per OpenAI docs */
export const DEFAULT_TRANSCRIBE_MODEL =
  process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";

/** Text-to-speech for agent questions */
export const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL ?? "tts-1";

export const DEFAULT_TTS_VOICE = process.env.OPENAI_TTS_VOICE ?? "nova";

/** Client recording cap (well under OpenAI 25 MB upload limit) */
export const MAX_RECORDING_MS = 120_000;

/** Voice turn — silence detection (normalized RMS 0–1) */
export const VOICE_SILENCE_THRESHOLD = 0.012;

/** Continuous silence before auto-submitting a voice answer */
export const VOICE_SILENCE_DURATION_MS = 1_500;

/** Minimum recording length before silence can end the turn */
export const VOICE_MIN_SPEECH_MS = 600;

/** How often to sample mic level for silence detection */
export const VOICE_LEVEL_CHECK_MS = 100;
