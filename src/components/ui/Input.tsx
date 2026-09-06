import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Traco de 1px em Nevoa, raio do sistema e foco em Verde Raiz. A borda de 2px
// anterior engrossava o campo ate ele competir com o botao ao lado, e o fundo
// `bg-white/50` era branco literal: no tema escuro virava um veu claro.
const inputVariants = cva(
  "flex h-12 min-h-[44px] w-full rounded-md border px-4 py-2 text-base md:text-sm ring-offset-paper file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "border-border bg-paper text-text hover:border-igarape focus-visible:border-primary focus-visible:ring-primary/15",
        glass:
          "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 focus-visible:border-white/50 hover:bg-white/20",
        // Terra Barro, como manda o Design System para estado de erro em
        // formulario. A cor nunca carrega o aviso sozinha: o campo tambem
        // recebe `aria-invalid` e aponta para a mensagem por `aria-describedby`.
        error:
          "border-terra bg-terra/5 text-text focus-visible:border-terra focus-visible:ring-terra/20",
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
  isLoading?: boolean;
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
      isLoading,
      ...props
    },
    ref,
  ) => {
    const isGlass = variant === "glass";
    // Um id estavel para ligar a mensagem de erro ao campo. Sem essa ligacao o
    // leitor de tela anuncia o rotulo e o valor, mas nunca o motivo da recusa.
    const generatedId = React.useId();
    const inputId = props.id ?? generatedId;
    const errorId = `${inputId}-erro`;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-bold ml-1 block",
              isGlass ? "text-white/90" : "text-text",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <LeftIcon size={18} />
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: error ? "error" : variant, className }),
              LeftIcon && "pl-11",
              (RightIcon || isLoading) && "pr-11",
            )}
            ref={ref}
            disabled={props.disabled || isLoading}
            {...props}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : props["aria-describedby"]}
          />
          {isLoading ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : RightIcon ? (
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
          ) : null}
        </div>
        {error && (
          <p
            id={errorId}
            className="ml-1 text-xs font-medium text-terra animate-in slide-in-from-top-1 fade-in"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
