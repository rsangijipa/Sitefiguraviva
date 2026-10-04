"use client";

import { createContext, useContext } from "react";
import { DEFAULT_PUBLIC_CONTACT, type PublicContact } from "../content/contact";

const PublicContactContext = createContext<PublicContact>(
  DEFAULT_PUBLIC_CONTACT,
);

export function PublicContactProvider({
  value,
  children,
}: {
  value: PublicContact;
  children: React.ReactNode;
}) {
  return (
    <PublicContactContext.Provider value={value}>
      {children}
    </PublicContactContext.Provider>
  );
}

// Public chrome receives one small server DTO; it never loads the database SDK.
export function usePublicContact() {
  return useContext(PublicContactContext);
}
