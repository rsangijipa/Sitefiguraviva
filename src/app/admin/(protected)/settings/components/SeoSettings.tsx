"use client";

import { Save, Globe } from "lucide-react";

interface SeoSettingsProps {
  seoForm: any;
  setSeoForm: (value: any) => void;
  handleSeoSave: () => Promise<void>;
  loading: boolean;
}

export default function SeoSettings({
  seoForm,
  setSeoForm,
  handleSeoSave,
  loading,
}: SeoSettingsProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-4xl animate-fade-in-up space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-50 rounded-lg text-primary">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-primary">
              SEO & Motores de Busca
            </h3>
            <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
              Configurações globais de visibilidade
            </p>
          </div>
        </div>
        <button
          onClick={handleSeoSave}
          disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors shadow-lg shadow-primary/10"
        >
          <Save size={16} /> Salvar SEO
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
              Título Padrão (Meta Title)
            </label>
            <input
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl focus:bg-white focus:border-gold transition-all outline-none"
              value={seoForm.defaultTitle || ""}
              onChange={(e) =>
                setSeoForm({ ...seoForm, defaultTitle: e.target.value })
              }
              placeholder="Ex: Instituto Figura Viva | Gestalt-Terapia"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
              Descrição Padrão (Meta Description)
            </label>
            <textarea
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl h-32 focus:bg-white focus:border-gold transition-all outline-none resize-none"
              value={seoForm.defaultDescription || ""}
              onChange={(e) =>
                setSeoForm({
                  ...seoForm,
                  defaultDescription: e.target.value,
                })
              }
              placeholder="Descreva o instituto em poucas palavras para o Google..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
              Palavras-chave (Keywords)
            </label>
            <textarea
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl h-24 focus:bg-white focus:border-gold transition-all outline-none resize-none text-sm"
              value={
                Array.isArray(seoForm.keywords)
                  ? seoForm.keywords.join(", ")
                  : seoForm.keywords || ""
              }
              onChange={(e) =>
                setSeoForm({ ...seoForm, keywords: e.target.value })
              }
              placeholder="gestalt, psicologia, formação, rondônia..."
            />
            <p className="mt-2 text-[9px] text-stone-400 uppercase font-bold tracking-widest">
              Separe por vírgulas
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
              OG Image URL (Social Share)
            </label>
            <input
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl focus:bg-white focus:border-gold transition-all outline-none text-xs"
              value={seoForm.ogImage || ""}
              onChange={(e) =>
                setSeoForm({ ...seoForm, ogImage: e.target.value })
              }
              placeholder="https://..."
            />
            {seoForm.ogImage && (
              <div className="mt-4 relative aspect-[1.91/1] w-full rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                <img
                  src={seoForm.ogImage}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
              Google Analytics ID (G-XXXXXXX)
            </label>
            <input
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl focus:bg-white focus:border-gold transition-all outline-none text-xs"
              value={seoForm.googleAnalyticsId || ""}
              onChange={(e) =>
                setSeoForm({
                  ...seoForm,
                  googleAnalyticsId: e.target.value,
                })
              }
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
