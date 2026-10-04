"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
  alert: string | null;
  showAlert: (message: string) => void;
  hideAlert: () => void;
}

const UIContext = createContext<UIContextType>({
  alert: null,
  showAlert: () => {},
  hideAlert: () => {},
});

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<string | null>(null);

  const showAlert = (message: string) => {
    setAlert(message);
    // Automatic hide after 8s for global alerts
    setTimeout(() => setAlert(null), 8000);
  };

  const hideAlert = () => setAlert(null);

  return (
    <UIContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
