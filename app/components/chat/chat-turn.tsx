import { BotAvatar } from "@/app/components/chat/bot-avatar";
import type { ElicitationTurn } from "@/lib/preference-elicitation/types";

export function AssistantBlock({
  content,
  greeting,
}: {
  content: string;
  greeting?: string;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <BotAvatar />
      <div className="flex w-full flex-col gap-3 whitespace-pre-wrap break-words text-sm leading-6 text-accent-blue-foreground">
        {greeting ? (
          <>
            <p className="mb-0">{greeting}</p>
            <p className="mt-0">{content}</p>
          </>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
}

export function UserAnswer({ content }: { content: string }) {
  return (
    <p className="w-full whitespace-pre-wrap text-base leading-chat break-words text-neutral-800">
      {content}
    </p>
  );
}

export function ConversationTurn({ turn }: { turn: ElicitationTurn }) {
  return (
    <div className="flex w-full flex-col gap-5">
      <AssistantBlock content={turn.question} />
      <UserAnswer content={turn.answer} />
    </div>
  );
}
