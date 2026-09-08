"use client";

import { useEffect } from "react";

export const SWRegistration = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        // In dev, unregister existing workers to avoid 404s on stale build assets
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        return;
      }

      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((registrationError) => {
            console.error("SW registration failed: ", registrationError);
          });
      });
    }
  }, []);

  return null;
};
