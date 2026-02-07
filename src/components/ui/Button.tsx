import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
                primary: "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
                destructive:
                    "bg-error text-white hover:bg-error/90 shadow-sm",
                outline:
                    "border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-primary",
                secondary:
                    "bg-primary/5 text-primary hover:bg-primary/10",
                ghost: "hover:bg-primary/5 text-primary hover:text-primary/90",
                link: "text-primary underline-offset-4 hover:underline",
                premium: "bg-gradient-to-r from-gold to-gold-dark text-white hover:opacity-90 shadow-glow-gold",
            },
            size: {
                default: "h-11 px-8 py-2",
                sm: "h-9 rounded-lg px-4",
                lg: "h-14 rounded-2xl px-10 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, leftIcon, rightIcon, isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className={cn("animate-spin h-4 w-4", size === 'icon' ? "" : "-ml-1 mr-2")}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                ) : (
                    <>
                        {leftIcon && <span className="mr-2">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="ml-2">{rightIcon}</span>}
                    </>
                )}
                {isLoading && size !== 'icon' && children}
            </button>
        )
    }
)
Button.displayName = "Button"

export default Button
export { Button, buttonVariants }
