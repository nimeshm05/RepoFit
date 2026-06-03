export function buildAgentSpeechText(
  question: string,
  options?: { greeting?: string },
): string {
  const trimmedQuestion = question.trim();
  const greeting = options?.greeting?.trim();

  if (greeting) {
    return `${greeting} ${trimmedQuestion}`;
  }

  return trimmedQuestion;
}
