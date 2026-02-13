"use client";

import { useRouter } from "next/navigation";

/**
 * Hook to use View Transitions API with Next.js router
 * Fallback to normal routing if API is not supported.
 */
export function useViewTransitionRouter() {
  const router = useRouter();

  const push = (href: string) => {
    if (!document.startViewTransition) {
      router.push(href);
      return;
    }

    document.startViewTransition(() => {
      router.push(href);
    });
  };

  return { ...router, push };
}
