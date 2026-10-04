"use client";

import { Save, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigSettingsProps {
  configForm: any;
  setConfigForm: (value: any) => void;
  handleConfigSave: () => Promise<void>;
  loading: boolean;
}

export default function ConfigSettings({
  configForm,
  setConfigForm,
  handleConfigSave,
  loading,
}: ConfigSettingsProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-4xl animate-fade-in-up space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-50 rounded-lg text-primary">
            <Plus size={20} />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-primary">
              Configurações de Visual & Leads
            </h3>
            <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
              Personalize a experiência do usuário
            </p>
          </div>
        </div>
        <button
          onClick={handleConfigSave}
          disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors shadow-lg shadow-primary/10"
        >
          <Save size={16} /> Salvar Configurações
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Visual Column */}
        <div className="space-y-8">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gold border-b border-stone-100 pb-2">
            Ambiente e Efeitos
          </h4>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-primary">
                Partículas de Ouro
              </p>
              <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
                Efeito visual de poeira dourada no fundo
              </p>
            </div>
            <button
              onClick={() =>
                setConfigForm({
                  ...configForm,
                  enableParticles: !configForm.enableParticles,
                })
              }
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                configForm.enableParticles ? "bg-gold" : "bg-stone-200",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  configForm.enableParticles ? "left-7" : "left-1",
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-primary">
                Controle de Áudio
              </p>
              <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
                Exibir botão de música meditativa
              </p>
            </div>
            <button
              onClick={() =>
                setConfigForm({
                  ...configForm,
                  showAudioControl: !configForm.showAudioControl,
                })
              }
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                configForm.showAudioControl !== false
                  ? "bg-gold"
                  : "bg-stone-200",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  configForm.showAudioControl !== false ? "left-7" : "left-1",
                )}
              />
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-4">
              Modo Visual
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["modern", "classic"].map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    setConfigForm({ ...configForm, visualMode: mode })
                  }
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    configForm.visualMode === mode
                      ? "border-gold bg-gold/5 text-gold"
                      : "border-stone-100 text-stone-400",
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {mode === "modern" ? "Moderno (Glass)" : "Clássico"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads Column */}
        <div className="space-y-8">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gold border-b border-stone-100 pb-2">
            Captação de Leads (WhatsApp)
          </h4>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
              Número do WhatsApp
            </label>
            <input
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:bg-white focus:border-gold transition-all"
              placeholder="Ex: 5569992481585"
              value={configForm.whatsappNumber || ""}
              onChange={(e) =>
                setConfigForm({
                  ...configForm,
                  whatsappNumber: e.target.value,
                })
              }
            />
            <p className="mt-2 text-[9px] text-stone-400 uppercase font-bold px-2 italic">
              Apenas números (DDI + DDD + Telefone)
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
              Mensagem Pré-definida
            </label>
            <textarea
              className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl h-32 outline-none focus:bg-white focus:border-gold transition-all resize-none"
              placeholder="Olá, gostaria de saber mais..."
              value={configForm.whatsappMessage || ""}
              onChange={(e) =>
                setConfigForm({
                  ...configForm,
                  whatsappMessage: e.target.value,
                })
              }
            />
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl italic text-xs text-primary/60">
            Ao clicar no botão de suporte, o usuário será direcionado para este
            número com a mensagem configurada acima.
          </div>
        </div>
      </div>
    </div>
  );
}
