"use client";

import { Save, User, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface FounderSettingsProps {
  founderForm: any;
  setFounderForm: (value: any) => void;
  handleFounderSave: () => Promise<void>;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "founder" | "team",
  ) => Promise<void>;
  uploading: boolean;
  loading: boolean;
}

export default function FounderSettings({
  founderForm,
  setFounderForm,
  handleFounderSave,
  handleFileUpload,
  uploading,
  loading,
}: FounderSettingsProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-2xl animate-fade-in-up">
      <h3 className="font-serif text-2xl text-primary mb-6">
        Editar Fundadora
      </h3>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
            Nome
          </label>
          <input
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
            value={founderForm.name || ""}
            onChange={(e) =>
              setFounderForm({ ...founderForm, name: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
            Papel/Cargo
          </label>
          <input
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
            value={founderForm.role || ""}
            onChange={(e) =>
              setFounderForm({ ...founderForm, role: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
            Bio
          </label>
          <textarea
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-32"
            value={founderForm.bio || ""}
            onChange={(e) =>
              setFounderForm({ ...founderForm, bio: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
            Link Lattes
          </label>
          <input
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
            value={founderForm.link || ""}
            onChange={(e) =>
              setFounderForm({ ...founderForm, link: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
            Foto da Fundadora
          </label>
          <div className="flex gap-6 items-start">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 border relative group">
              {founderForm.image ? (
                <div className="w-full h-full relative">
                  <Image
                    src={founderForm.image}
                    alt="Founder"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() =>
                      setFounderForm({ ...founderForm, image: "" })
                    }
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <User size={32} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e, "founder")}
                disabled={uploading}
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-stone-500 mb-2">
                Clique na imagem para alterar a foto (Upload).
              </p>
              <input
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                value={founderForm.image || ""}
                onChange={(e) =>
                  setFounderForm({ ...founderForm, image: e.target.value })
                }
                placeholder="Ou cole uma URL aqui..."
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleFounderSave}
          disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
        >
          <Save size={16} /> Salvar Alterações
        </button>
      </div>
    </div>
  );
}
