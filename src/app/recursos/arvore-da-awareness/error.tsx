"use client";

import Link from "next/link";

export default function AwarenessTreeError({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#091813] px-5 text-center text-[#edf5ee]">
      <div className="max-w-lg">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d8bd79]">
          A árvore repousa por um instante
        </p>
        <h1 className="mt-3 font-serif text-4xl">
          Não foi possível abrir a experiência
        </h1>
        <p className="mt-4 text-white/70">
          Você pode tentar novamente ou retornar aos demais recursos do
          instituto.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-full bg-[#d8bd79] px-5 font-semibold text-[#17231c]"
          >
            Tentar novamente
          </button>
          <Link
            href="/recursos"
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 font-semibold"
          >
            Voltar aos recursos
          </Link>
        </div>
      </div>
    </div>
  );
}
