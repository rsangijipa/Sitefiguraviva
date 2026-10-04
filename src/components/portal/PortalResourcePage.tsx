import Link from "next/link";
import type { ReactNode } from "react";

interface PortalResourcePageProps {
  backHref: string;
  backLabel: string;
  children: ReactNode;
  /** Preenche a altura toda (para experiências em tela cheia). */
  fullBleed?: boolean;
}

/**
 * Moldura padrão das páginas de recursos do portal do aluno:
 * fundo quente + link de volta 44px + experiência em tela cheia abaixo.
 */
export default function PortalResourcePage({
  backHref,
  backLabel,
  children,
  fullBleed = true,
}: PortalResourcePageProps) {
  return (
    <div
      className={
        fullBleed ? "min-h-dvh bg-[#FDFAF4]" : "min-h-dvh bg-[#FDFAF4] p-4"
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <Link
          href={backHref}
          className="inline-flex min-h-[44px] items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#005A1F] hover:underline"
        >
          ← {backLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}
