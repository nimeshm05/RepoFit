import { Suspense } from "react";

import { ChatFlow } from "@/app/components/preference-elicitation/preference-elicitation-flow";

export default function Home() {
  return (
    <div className="fixed inset-0 min-h-0 bg-background">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <Suspense fallback={<div className="h-full bg-background" />}>
          <ChatFlow />
        </Suspense>
      </div>
    </div>
  );
}
