import { Suspense } from "react";

import { PreferenceElicitationFlow } from "@/app/components/preference-elicitation/PreferenceElicitationFlow";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PreferenceElicitationFlow />
    </Suspense>
  );
}
