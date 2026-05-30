import { Suspense } from "react";

import { PreferenceElicitationFlow } from "@/app/components/onboarding/PreferenceElicitationFlow";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PreferenceElicitationFlow />
    </Suspense>
  );
}
