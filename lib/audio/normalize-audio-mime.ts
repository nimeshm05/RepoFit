/** Safari and other browsers report inconsistent MIME types for MediaRecorder output. */
export function normalizeAudioMimeType(
  mime: string | undefined,
  filename?: string,
): string {
  const base = (mime ?? "").split(";")[0]?.trim().toLowerCase();
  const ext = filename?.split(".").pop()?.toLowerCase();

  if (base === "video/mp4" || base === "audio/x-m4a" || base === "audio/x-mp4") {
    return "audio/mp4";
  }

  if (base === "audio/aac") {
    return "audio/mp4";
  }

  if (base.startsWith("audio/") && base.length > "audio/".length) {
    return base;
  }

  if (ext === "m4a" || ext === "mp4" || ext === "aac") {
    return "audio/mp4";
  }

  if (ext === "webm") {
    return "audio/webm";
  }

  if (ext === "wav") {
    return "audio/wav";
  }

  if (ext === "mp3" || ext === "mpeg") {
    return "audio/mpeg";
  }

  if (ext === "ogg") {
    return "audio/ogg";
  }

  return "audio/webm";
}

export function isSupportedAudioMime(mime: string): boolean {
  const normalized = normalizeAudioMimeType(mime);
  const supported = new Set([
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/m4a",
    "audio/ogg",
  ]);
  return supported.has(normalized);
}

export function filenameForAudioMime(mime: string): string {
  const normalized = normalizeAudioMimeType(mime);
  if (normalized.includes("mp4") || normalized.includes("m4a")) {
    return "recording.m4a";
  }
  if (normalized.includes("mpeg") || normalized.includes("mp3")) {
    return "recording.mp3";
  }
  if (normalized.includes("wav")) {
    return "recording.wav";
  }
  if (normalized.includes("ogg")) {
    return "recording.ogg";
  }
  return "recording.webm";
}
