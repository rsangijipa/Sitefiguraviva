"use client";

import { AwarenessSoundsExperience } from "./src/features/interactive-resources/awareness-sounds/AwarenessSoundsExperience";

export default function AwarenessSoundsApp({ onExit }: { onExit?: () => void }) {
  return <AwarenessSoundsExperience onBackToCatalog={onExit ?? (() => {})} />;
}
