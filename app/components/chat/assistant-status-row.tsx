import { BotAvatar } from "@/app/components/chat/bot-avatar";

/** Figma 2060:1457 — avatar + muted status while the model is working */
export function AssistantStatusRow({ message }: { message: string }) {
  return (
    <div className="flex items-end gap-3" role="status" aria-live="polite">
      <BotAvatar />
      <p className="break-words text-base font-normal leading-body text-neutral-400">{message}</p>
    </div>
  );
}

export const THINKING_STATUS_MESSAGE = "Thinking about your response";

export const MATCHMAKING_STATUS_MESSAGE =
  "Great, I have everything I need. I’m finding repository matches for you now...";
