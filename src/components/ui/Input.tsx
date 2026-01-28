import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    onRightIconClick?: () => void;
    variant?: 'default' | 'glass';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, leftIcon: LeftIcon, rightIcon: RightIcon, onRightIconClick, variant = 'default', ...props }, ref) => {

        const baseInputStyles = cn(
            "flex h-12 w-full rounded-xl border px-4 py-2 text-sm md:text-base font-medium transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            variant === 'default'
                ? "bg-white border-stone-200 text-stone-900 shadow-sm focus:border-stone-300"
                : "bg-white/60 backdrop-blur-md border-white/50 text-stone-800 shadow-soft-sm hover:bg-white/80 focus:bg-white/90"
        );

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-1">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {LeftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                            <LeftIcon size={18} />
                        </div>
                    )}

                    <input
                        type={type}
                        className={cn(
                            baseInputStyles,
                            LeftIcon && "pl-11",
                            RightIcon && "pr-11",
                            error && "border-red-300 focus-visible:ring-red-200 bg-red-50/50",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />

                    {RightIcon && (
                        <button
                            type="button"
                            onClick={onRightIconClick}
                            className={cn(
                                "absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors",
                                onRightIconClick ? "hover:text-primary cursor-pointer" : "pointer-events-none"
                            )}
                            tabIndex={onRightIconClick ? 0 : -1}
                        >
                            <RightIcon size={18} />
                        </button>
                    )}
                </div>

                {error && (
                    <p className="text-xs text-red-500 font-medium ml-1 animate-fade-in-up">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
