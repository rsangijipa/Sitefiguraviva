"use client";

import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface FileUploadProps {
    onUpload: (data: { url: string, path: string, name: string, size: string }) => void;
    defaultFile?: string; // URL
    defaultName?: string;
    className?: string;
    folder?: string; // e.g., "documents" or "public/docs"
}

export default function FileUpload({ onUpload, defaultFile, defaultName, className = "", folder = "documents" }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<{ url: string, name: string } | null>(
        defaultFile ? { url: defaultFile, name: defaultName || 'Arquivo Atual' } : null
    );
    const inputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.type !== 'application/pdf') {
            setError('Apenas arquivos PDF são permitidos.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
            setError('O arquivo deve ter no máximo 10MB.');
            return;
        }

        setError('');
        setUploading(true);
        setProgress(0);

        try {
            // Path: {folder}/{timestamp}-{filename}
            const path = `${folder}/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(p);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setError('Falha no upload. Tente novamente.');
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const sizeStr = formatSize(file.size);

                    setPreview({ url: downloadURL, name: file.name });
                    onUpload({
                        url: downloadURL,
                        path: path,
                        name: file.name,
                        size: sizeStr
                    });
                    setUploading(false);
                }
            );

        } catch (err) {
            console.error(err);
            setError('Erro inesperado.');
            setUploading(false);
        }
    };

    const clearFile = () => {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        // Note: We don't delete from storage here automatically to avoid accidental data loss 
        // if user cancels edit. Cleanup should happen on document delete.
        onUpload({ url: '', path: '', name: '', size: '' });
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
                            <p className="text-sm font-bold text-primary truncate">{preview.name}</p>
                            <a href={preview.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary/60 hover:text-gold hover:underline">
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
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gold hover:bg-gold/5'
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
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="transform -rotate-90 w-full h-full">
                                    <circle cx="24" cy="24" r="20" stroke="#eee" strokeWidth="4" fill="none" />
                                    <circle cx="24" cy="24" r="20" stroke="#C5A059" strokeWidth="4" fill="none"
                                        strokeDasharray={125.6}
                                        strokeDashoffset={125.6 - (125.6 * progress) / 100}
                                        className="transition-[stroke-dashoffset] duration-300 ease-out"
                                    />
                                </svg>
                                <span className="absolute text-[10px] font-bold text-primary">{Math.round(progress)}%</span>
                            </div>
                            <p className="text-xs font-bold text-primary animate-pulse">Enviando PDF...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-gold transition-colors">
                            <Upload size={32} />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-primary">Clique para enviar PDF</p>
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
