"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FDFAF4]"
      role="alert"
    >
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-bold text-red-800">
          N\u00e3o foi poss\u00edvel carregar esta experi\u00eancia.
        </h3>
        <p className="text-sm text-red-700">
          {error.message || "Erro desconhecido."}
        </p>
        <div className="flex gap-3 pt-2 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition min-h-[44px]"
          >
            Tentar novamente
          </button>
          <Link
            href="/portal/recursos"
            className="px-6 py-3 bg-[#F1E9DB] text-[#005A1F] rounded-xl font-bold text-sm hover:bg-[#D8CFBE] transition min-h-[44px]"
          >
            Voltar aos recursos
          </Link>
        </div>
      </div>
    </div>
  );
}
