import { NextResponse } from "next/server";

import { transcribeAudio } from "@/lib/audio/transcribe-audio";
import {
  filenameForAudioMime,
  isSupportedAudioMime,
  normalizeAudioMimeType,
} from "@/lib/audio/normalize-audio-mime";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Audio file is too large" }, { status: 400 });
  }

  const mimeType = normalizeAudioMimeType(file.type, file.name);
  if (!isSupportedAudioMime(mimeType)) {
    return NextResponse.json({ error: "Unsupported audio format" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await transcribeAudio(
      buffer,
      filenameForAudioMime(mimeType),
      mimeType,
    );
    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed";

    if (message === "OPENAI_API_KEY is not configured") {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (message === "Transcription was empty") {
      return NextResponse.json(
        { error: "Could not understand the recording. Please try again." },
        { status: 422 },
      );
    }

    console.error("audio/transcribe error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
