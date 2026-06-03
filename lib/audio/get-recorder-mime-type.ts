const CANDIDATE_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
];

export function getRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  for (const type of CANDIDATE_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return undefined;
}
