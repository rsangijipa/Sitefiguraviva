"use client";

import { useState, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import { Upload, FileText, X, Loader2, CheckCircle } from "@/components/icons";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUpload: (fileUrl: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  currentFileUrl?: string;
}

export default function FileUploader({
  onUpload,
  acceptedTypes = [".pdf", ".doc", ".docx", ".jpg", ".png", ".mp4"],
  maxSizeMB = 10,
  currentFileUrl,
}: FileUploaderProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(currentFileUrl || "");
  const [fileName, setFileName] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      addToast(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`, "error");
      return;
    }

    // Validate file type
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExt)) {
      addToast(
        `Tipo de arquivo não permitido. Aceitos: ${acceptedTypes.join(", ")}`,
        "error",
      );
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setFileUrl(data.fileUrl);
      onUpload(data.fileUrl);
      addToast("Arquivo enviado com sucesso!", "success");
    } catch (error) {
      console.error("Upload Error:", error);
      addToast("Erro ao enviar arquivo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFileUrl("");
    setFileName("");
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (fileUrl) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <div>
            <div className="font-bold text-green-800 text-sm">
              Arquivo enviado
            </div>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline"
            >
              {fileName || "Visualizar arquivo"}
            </a>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-700"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "w-full p-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3",
          uploading
            ? "border-primary bg-primary/5"
            : "border-stone-300 hover:border-primary hover:bg-primary/5",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin text-primary" size={32} />
            <div className="text-sm font-bold text-primary">Enviando...</div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload size={24} />
            </div>
            <div>
              <div className="font-bold text-stone-800">
                Clique para enviar arquivo
              </div>
              <div className="text-xs text-stone-500 mt-1">
                Máximo {maxSizeMB}MB • {acceptedTypes.join(", ")}
              </div>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
