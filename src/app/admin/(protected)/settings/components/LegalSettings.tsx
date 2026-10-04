"use client";

import { Save, Plus, Trash2, FileText } from "lucide-react";

interface LegalSettingsProps {
  legalForm: any;
  setLegalForm: (value: any) => void;
  handleLegalSave: () => Promise<void>;
  loading: boolean;
}

export default function LegalSettings({
  legalForm,
  setLegalForm,
  handleLegalSave,
  loading,
}: LegalSettingsProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-2xl text-primary">
          Políticas Legais (SSoT)
        </h3>
        <button
          onClick={handleLegalSave}
          disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
        >
          <Save size={16} /> Salvar Tudo
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* PRIVACY */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-stone-50 rounded-lg text-gold">
              <Save size={20} />
            </div>
            <h4 className="font-serif text-xl text-primary">
              Política de Privacidade
            </h4>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
              Título do Modal
            </label>
            <input
              className="w-full p-3 bg-stone-50 border rounded-lg"
              value={legalForm?.privacy?.title || ""}
              onChange={(e) =>
                setLegalForm({
                  ...legalForm,
                  privacy: { ...legalForm.privacy, title: e.target.value },
                })
              }
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
              Última Atualização
            </label>
            <input
              className="w-full p-3 bg-stone-50 border rounded-lg"
              value={legalForm?.privacy?.lastUpdated || ""}
              onChange={(e) =>
                setLegalForm({
                  ...legalForm,
                  privacy: {
                    ...legalForm.privacy,
                    lastUpdated: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40">
              Seções do Conteúdo
            </label>
            {(legalForm?.privacy?.content || []).map(
              (section: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-stone-50 border rounded-xl space-y-2 relative group"
                >
                  <input
                    className="w-full bg-white border-none text-sm font-bold text-primary focus:ring-0 rounded-md"
                    value={section.heading}
                    onChange={(e) => {
                      const newContent = [...legalForm.privacy.content];
                      newContent[idx].heading = e.target.value;
                      setLegalForm({
                        ...legalForm,
                        privacy: {
                          ...legalForm.privacy,
                          content: newContent,
                        },
                      });
                    }}
                    placeholder="Título da Seção"
                  />
                  <textarea
                    className="w-full bg-white border-none text-xs text-primary/60 focus:ring-0 rounded-md min-h-[60px]"
                    value={section.text}
                    onChange={(e) => {
                      const newContent = [...legalForm.privacy.content];
                      newContent[idx].text = e.target.value;
                      setLegalForm({
                        ...legalForm,
                        privacy: {
                          ...legalForm.privacy,
                          content: newContent,
                        },
                      });
                    }}
                    placeholder="Texto da Seção"
                  />
                  <button
                    onClick={() => {
                      const newContent = legalForm.privacy.content.filter(
                        (_: any, i: number) => i !== idx,
                      );
                      setLegalForm({
                        ...legalForm,
                        privacy: {
                          ...legalForm.privacy,
                          content: newContent,
                        },
                      });
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ),
            )}
            <button
              onClick={() => {
                const newContent = [
                  ...(legalForm?.privacy?.content || []),
                  { heading: "Nova Seção", text: "" },
                ];
                setLegalForm({
                  ...legalForm,
                  privacy: { ...legalForm.privacy, content: newContent },
                });
              }}
              className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Adicionar Seção
            </button>
          </div>
        </div>

        {/* TERMS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-stone-50 rounded-lg text-gold">
              <FileText size={20} />
            </div>
            <h4 className="font-serif text-xl text-primary">Termos de Uso</h4>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
              Título do Modal
            </label>
            <input
              className="w-full p-3 bg-stone-50 border rounded-lg"
              value={legalForm?.terms?.title || ""}
              onChange={(e) =>
                setLegalForm({
                  ...legalForm,
                  terms: { ...legalForm.terms, title: e.target.value },
                })
              }
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
              Última Atualização
            </label>
            <input
              className="w-full p-3 bg-stone-50 border rounded-lg"
              value={legalForm?.terms?.lastUpdated || ""}
              onChange={(e) =>
                setLegalForm({
                  ...legalForm,
                  terms: {
                    ...legalForm.terms,
                    lastUpdated: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40">
              Seções do Conteúdo
            </label>
            {(legalForm?.terms?.content || []).map(
              (section: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-stone-50 border rounded-xl space-y-2 relative group"
                >
                  <input
                    className="w-full bg-white border-none text-sm font-bold text-primary focus:ring-0 rounded-md"
                    value={section.heading}
                    onChange={(e) => {
                      const newContent = [...legalForm.terms.content];
                      newContent[idx].heading = e.target.value;
                      setLegalForm({
                        ...legalForm,
                        terms: { ...legalForm.terms, content: newContent },
                      });
                    }}
                    placeholder="Título da Seção"
                  />
                  <textarea
                    className="w-full bg-white border-none text-xs text-primary/60 focus:ring-0 rounded-md min-h-[60px]"
                    value={section.text}
                    onChange={(e) => {
                      const newContent = [...legalForm.terms.content];
                      newContent[idx].text = e.target.value;
                      setLegalForm({
                        ...legalForm,
                        terms: { ...legalForm.terms, content: newContent },
                      });
                    }}
                    placeholder="Texto da Seção"
                  />
                  <button
                    onClick={() => {
                      const newContent = legalForm.terms.content.filter(
                        (_: any, i: number) => i !== idx,
                      );
                      setLegalForm({
                        ...legalForm,
                        terms: { ...legalForm.terms, content: newContent },
                      });
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ),
            )}
            <button
              onClick={() => {
                const newContent = [
                  ...(legalForm?.terms?.content || []),
                  { heading: "Nova Seção", text: "" },
                ];
                setLegalForm({
                  ...legalForm,
                  terms: { ...legalForm.terms, content: newContent },
                });
              }}
              className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Adicionar Seção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
