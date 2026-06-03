import { BotAvatar } from "@/app/components/chat/bot-avatar";
import { TypewriterText } from "@/app/components/chat/typewriter-text";
import type { ElicitationTurn } from "@/lib/preference-elicitation/types";

const assistantTextClass =
  "whitespace-pre-wrap break-words text-sm leading-6 text-neutral-900";

export function AssistantBlock({
  content,
  greeting,
  animate = true,
  isThinking = false,
}: {
  content: string;
  greeting?: string;
  /** Typewriter on new messages; off for messages already in the thread history. */
  animate?: boolean;
  isThinking?: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-assistant-block">
      <BotAvatar isThinking={isThinking} />
      <div className="flex w-full flex-col gap-assistant-block">
        {greeting ? (
          <>
            <p className={`mb-0 ${assistantTextClass}`}>{greeting}</p>
            <TypewriterText
              className={`mt-0 ${assistantTextClass}`}
              text={content}
              animate={animate}
            />
          </>
        ) : (
          <TypewriterText
            className={assistantTextClass}
            text={content}
            animate={animate}
          />
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
      <AssistantBlock content={turn.question} animate={false} />
      <UserAnswer content={turn.answer} />
    </div>
  );
}
