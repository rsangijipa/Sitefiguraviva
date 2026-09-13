"use client";

import { JardimDePensamentos } from "./portal-garden/components/JardimDePensamentos";

export default function JardimPensamentosApp({
  onExit,
}: {
  onExit?: () => void;
}) {
  return (
    <JardimDePensamentos
      onBackToResources={onExit ?? (() => {})}
      onOpenNotebook={() => {}}
    />
  );
}
