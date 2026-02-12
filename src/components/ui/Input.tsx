import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const inputVariants = cva(
  "flex h-12 w-full rounded-xl border-2 px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-primary/10 bg-white/50 focus-visible:ring-primary/20 focus-visible:border-primary hover:border-primary/30 hover:bg-white",
        glass:
          "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 focus-visible:border-white/50 hover:bg-white/20",
        error:
          "border-error/50 bg-error/5 focus-visible:border-error focus-visible:ring-error/20 text-error placeholder:text-error/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      variant,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      ...props
    },
    ref,
  ) => {
    const isGlass = variant === "glass";

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              "text-sm font-bold ml-1",
              isGlass ? "text-white/90" : "text-primary/80",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <LeftIcon size={18} />
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: error ? "error" : variant, className }),
              LeftIcon && "pl-11",
              RightIcon && "pr-11",
            )}
            ref={ref}
            {...props}
          />
          {RightIcon && (
            <div
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground",
                onRightIconClick &&
                  "cursor-pointer hover:text-primary transition-colors",
              )}
              onClick={onRightIconClick}
            >
              <RightIcon size={18} />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-error font-medium ml-1 animate-in slide-in-from-top-1 fade-in">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
