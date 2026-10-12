"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt = "", src, onError, ...props }, ref) => {
  const [failedSrc, setFailedSrc] = React.useState<string | Blob>();
  if (!src || src === failedSrc) return null;
  return (
    <img
      ref={ref}
      className={cn(
        "absolute inset-0 z-10 aspect-square h-full w-full object-cover",
        className,
      )}
      src={src}
      alt={alt}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-stone-100 text-stone-500 font-bold",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";
