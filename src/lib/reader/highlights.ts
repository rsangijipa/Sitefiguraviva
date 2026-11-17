/**
 * Marcações de leitura da Biblioteca Viva.
 *
 * Cada trecho marcado é guardado como um intervalo de caracteres do texto
 * puro do artigo (`textContent` da área de leitura). Isso independe da
 * estrutura HTML e sobrevive a recarregar a página, desde que o texto do
 * artigo não mude. Tudo fica no localStorage do leitor, por artigo; nada vai
 * para o servidor.
 */

export type TextHighlight = { start: number; end: number };

export type ReaderTheme = "pastel" | "dark";

const HIGHLIGHT_PREFIX = "fv:biblioteca:marcacoes:";
const THEME_KEY = "fv:biblioteca:tema-leitura";
/** Limite defensivo: evita que um valor corrompido trave o leitor. */
const MAX_HIGHLIGHTS = 500;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function highlightStorageKey(articleId: string | number): string {
  return `${HIGHLIGHT_PREFIX}${String(articleId)}`;
}

/** Ordena, descarta intervalos inválidos e funde os que se sobrepõem ou se tocam. */
export function mergeHighlights(
  list: readonly TextHighlight[],
): TextHighlight[] {
  const valid = list
    .filter(
      (item) =>
        item &&
        Number.isInteger(item.start) &&
        Number.isInteger(item.end) &&
        item.start >= 0 &&
        item.end > item.start,
    )
    .map((item) => ({ start: item.start, end: item.end }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: TextHighlight[] = [];
  for (const item of valid) {
    const last = merged[merged.length - 1];
    if (last && item.start <= last.end) {
      last.end = Math.max(last.end, item.end);
    } else {
      merged.push(item);
    }
  }
  return merged.slice(0, MAX_HIGHLIGHTS);
}

/** Remove de `list` a parte que cai dentro de `removal` (pode dividir um trecho). */
export function subtractHighlight(
  list: readonly TextHighlight[],
  removal: TextHighlight,
): TextHighlight[] {
  const out: TextHighlight[] = [];
  for (const item of mergeHighlights(list)) {
    if (item.end <= removal.start || item.start >= removal.end) {
      out.push(item);
      continue;
    }
    if (item.start < removal.start)
      out.push({ start: item.start, end: removal.start });
    if (item.end > removal.end) out.push({ start: removal.end, end: item.end });
  }
  return out;
}

export function parseStoredHighlights(
  raw: string | null | undefined,
): TextHighlight[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return mergeHighlights(
      value.filter(
        (item): item is TextHighlight =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as TextHighlight).start === "number" &&
          typeof (item as TextHighlight).end === "number",
      ),
    );
  } catch {
    return [];
  }
}

export function readHighlights(
  storage: StorageLike | null | undefined,
  articleId: string | number,
): TextHighlight[] {
  try {
    return parseStoredHighlights(
      storage?.getItem(highlightStorageKey(articleId)),
    );
  } catch {
    return [];
  }
}

export function writeHighlights(
  storage: StorageLike | null | undefined,
  articleId: string | number,
  list: readonly TextHighlight[],
): void {
  try {
    const key = highlightStorageKey(articleId);
    const merged = mergeHighlights(list);
    if (merged.length === 0) storage?.removeItem(key);
    else storage?.setItem(key, JSON.stringify(merged));
  } catch {
    // Armazenamento indisponível (aba privada, cota cheia): as marcações
    // continuam visíveis até fechar o leitor.
  }
}

export function readReaderTheme(
  storage: StorageLike | null | undefined,
): ReaderTheme {
  try {
    return storage?.getItem(THEME_KEY) === "dark" ? "dark" : "pastel";
  } catch {
    return "pastel";
  }
}

export function writeReaderTheme(
  storage: StorageLike | null | undefined,
  theme: ReaderTheme,
): void {
  try {
    storage?.setItem(THEME_KEY, theme);
  } catch {
    // Preferência só vale nesta visita.
  }
}

/** Acesso seguro ao localStorage (pode lançar em modo privado ou com cookies bloqueados). */
export function safeLocalStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function textNodes(root: Node): Text[] {
  const doc = root.ownerDocument ?? (root as Document);
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

/** Posição (em caracteres de texto) de um ponto do DOM dentro de `root`. */
function offsetOf(root: Node, container: Node, offset: number): number {
  const doc = root.ownerDocument ?? (root as Document);
  const probe = doc.createRange();
  probe.setStart(root, 0);
  probe.setEnd(container, offset);
  return probe.toString().length;
}

/** Converte uma seleção em intervalo de texto relativo a `root`; null se sair dele. */
export function rangeToHighlight(
  root: Node,
  range: Range,
): TextHighlight | null {
  if (
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  ) {
    return null;
  }
  const start = offsetOf(root, range.startContainer, range.startOffset);
  const end = offsetOf(root, range.endContainer, range.endOffset);
  return end > start ? { start, end } : null;
}

/**
 * Pedaços de nós de texto cobertos por um intervalo. Útil tanto para montar
 * um Range quanto para envolver cada pedaço num <mark> (fallback).
 */
export function highlightSegments(
  root: Node,
  highlight: TextHighlight,
): Array<{ node: Text; start: number; end: number }> {
  const segments: Array<{ node: Text; start: number; end: number }> = [];
  let cursor = 0;
  for (const node of textNodes(root)) {
    const length = node.data.length;
    const nodeStart = cursor;
    const nodeEnd = cursor + length;
    cursor = nodeEnd;
    if (nodeEnd <= highlight.start) continue;
    if (nodeStart >= highlight.end) break;
    const start = Math.max(0, highlight.start - nodeStart);
    const end = Math.min(length, highlight.end - nodeStart);
    if (end > start) segments.push({ node, start, end });
  }
  return segments;
}

export function highlightToRange(
  root: Node,
  highlight: TextHighlight,
): Range | null {
  const segments = highlightSegments(root, highlight);
  if (segments.length === 0) return null;
  const doc = root.ownerDocument ?? (root as Document);
  const range = doc.createRange();
  const first = segments[0];
  const last = segments[segments.length - 1];
  range.setStart(first.node, first.start);
  range.setEnd(last.node, last.end);
  return range;
}
