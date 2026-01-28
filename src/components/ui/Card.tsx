import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl transition-all duration-300",
                variant === 'default'
                    ? "bg-white shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-1 hover:border-accent/20"
                    : "bg-white/60 backdrop-blur-xl border border-white/60 shadow-soft-lg hover:bg-white/80",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("font-serif font-semibold leading-none tracking-tight text-primary", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
