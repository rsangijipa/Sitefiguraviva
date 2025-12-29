import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PaperCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  variant?: 'default' | 'outlined';
}

export const PaperCard: React.FC<PaperCardProps> = ({ 
  children, 
  className, 
  onClick,
  active = false,
  variant = 'default'
}) => {
  
  return (
    <div 
      onClick={onClick}
      className={twMerge(
        'relative p-6 rounded-2xl transition-all duration-300 ease-out',
        // Base styles
        'bg-paper-light/80 backdrop-blur-sm border border-white/60',
        'shadow-soft hover:shadow-hover',
        // Active/Selected State
        active && 'ring-2 ring-earth ring-offset-2 ring-offset-paper bg-white scale-[1.02]',
        // Variant styling
        variant === 'outlined' && 'bg-transparent border-2 border-ink/10',
        className
      )}
    >
      {children}
    </div>
  );
};