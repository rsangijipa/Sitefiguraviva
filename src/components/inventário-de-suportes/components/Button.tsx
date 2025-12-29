import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Base styles common to all buttons
  // Removed padding from here as it's now handled by size variants
  const baseStyles = "rounded-full font-serif tracking-wide transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-terra-400 hover:bg-terra-500 text-white shadow-md hover:shadow-lg focus:ring-terra-300",
    secondary: "bg-moss-200 hover:bg-moss-300 text-moss-800 shadow-sm focus:ring-moss-200",
    outline: "border border-moss-500 text-moss-600 hover:bg-moss-100/50 focus:ring-moss-400",
    ghost: "text-terra-600 hover:bg-terra-50 hover:text-terra-800",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};