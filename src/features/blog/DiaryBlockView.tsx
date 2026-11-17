import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { SafeHtmlServer } from "@/components/SafeHtml.server";
import {
  diaryBlockSpan,
  type DiaryBlock,
  type DiaryTone,
} from "./diary-blocks";
import { YouTubeFacade } from "./YouTubeFacade";

const TONES: Record<DiaryTone, string> = {
  paper: "border-[#e5dccb] bg-[#fdfaf4]/95 text-stone-900",
  sage: "border-[#cfe0d4] bg-[#e9f2ec] text-[#173b25]",
  sand: "border-[#e2d3b8] bg-[#f3eadb] text-[#3b2f1c]",
  night: "border-[#2c3a2f] bg-[#1d251f] text-[#eef3ec]",
  none: "border-transparent bg-transparent",
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function plain(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Um bloco do diário. `index` alterna uma leve inclinação nos bilhetes. */
export function DiaryBlockView({
  block,
  index,
  darkPage,
}: {
  block: DiaryBlock;
  index: number;
  darkPage: boolean;
}) {
  const span = diaryBlockSpan(block);
  const tone =
    block.tone === "none"
      ? `${TONES.none} ${darkPage ? "text-[#eef3ec]" : "text-stone-900"}`
      : TONES[block.tone];
  const muted = "opacity-80";
  const date = formatDate(block.date);
  const tilt = index % 2 === 0 ? "lg:-rotate-[0.6deg]" : "lg:rotate-[0.8deg]";

  if (block.kind === "quote") {
    return (
      <figure
        className={`${span} ${tone} ${tilt} flex flex-col justify-center rounded-[28px] border p-7 shadow-sm sm:p-9`}
      >
        <Quote
          size={30}
          aria-hidden="true"
          className="mb-3 rotate-180 text-gold"
        />
        <blockquote className="font-serif text-2xl italic leading-snug sm:text-[1.7rem]">
          {plain(block.content) || block.title}
        </blockquote>
        {block.quoteAuthor && (
          <figcaption
            className={`mt-5 text-xs font-bold uppercase tracking-widest ${muted}`}
          >
            — {block.quoteAuthor}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.kind === "text") {
    return (
      <article
        className={`${span} ${tone} rounded-[24px] border p-6 shadow-sm sm:p-8`}
      >
        {block.title && (
          <h2 className="mb-3 font-serif text-2xl leading-tight">
            {block.title}
          </h2>
        )}
        <SafeHtmlServer
          html={block.content}
          className="text-[15px] leading-relaxed [&_a]:underline [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
        />
        {date && <p className={`mt-4 text-xs ${muted}`}>{date}</p>}
      </article>
    );
  }

  if (block.kind === "photo" && block.imageUrl) {
    const tall = block.size === "large";
    return (
      <figure
        className={`${span} group relative overflow-hidden rounded-[28px] border border-black/5 bg-stone-200 shadow-md ${
          tall
            ? "min-h-[320px] lg:min-h-[560px]"
            : block.size === "small"
              ? "aspect-square"
              : "aspect-[4/3]"
        }`}
      >
        <Image
          src={block.imageUrl}
          alt={block.excerpt || block.title || "Fotografia do diário"}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {(block.title || block.excerpt) && (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 pt-14 text-white">
            {block.title && (
              <p className="font-serif text-xl leading-tight">{block.title}</p>
            )}
            {block.excerpt && (
              <p className="mt-1 text-sm text-white/85">{block.excerpt}</p>
            )}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.kind === "video" && block.youtubeId) {
    return (
      <article
        className={`${span} ${tone} overflow-hidden rounded-[28px] border shadow-md`}
      >
        <div className="relative aspect-video w-full bg-black">
          <YouTubeFacade videoId={block.youtubeId} title={block.title} />
        </div>
        {(block.title || block.excerpt) && (
          <div className="p-5 sm:p-6">
            {block.title && (
              <h2 className="font-serif text-xl leading-tight sm:text-2xl">
                {block.title}
              </h2>
            )}
            {block.excerpt && (
              <p className={`mt-2 text-sm leading-relaxed ${muted}`}>
                {block.excerpt}
              </p>
            )}
          </div>
        )}
      </article>
    );
  }

  // Texto longo: cartão que leva à página completa da publicação.
  return (
    <article
      className={`${span} ${tone} group flex flex-col overflow-hidden rounded-[28px] border shadow-md`}
    >
      {block.imageUrl && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-200">
          <Image
            src={block.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h2 className="font-serif text-2xl leading-tight">{block.title}</h2>
        <p className={`mt-3 line-clamp-4 text-sm leading-relaxed ${muted}`}>
          {block.excerpt || plain(block.content).slice(0, 220)}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          {date && <span className={`text-xs ${muted}`}>{date}</span>}
          <Link
            href={`/blog/${block.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-current px-4 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Ler reflexão
            <span className="sr-only">: {block.title}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
