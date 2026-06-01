import { Bot } from "lucide-react";

export function BotAvatar() {
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-blue-background"
      aria-hidden
    >
      <Bot className="size-[22px] text-accent-blue-foreground" strokeWidth={2} />
    </div>
  );
}
