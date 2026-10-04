"use client";

import { useState, useId, useEffect, useRef } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { getImageSrc } from "@/lib/imageUtils";
import { uploadAdminAsset } from "@/infrastructure/supabase/storage.client";

interface ImageUploadProps {
  onUpload: (url: string, path: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  folder?: string;
  bucket?: string;
  defaultImage?: string;
  className?: string;
}

export default function ImageUpload({
  onUpload,
  onUploadingChange,
  folder = "uploads/admin",
  bucket,
  defaultImage,
  className = "",
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    getImageSrc(defaultImage, "") || null,
  );
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setPreview(getImageSrc(defaultImage, "") || null);
  }, [defaultImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Basic Validation
    if (!file.type.startsWith("image/")) {
      setError("Apenas arquivos de imagem são permitidos.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const result = await uploadAdminAsset(file, {
        folder,
        bucket,
        kind: "image",
        maxBytes: 5 * 1024 * 1024,
        mimeTypes: ["image/png", "image/jpeg", "image/webp"],
      });

      setPreview(result.url);
      onUpload(result.url, result.path);
    } catch (err: any) {
      console.error("Upload failed", err);
      setError(
        err instanceof Error
          ? err.message
          : "Falha no upload. Tente novamente.",
      );
      setPreview(getImageSrc(defaultImage, "") || null);
    } finally {
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onUpload("", ""); // Clear in parent
    const input = inputRef.current;
    if (input) input.value = "";
  };

  return (
    <div className={`relative ${className || "h-40 w-full"}`}>
      {preview ? (
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-stone-200 group">
          <div className="relative h-full w-full bg-stone-100">
            <Image
              src={preview}
              unoptimized
              onError={() => {
                setPreview(null);
                setError(
                  "Não foi possível carregar a foto. Envie uma nova imagem.",
                );
              }}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <button
            type="button"
            onClick={clearImage}
            disabled={uploading}
            aria-label="Remover imagem"
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`
                    absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors
                    ${error ? "border-red-300 bg-red-50" : ""}
                `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary/40 animate-spin mb-3" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-stone-400 mb-3" />
                <p className="mb-2 text-sm text-stone-500">
                  <span className="font-bold">Clique para upload</span> ou
                  arraste
                </p>
                <p className="text-xs text-stone-400">
                  PNG, JPG ou WEBP (máx. 5 MB)
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  A imagem será compactada automaticamente.
                </p>
              </>
            )}
          </div>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            disabled={uploading}
          />
        </label>
      )}
      {error && <p className="mt-2 text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}
