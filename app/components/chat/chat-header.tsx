"use client";

import { HeaderModeTabs, type HeaderMode } from "@/app/components/chat/header-mode-tabs";
import {
  Header,
  REPOFIT_INFO_TOOLTIP,
  type HeaderProps,
} from "@/app/components/ui/Header";

type ChatHeaderProps = Omit<HeaderProps, "leading" | "title" | "infoTooltip"> & {
  mode?: HeaderMode;
  defaultMode?: HeaderMode;
  onModeChange?: (mode: HeaderMode) => void;
};

export function ChatHeader({
  mode,
  defaultMode,
  onModeChange,
  ...props
}: ChatHeaderProps) {
  return (
    <Header
      leading={
        <HeaderModeTabs
          value={mode}
          defaultValue={defaultMode}
          onChange={onModeChange}
        />
      }
      infoTooltip={null}
      {...props}
    />
  );
}

export { Header, REPOFIT_INFO_TOOLTIP };
