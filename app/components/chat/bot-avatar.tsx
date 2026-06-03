import Image from "next/image";

/** Figma node 2074:2440 — assistant bot icon (24×24) */
export function BotAvatar() {
  return (
    <div className="relative flex size-avatar shrink-0 items-center justify-center" aria-hidden>
      <Image
        src="/icons/assistant-avatar.svg"
        alt=""
        width={28}
        height={28}
        className="size-avatar"
      />
    </div>
  );
}
