import type { RiverLeaf } from "../types";
import { advanceLeaf } from "./leafMotion";

export function advanceScene(leaves: RiverLeaf[], deltaMs: number) {
  const advanced = leaves.map((leaf) => advanceLeaf(leaf, deltaMs));
  return {
    active: advanced.filter((leaf) => leaf.progress < 1),
    exited: advanced.filter((leaf) => leaf.progress >= 1),
  };
}
