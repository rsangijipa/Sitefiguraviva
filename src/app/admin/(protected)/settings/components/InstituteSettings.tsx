"use client";

import { Save } from "lucide-react";

interface InstituteSettingsProps {
  instituteForm: any;
  setInstituteForm: (value: any) => void;
  handleInstituteSave: () => Promise<void>;
  loading: boolean;
}

export default function InstituteSettings({
  instituteForm,
  setInstituteForm,
  handleInstituteSave,
  loading,
}: InstituteSettingsProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-4xl animate-fade-in-up">
      <h3 className="font-serif text-2xl text-primary mb-6">
        Editar Instituto
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Título Principal
            </label>
            <input
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
              value={instituteForm.title || ""}
              onChange={(e) =>
                setInstituteForm({
                  ...instituteForm,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Subtítulo
            </label>
            <textarea
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-24"
              value={instituteForm.subtitle || ""}
              onChange={(e) =>
                setInstituteForm({
                  ...instituteForm,
                  subtitle: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Endereço
            </label>
            <input
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
              value={instituteForm.address || ""}
              onChange={(e) =>
                setInstituteForm({
                  ...instituteForm,
                  address: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Telefone
            </label>
            <input
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
              value={instituteForm.phone || ""}
              onChange={(e) =>
                setInstituteForm({
                  ...instituteForm,
                  phone: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Título do Manifesto
            </label>
            <input
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
              value={instituteForm.manifesto_title || ""}
              onChange={(e) =>
                setInstituteForm({
                  ...instituteForm,
                  manifesto_title: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Texto do Manifesto
            </label>
            <textarea
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-40"
              value={instituteForm.manifesto_text || ""}
              onChange={(e) =>
                setInstituteForm({
                  ...instituteForm,
                  manifesto_text: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Frase de Destaque (Quote)
            </label>
            <input
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
              value={instituteForm.quote || ""}
              onChange={(e) =>
                setInstituteForm({
                  ...instituteForm,
                  quote: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-stone-100">
        <button
          onClick={handleInstituteSave}
          disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
        >
          <Save size={16} /> Salvar Instituto
        </button>
      </div>
    </div>
  );
}
