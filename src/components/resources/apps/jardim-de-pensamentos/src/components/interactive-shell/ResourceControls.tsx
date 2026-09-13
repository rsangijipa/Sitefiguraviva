import React from 'react';

interface ResourceControlsProps {
  children: React.ReactNode;
  className?: string;
}

export const ResourceControls: React.FC<ResourceControlsProps> = ({
  children,
  className = '',
}) => {
  return (
    <nav
      className={`w-full bg-[#FDFAF4] border-t-2 border-[#D8CFBE] px-4 py-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20 ${className}`}
      aria-label="Controles da experiência"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
        {children}
      </div>
    </nav>
  );
};
