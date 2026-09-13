import type { SoundManifest } from "../types";

export function isPublishableSound(manifest: SoundManifest): boolean {
  return Boolean(
    manifest.file &&
    manifest.mime &&
    manifest.durationSeconds > 0 &&
    manifest.author &&
    manifest.license &&
    manifest.sourceUrl &&
    manifest.sizeBytes > 0 &&
    manifest.version &&
    manifest.hash &&
    manifest.description,
  );
}

export async function loadAudioAsset(
  context: AudioContext,
  manifest: SoundManifest,
): Promise<AudioBuffer> {
  if (!isPublishableSound(manifest)) throw new Error("asset_unavailable");
  const response = await fetch(manifest.file);
  if (!response.ok) throw new Error("asset_unavailable");
  return context.decodeAudioData(await response.arrayBuffer());
}
