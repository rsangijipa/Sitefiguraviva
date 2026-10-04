"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/lib/consent";

export default function CookieConsent() {
  const { consent, ready, grant, deny } = useCookieConsent();

  // Only ask once the stored choice has been read, and only if undecided.
  if (!ready || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-[120] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6"
    >
      <div className="mx-auto flex max-h-[min(44vh,360px)] max-w-3xl flex-col gap-4 overflow-y-auto rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:max-h-none sm:flex-row sm:items-center sm:gap-5 sm:p-6">
        <div className="flex gap-4 flex-1">
          <div
            className="hidden sm:flex w-11 h-11 shrink-0 rounded-xl bg-stone-50 border border-stone-100 items-center justify-center text-gold"
            aria-hidden="true"
          >
            <Cookie size={20} />
          </div>
          <div>
            <h2
              id="cookie-consent-title"
              className="font-serif text-lg text-primary font-bold mb-1"
            >
              Cookies e privacidade
            </h2>
            <p
              id="cookie-consent-description"
              className="text-sm leading-relaxed text-primary/70"
            >
              Usamos cookies necessários para o site funcionar. Com sua
              autorização, medimos a audiência; você pode mudar essa escolha no
              rodapé e consultar nossa{" "}
              <Link
                href="/privacidade"
                className="underline font-medium text-primary hover:text-gold transition-colors"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={deny}
            className="flex-1 sm:flex-none min-h-[44px] px-5 rounded-xl border border-stone-200 text-primary text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={grant}
            className="flex-1 sm:flex-none min-h-[44px] px-5 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
