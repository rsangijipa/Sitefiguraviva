import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classnames, otherwise I'll handle it simply

export const buttonVariants = ({
    variant = 'primary',
    size = 'md',
    className = ''
}: {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost',
    size?: 'sm' | 'md' | 'lg',
    className?: string
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-primary/20",
        secondary: "bg-white dark:bg-surface border border-gray-200 dark:border-border text-primary dark:text-text hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm",
        outline: "border-2 border-primary dark:border-gold text-primary dark:text-gold hover:bg-primary/5 dark:hover:bg-gold/10",
        ghost: "text-primary dark:text-gold hover:bg-primary/5 dark:hover:bg-gold/10 hover:text-primary/80"
    };

    const sizes = {
        sm: "h-9 px-4 text-xs tracking-wider",
        md: "h-11 px-6 text-sm tracking-widest min-h-[44px]",
        lg: "h-14 px-8 text-base tracking-widest min-h-[48px]"
    };

    return cn(baseStyles, variants[variant], sizes[size], className);
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={buttonVariants({ variant, size, className })}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <div className="mr-2">{leftIcon}</div>}
            {children}
            {!isLoading && rightIcon && <div className="ml-2">{rightIcon}</div>}
        </button>
    );
}
