import React from 'react';

interface ResourceStageProps {
  children: React.ReactNode;
  contextPanel?: React.ReactNode;
  activeAnnouncement?: string | null;
  panelWidth?: 'default' | 'expanded';
  className?: string;
}

export const ResourceStage: React.FC<ResourceStageProps> = ({
  children,
  contextPanel,
  activeAnnouncement,
  panelWidth = 'default',
  className = '',
}) => {
  const stageWidthClass = !contextPanel
    ? 'w-full'
    : panelWidth === 'expanded'
    ? 'lg:w-[55%]'
    : 'lg:w-[65%]';

  const panelWidthClass =
    panelWidth === 'expanded' ? 'lg:w-[45%]' : 'lg:w-[35%]';

  return (
    <main
      className={`w-full flex-1 flex flex-col lg:flex-row overflow-hidden relative ${className}`}
      id="interactive-stage"
    >
      {/* Região acessível com aria-live para leitores de tela */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {activeAnnouncement}
      </div>

      {/* Palco Principal de Interação */}
      <section
        className={`relative flex-1 flex flex-col justify-center items-center overflow-hidden min-h-[360px] lg:min-h-[540px] bg-[#F1E9DB] transition-all duration-300 ease-in-out ${stageWidthClass}`}
        aria-label="Palco interativo do jardim"
      >
        {children}
      </section>

      {/* Painel Contextual Secundário */}
      {contextPanel && (
        <aside
          className={`w-full ${panelWidthClass} bg-[#FDFAF4] border-t-2 lg:border-t-0 lg:border-l-2 border-[#D8CFBE] flex flex-col z-10 overflow-y-auto max-h-[50vh] lg:max-h-none transition-all duration-300 ease-in-out`}
          aria-label="Painel de ações e composição"
        >
          {contextPanel}
        </aside>
      )}
    </main>
  );
};
