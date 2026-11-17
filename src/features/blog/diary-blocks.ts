/**
 * Diário visual "Reflexões em movimento" (/blog).
 *
 * Cada publicação da tabela `posts` vira um bloco do diário. O formato, o
 * tamanho e o tom do bloco ficam em `posts.legacy_payload` (jsonb que já
 * existe); a ordem dos blocos e o fundo da página ficam em
 * `public_pages` com a chave `blog_diary`. Nenhuma coluna nova é necessária.
 */
import { getYouTubeVideoId, safeContentUrl } from "@/lib/course-content/media";

export const DIARY_SETTINGS_KEY = "blog_diary";
/** Chave usada por uma versão anterior do painel; lida só como reserva. */
export const LEGACY_THEME_KEY = "blog_theme";

export const DIARY_KINDS = [
  "article",
  "photo",
  "text",
  "quote",
  "video",
] as const;
export type DiaryKind = (typeof DIARY_KINDS)[number];

export const DIARY_KIND_LABELS: Record<DiaryKind, string> = {
  article: "Texto longo (abre página própria)",
  photo: "Fotografia",
  text: "Texto curto",
  quote: "Frase solta",
  video: "Vídeo do YouTube",
};

export const DIARY_SIZES = ["small", "medium", "large", "full"] as const;
export type DiarySize = (typeof DIARY_SIZES)[number];

export const DIARY_SIZE_LABELS: Record<DiarySize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  full: "Largura total",
};

export const DIARY_TONES = ["paper", "sage", "sand", "night", "none"] as const;
export type DiaryTone = (typeof DIARY_TONES)[number];

export const DIARY_TONE_LABELS: Record<DiaryTone, string> = {
  paper: "Papel",
  sage: "Verde-sálvia",
  sand: "Areia",
  night: "Noite",
  none: "Transparente",
};

export type DiaryBackground = {
  id: string;
  label: string;
  /** Cor base (também usada na amostra do painel). */
  color: string;
  /** Camadas de background-image em CSS, se houver. */
  image?: string;
  size?: string;
  dark?: boolean;
};

export const DIARY_BACKGROUNDS: DiaryBackground[] = [
  {
    id: "papel",
    label: "Papel",
    color: "#fbf7ee",
    image: "url('/assets/fv/art/textura-papel.svg')",
    size: "420px auto",
  },
  {
    id: "aquarela",
    label: "Aquarela",
    color: "#f7f1e6",
    image: "url('/assets/fv/art/aquarela-suave-estante.svg')",
    size: "cover",
  },
  {
    id: "linho",
    label: "Linho",
    color: "#f3eee4",
    image:
      "repeating-linear-gradient(45deg, rgb(216 207 190 / 0.18) 0 1px, transparent 1px 8px)",
  },
  {
    id: "salvia",
    label: "Verde-sálvia",
    color: "#edf3ee",
    image: "radial-gradient(rgb(0 90 31 / 0.07) 1.5px, transparent 1.5px)",
    size: "22px 22px",
  },
  {
    id: "noite",
    label: "Noite",
    color: "#141a15",
    image: "radial-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px)",
    size: "22px 22px",
    dark: true,
  },
];

const LEGACY_BACKGROUND_IDS: Record<string, string> = {
  paper: "papel",
  watercolor: "aquarela",
  linen: "linho",
  sage: "salvia",
  dark: "noite",
};

export type DiarySettings = {
  background: string;
  /** Imagem própria escolhida no painel (substitui a textura do fundo). */
  backgroundImageUrl: string | null;
  /** IDs das publicações na ordem escolhida. */
  order: string[];
};

export const DEFAULT_DIARY_SETTINGS: DiarySettings = {
  background: "papel",
  backgroundImageUrl: null,
  order: [],
};

export function resolveDiaryBackground(
  id: string | null | undefined,
): DiaryBackground {
  const key = id ? (LEGACY_BACKGROUND_IDS[id] ?? id) : "papel";
  return (
    DIARY_BACKGROUNDS.find((item) => item.id === key) ?? DIARY_BACKGROUNDS[0]
  );
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function parseDiarySettings(
  content: unknown,
  legacyTheme?: unknown,
): DiarySettings {
  const data = asObject(content);
  const legacy = asObject(legacyTheme);
  const background = resolveDiaryBackground(
    typeof data.background === "string"
      ? data.background
      : typeof legacy.theme === "string"
        ? legacy.theme
        : null,
  ).id;
  const order = Array.isArray(data.order)
    ? [
        ...new Set(
          data.order.filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          ),
        ),
      ]
    : [];
  return {
    background,
    backgroundImageUrl: safeContentUrl(
      typeof data.backgroundImageUrl === "string"
        ? data.backgroundImageUrl
        : null,
    ),
    order,
  };
}

