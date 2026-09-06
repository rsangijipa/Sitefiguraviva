"use client";

import { createSupabaseBrowserClient } from "./client";

const STORAGE_BUCKET = "uploads";
const DEFAULT_FOLDER = "uploads/admin";

type UploadKind = "generic" | "image" | "pdf";

interface UploadAdminAssetOptions {
  folder?: string;
  maxBytes?: number;
  mimeTypes?: string[];
  kind?: UploadKind;
}

interface UploadAdminAssetResult {
  url: string;
  path: string;
  name: string;
  size: string;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]/g, "_")
    .replace(/_{2,}/g, "_");
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);

  return `${parseFloat(value.toFixed(2))} ${units[unitIndex]}`;
}

function describeKind(kind: UploadKind) {
  if (kind === "image") return "imagem";
  if (kind === "pdf") return "arquivo PDF";
  return "arquivo";
}

function validateUploadFile(
  file: File,
  options: Required<
    Pick<UploadAdminAssetOptions, "kind" | "maxBytes" | "mimeTypes">
  >,
) {
  if (!options.mimeTypes.includes(file.type)) {
    if (options.kind === "image") {
      throw new Error("Apenas arquivos de imagem são permitidos.");
    }

    if (options.kind === "pdf") {
      throw new Error("Apenas arquivos PDF são permitidos.");
    }

    throw new Error(
      `Apenas arquivos ${options.mimeTypes.join(", ")} são permitidos.`,
    );
  }

  if (file.size > options.maxBytes) {
    throw new Error(
      `A ${describeKind(options.kind)} deve ter no máximo ${formatFileSize(options.maxBytes)}.`,
    );
  }
}

function buildStoragePath(folder: string, fileName: string) {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  const cleanName = sanitizeFileName(fileName);
  const uniquePrefix =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return cleanFolder
    ? `${cleanFolder}/${uniquePrefix}-${cleanName}`
    : `${uniquePrefix}-${cleanName}`;
}

export async function uploadAdminAsset(
  file: File,
  options: UploadAdminAssetOptions = {},
): Promise<UploadAdminAssetResult> {
  const normalizedOptions = {
    folder: options.folder ?? DEFAULT_FOLDER,
    maxBytes: options.maxBytes ?? 0,
    mimeTypes: options.mimeTypes ?? [],
    kind: options.kind ?? "generic",
  } as const;

  validateUploadFile(file, normalizedOptions);

  const path = buildStoragePath(normalizedOptions.folder, file.name);
  const supabase = createSupabaseBrowserClient();
  const storage = supabase.storage.from(STORAGE_BUCKET);
  const { error } = await storage.upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = storage.getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    name: file.name,
    size: formatFileSize(file.size),
  };
}
