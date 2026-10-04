"use client";

import { CurrentNeedsExperience } from "./src/features/interactive-resources/current-needs/CurrentNeedsExperience";

export default function NeedsNowApp({ userId, onExit }: { userId?: string; onExit?: () => void }) {
  return <CurrentNeedsExperience userId={userId ?? ""} onNavigateToCatalog={onExit ?? (() => {})} />;
}