export type DiaryBlock = {
  id: string;
  kind: DiaryKind;
  size: DiarySize;
  tone: DiaryTone;
  title: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  youtubeId: string | null;
  quoteAuthor: string | null;
  author: string | null;
  date: string | null;
  tags: string[];
};

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Mapeia nomes antigos ("normal", "tall", "photo" etc.) para o modelo atual. */
function legacySize(value: unknown): DiarySize | null {
  if (value === "normal") return "medium";
  if (value === "tall") return "large";
  return null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Converte um registro de post (já mapeado pelo repositório ou cru) num bloco
 * seguro para renderizar: URLs só http(s) ou relativas, vídeo só com ID
 * válido do YouTube. Um vídeo sem ID válido vira texto curto.
 */
export function toDiaryBlock(post: Record<string, unknown>): DiaryBlock {
  const legacy = asObject(post.legacy_payload);
  const read = (key: string) => post[key] ?? legacy[key];

  const rawKind = read("post_format");
  let kind: DiaryKind = pick(rawKind, DIARY_KINDS, "article");
  const youtubeId = getYouTubeVideoId(
    text(read("youtube_url")) ??
      text(post.externalUrl) ??
      text(post.external_url),
  );
  if (kind === "video" && !youtubeId) kind = "text";

  const rawSize = read("card_size");
  const size =
    legacySize(rawSize) ??
    pick(rawSize, DIARY_SIZES, kind === "quote" ? "small" : "medium");
  const tone = pick(
    read("tone") ?? read("bg_style"),
    DIARY_TONES,
    kind === "quote" ? "sand" : "paper",
  );

  return {
    id: String(post.id ?? ""),
    kind,
    size,
    tone,
    title: text(post.title) ?? "",
    excerpt: text(post.excerpt),
    content: typeof post.content === "string" ? post.content : "",
    imageUrl: safeContentUrl(
      text(post.image) ?? text(post.imageUrl) ?? text(post.image_url),
    ),
    youtubeId,
    quoteAuthor: text(read("quote_author")),
    author: text(post.author),
    date:
      text(post.publishedAt) ??
      text(post.published_at) ??
      text(post.createdAt) ??
      text(post.created_at),
    tags: Array.isArray(post.tags)
      ? post.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
  };
}

/**
 * Ordena os blocos conforme `order`. Publicações novas (fora da lista)
 * aparecem primeiro, das mais recentes para as mais antigas, como num diário.
 */
export function orderDiaryBlocks<
  T extends { id: string; date?: string | null },
>(blocks: readonly T[], order: readonly string[]): T[] {
  const position = new Map(order.map((id, index) => [id, index]));
  const fresh = blocks
    .filter((block) => !position.has(block.id))
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
  const placed = blocks
    .filter((block) => position.has(block.id))
    .sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0));
  return [...fresh, ...placed];
}

/** Move um item da posição `from` para `to`, sem mutar a lista original. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (
    from < 0 ||
    from >= list.length ||
    to < 0 ||
    to >= list.length ||
    from === to
  ) {
    return [...list];
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Classes de grade do bloco. A grade tem 1 coluna no celular, 2 no tablet e
 * 6 no desktop; com `grid-flow-dense` os blocos menores preenchem os vãos.
 */
export function diaryBlockSpan(
  block: Pick<DiaryBlock, "size" | "kind">,
): string {
  const tall =
    block.kind === "photo" && block.size === "large" ? " lg:row-span-2" : "";
  switch (block.size) {
    case "small":
      return "sm:col-span-1 lg:col-span-2" + tall;
    case "large":
      return "sm:col-span-2 lg:col-span-4" + tall;
    case "full":
      return "sm:col-span-2 lg:col-span-6";
    default:
      return "sm:col-span-1 lg:col-span-3" + tall;
  }
}
