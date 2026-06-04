/** Normalized RMS volume (0–1) from time-domain analyser data. */
export function getAudioLevel(analyser: AnalyserNode): number {
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128;
    sum += normalized * normalized;
  }

  return Math.sqrt(sum / data.length);
}
