import Image from "next/image";

/** Figma node 2049:1029 — assistant avatar (40×40) */
export function BotAvatar() {
  return (
    <div className="relative size-avatar shrink-0" aria-hidden>
      <Image
        src="/icons/assistant-avatar.svg"
        alt=""
        width={40}
        height={40}
        className="size-avatar"
      />
    </div>
  );
}
