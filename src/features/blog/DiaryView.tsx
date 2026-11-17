import Link from "next/link";
import type { CSSProperties } from "react";

import {
  resolveDiaryBackground,
  type DiaryBlock,
  type DiarySettings,
} from "./diary-blocks";
import { DiaryBlockView } from "./DiaryBlockView";

export const DIARY_CATEGORIES = [
  "Todos",
  "Clínica",
  "Gestalt",
  "Formação",
  "Arte",
  "Território",
  "Memória",
] as const;

export function diaryCategoryOf(block: DiaryBlock): string {
  const haystack = `${block.tags.join(" ")} ${block.title}`.toLowerCase();
  return (
    DIARY_CATEGORIES.slice(1).find((category) =>
      haystack.includes(category.toLowerCase()),
    ) || "Reflexão"
  );
}

/** Corpo do diário visual: fundo escolhido, temas e grade orgânica de blocos. */
export function DiaryView({
  visible,
  settings,
  selectedCategory,
}: {
  visible: DiaryBlock[];
  settings: DiarySettings;
  selectedCategory: string;
}) {
  const CATEGORIES = DIARY_CATEGORIES;
  const background = resolveDiaryBackground(settings.background);
  const pageStyle: CSSProperties = {
    backgroundColor: background.color,
    backgroundImage: settings.backgroundImageUrl
      ? `linear-gradient(${background.dark ? "rgb(20 26 21 / 0.82)" : "rgb(251 247 238 / 0.78)"}, ${
          background.dark ? "rgb(20 26 21 / 0.82)" : "rgb(251 247 238 / 0.78)"
        }), url(${JSON.stringify(settings.backgroundImageUrl)})`
      : background.image,
    backgroundSize: settings.backgroundImageUrl ? "cover" : background.size,
    backgroundPosition: "center",
  };

  return (
    <div
      className={`pb-20 pt-10 ${background.dark ? "text-[#eef3ec]" : "text-stone-900"}`}
      style={pageStyle}
      data-diary-background={background.id}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <nav aria-label="Temas do diário" className="mb-10">
          <ul className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={
                    category === "Todos"
                      ? "/blog"
                      : `/blog?categoria=${encodeURIComponent(category)}`
                  }
                  aria-current={
                    selectedCategory === category ? "page" : undefined
                  }
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    selectedCategory === category
                      ? "border-primary bg-primary text-white"
                      : "border-stone-300 bg-white/85 text-stone-700 hover:border-primary hover:text-primary"
                  }`}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {visible.length > 0 ? (
          <div className="grid grid-flow-row-dense grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
            {visible.map((block, index) => (
              <DiaryBlockView
                key={block.id}
                block={block}
                index={index}
                darkPage={Boolean(background.dark)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-20 text-center text-stone-600">
            Nada por aqui ainda neste tema. Veja{" "}
            <Link href="/blog" className="font-semibold text-primary underline">
              todas as publicações
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
