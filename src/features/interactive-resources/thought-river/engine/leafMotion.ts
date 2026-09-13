import type { RiverLeaf } from "../types";

export const MIN_LEAF_DURATION_MS = 20_000;
export const MAX_LEAF_DURATION_MS = 40_000;

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1)
    result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return result >>> 0;
}

export function makeLeaf(
  id: string,
  text: string,
  createdAt: number,
): RiverLeaf {
  const seed = hash(id);
  return {
    id,
    text,
    createdAt,
    durationMs:
      MIN_LEAF_DURATION_MS +
      (seed % (MAX_LEAF_DURATION_MS - MIN_LEAF_DURATION_MS + 1)),
    progress: 0,
    lane: ((seed >>> 8) % 1000) / 1000,
    wobble: ((seed >>> 18) % 1000) / 1000,
  };
}

export function advanceLeaf(leaf: RiverLeaf, deltaMs: number): RiverLeaf {
  return {
    ...leaf,
    progress: Math.min(
      1,
      leaf.progress + Math.max(0, Math.min(deltaMs, 1000)) / leaf.durationMs,
    ),
  };
}

export function leafPosition(leaf: RiverLeaf, width: number, height: number) {
  const wave =
    Math.sin(leaf.progress * Math.PI * 4 + leaf.wobble * Math.PI * 2) *
    Math.min(width * 0.075, 28);
  return {
    x: width * (0.14 + leaf.lane * 0.72) + wave,
    y: -20 + leaf.progress * (height + 40),
    rotation: wave / 18,
  };
}
