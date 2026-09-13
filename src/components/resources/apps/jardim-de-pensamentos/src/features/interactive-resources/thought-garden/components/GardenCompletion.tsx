import React from 'react';
import { ResourceCompletion } from '../../../../components/interactive-shell/ResourceCompletion';

interface GardenCompletionProps {
  savedCount: number;
  onViewSaved: () => void;
  onRestart: () => void;
  onBackToPortal: () => void;
  closingTitle?: string;
  closingSupport?: string;
}

export const GardenCompletion: React.FC<GardenCompletionProps> = ({
  savedCount,
  onViewSaved,
  onRestart,
  onBackToPortal,
  closingTitle = 'Você pode voltar quando quiser.',
  closingSupport = 'Suas folhas guardadas permanecem seguras no seu histórico privado. As folhas efêmeras desta sessão deixaram o canteiro.',
}) => {
  return (
    <ResourceCompletion
      title={closingTitle}
      supportText={closingSupport}
      savedCount={savedCount}
      onViewSaved={onViewSaved}
      onRestart={onRestart}
      onBackToPortal={onBackToPortal}
    />
  );
};
