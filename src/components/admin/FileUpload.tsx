"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { uploadAdminAsset } from "@/infrastructure/supabase/storage.client";

interface FileUploadProps {
  onUpload: (data: {
    url: string;
    path: string;
    name: string;
    size: string;
  }) => void;
  defaultFile?: string; // URL
  defaultName?: string;
  className?: string;
  folder?: string; // e.g., "documents" or "public/docs"
}

export default function FileUpload({
  onUpload,
  defaultFile,
  defaultName,
  className = "",
  folder = "documents",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(
    defaultFile
      ? { url: defaultFile, name: defaultName || "Arquivo Atual" }
      : null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são permitidos.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      setError("O arquivo deve ter no máximo 10MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const result = await uploadAdminAsset(file, {
        folder,
        kind: "pdf",
        maxBytes: 10 * 1024 * 1024,
        mimeTypes: ["application/pdf"],
      });

      setPreview({ url: result.url, name: file.name });
      onUpload({
        url: result.url,
        path: result.path,
        name: result.name,
        size: result.size,
      });
    } catch (err) {
      console.error(err);
      setError("Erro inesperado.");
    }

    setUploading(false);
  };

  const clearFile = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    // Note: We don't delete from storage here automatically to avoid accidental data loss
    // if user cancels edit. Cleanup should happen on document delete.
    onUpload({ url: "", path: "", name: "", size: "" });
  };

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary truncate">
                {preview.name}
              </p>
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary/60 hover:text-gold hover:underline"
              >
                Ver Arquivo
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
            title="Remover arquivo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gold hover:bg-gold/5"
          }`}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
              <p className="text-xs font-bold text-primary animate-pulse">
                Enviando PDF...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-gold transition-colors">
              <Upload size={32} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">
                  Clique para enviar PDF
                </p>
                <p className="text-[10px]">Max 10MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
          <X size={10} /> {error}
        </p>
      )}
    </div>
  );
}
