"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Store,
  Briefcase,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Perfil", icon: Briefcase },
  { id: 2, title: "Marketplace", icon: Store },
  { id: 3, title: "Branding", icon: ShieldCheck },
];

export default function ProfessionalOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    professionalName: "",
    niche: "",
    tenantId: "", // Target domain/identifier
    bio: "",
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          Seja um Profissional v2
        </h1>
        <p className="text-stone-500 mt-2">
          Transforme seu conhecimento em um ecossistema digital.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 z-0" />
        {steps.map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                step >= s.id
                  ? "bg-primary text-white"
                  : "bg-white border-2 border-stone-100 text-stone-300",
              )}
            >
              {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider mt-2",
                step >= s.id ? "text-primary" : "text-stone-400",
              )}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-soft-xl animate-in fade-in slide-in-from-bottom-4">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">
              Defina sua identidade
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                  Nome Profissional
                </label>
                <input
                  type="text"
                  className="w-full p-4 rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Dra. Lilian Gusmão"
                  value={formData.professionalName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      professionalName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                  Nicho de Atuação
                </label>
                <input
                  type="text"
                  className="w-full p-4 rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Figurino e Arte"
                  value={formData.niche}
                  onChange={(e) =>
                    setFormData({ ...formData, niche: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">
              Configure seu Marketplace
            </h2>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-4">
              <Store className="text-primary shrink-0" />
              <p className="text-sm text-stone-600">
                Ao configurar seu Marketplace, você poderá vender seus próprios
                cursos e materiais com isolamento total.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                Identificador Unique (Tenant ID)
              </label>
              <div className="flex gap-2">
                <span className="p-4 bg-stone-50 border border-stone-100 rounded-xl text-stone-400 font-mono text-sm">
                  viva.app/
                </span>
                <input
                  type="text"
                  className="flex-1 p-4 rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm"
                  placeholder="seu-nome"
                  value={formData.tenantId}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantId: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-stone-800">
              Pronto para decolar!
            </h2>
            <p className="text-stone-500">
              Ao finalizar, sua conta será atualizada para o plano Profissional
              e seu tenant personalizado será criado.
            </p>
          </div>
        )}

        <div className="mt-10 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm font-bold text-stone-400 hover:text-stone-600"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          <Button
            onClick={
              step === 3 ? () => console.log("Submit", formData) : handleNext
            }
            rightIcon={<ArrowRight size={18} />}
          >
            {step === 3 ? "Finalizar Cadastro" : "Próximo Passo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
