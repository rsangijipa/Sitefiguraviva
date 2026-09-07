import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * "Explore o Figura Viva" — índice visual da home (item 4 do plano editorial).
 *
 * A seção não cria funcionalidade nem rota: as quatro entradas apontam para
 * destinos que já existem no site. Ela resolve um problema de orientação — a
 * home é longa, e Biblioteca, Galeria e Memória Viva só apareciam no menu do
 * topo ou soterradas no meio da rolagem.
 *
 * A composição é 2×2 no desktop e uma coluna no telefone, deliberadamente mais
 * perto de uma abertura de revista do que de uma grade de aplicativo: sem
 * sombra, sem ícone dentro de disco colorido. A profundidade vem da troca de
 * superfície Creme → Areia no ponteiro, como no resto do sistema.
 */
const entradas = [
  {
    titulo: "Formações",
    descricao:
      "Os percursos formativos abertos, com ementa, carga horária e calendário.",
    href: "/#instituto",
  },
  {
    titulo: "Biblioteca",
    descricao:
      "Artigos, ensaios e textos de referência reunidos para leitura direta.",
    href: "/public-library",
  },
  {
    titulo: "Recursos",
    descricao: "Práticas digitais de respiração, awareness e escuta do corpo.",
    href: "/#recursos-interativos",
  },
  {
    titulo: "Memória Viva",
    descricao:
      "O acervo dedicado a Laura Perls: fotografias, cronologia e conceitos.",
    href: "/instituto/laura-perls",
  },
];

export default function ExploreSection() {
  return (
    <section
      aria-labelledby="explore-titulo"
      className="fv-section fv-section--sand fv-bg fv-bg-explore border-t border-border"
    >
      <div className="fv-container">
        <div className="mb-12 max-w-2xl">
          <span className="fv-eyebrow mb-4">Percursos</span>
          <h2 id="explore-titulo" className="heading-section">
            Explore o Figura Viva
          </h2>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
          {entradas.map((entrada) => (
            <li key={entrada.href}>
              {/* O link ocupa a célula inteira: o alvo de toque é o bloco, não
                  só o título. `h-full` mantém as quatro células da mesma altura
                  mesmo com descrições de comprimentos diferentes. */}
              <Link
                href={entrada.href}
                className="group flex h-full flex-col bg-paper p-8 transition-colors hover:bg-areia md:p-12"
              >
                <div className="flex items-start justify-between gap-6">
                  <h3 className="font-serif text-2xl font-semibold text-primary md:text-3xl">
                    {entrada.titulo}
                  </h3>
                  <ArrowUpRight
                    size={22}
                    aria-hidden
                    className="mt-1 shrink-0 text-muted transition-colors group-hover:text-primary"
                  />
                </div>
                <p className="mt-4 max-w-[42ch] leading-relaxed text-text/75">
                  {entrada.descricao}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
