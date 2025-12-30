import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
    clean?: boolean;
}

export default function Container({
    children,
    className,
    as: Component = 'div',
    clean = false,
    ...props
}: ContainerProps) {
    return (
        <Component
            className={cn(
                "mx-auto w-full px-6 md:px-12",
                !clean && "max-w-7xl",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}
