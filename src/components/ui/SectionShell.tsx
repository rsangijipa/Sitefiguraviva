import React from "react";
import { cn } from "@/lib/utils";
import Container from "./Container";

interface SectionShellProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  container?: boolean;
  containerClassName?: string;
  /**
   * Whether to remove default vertical padding.
   * Useful for sections with custom padding needs while still using the shell for other features.
   */
  noPadding?: boolean;
}

/**
 * SectionShell provides a standardized layout wrapper for all site sections.
 * It enforces consistent vertical rhythm and horizontal alignment via the inner Container.
 */
export default function SectionShell({
  children,
  className,
  container = true,
  containerClassName,
  noPadding = false,
  as: Component = "section",
  ...props
}: SectionShellProps) {
  return (
    <Component
      className={cn(
        "w-full relative overflow-hidden",
        !noPadding && "section-shell",
        className,
      )}
      {...props}
    >
      {container ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </Component>
  );
}
