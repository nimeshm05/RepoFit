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
    <div className="flex w-full flex-col items-start gap-assistant-block">
      <BotAvatar />
      <div className="flex w-full flex-col gap-assistant-block whitespace-pre-wrap break-words text-sm leading-6 text-neutral-900">
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

/** Figma node 2049:1227 — user response bubble */
export function UserAnswer({ content }: { content: string }) {
  return (
    <div className="flex w-full justify-end">
      <div className="max-w-user-message rounded-button bg-neutral-100 px-user-message-x py-user-message-y">
        <p className="whitespace-pre-wrap break-words text-base font-normal leading-body text-neutral-600">
          {content}
        </p>
      </div>
    </div>
  );
}

export function ConversationTurn({ turn }: { turn: ElicitationTurn }) {
  return (
    <div className="flex w-full flex-col gap-in-turn">
      <AssistantBlock content={turn.question} />
      <UserAnswer content={turn.answer} />
    </div>
  );
}
