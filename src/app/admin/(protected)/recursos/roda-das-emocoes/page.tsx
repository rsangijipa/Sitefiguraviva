"use client";

import React, { useState } from "react";
import { initialEmotionFamilies } from "@/features/interactive-resources/emotion-wheel/content";
import { Sparkles, Save, Check } from "lucide-react";

export default function AdminRodaDasEmocoesPage() {
  const [families, setFamilies] = useState(initialEmotionFamilies);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
            <Sparkles size={14} aria-hidden="true" /> Gestão de Conteúdo
            Editorial
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            Admin · Roda das Emoções
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Gerencie famílias, nuances, descrições, exemplos e perguntas
            editoriais.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-emerald-800 text-white rounded-xl font-bold text-sm hover:bg-emerald-900 transition inline-flex items-center gap-2"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? "Publicado com Sucesso" : "Publicar Versão"}
        </button>
      </div>

      <div className="space-y-6">
        {families.map((fam, fIdx) => (
          <div
            key={fam.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-emerald-900">
                Família: {fam.name}
              </h2>
              <span className="text-xs font-mono text-stone-400">
                ID: {fam.id}
              </span>
            </div>
            <p className="text-sm text-stone-600">{fam.description}</p>

            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Nuances
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fam.nuances.map((nuance, nIdx) => (
                  <div
                    key={nuance.id}
                    className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2"
                  >
                    <input
                      type="text"
                      value={nuance.label}
                      onChange={(e) => {
                        const next = [...families];
                        next[fIdx].nuances[nIdx].label = e.target.value;
                        setFamilies(next);
                      }}
                      className="w-full font-bold text-stone-900 bg-white border border-stone-200 rounded-lg p-2 text-sm"
                    />
                    <textarea
                      rows={2}
                      value={nuance.description}
                      onChange={(e) => {
                        const next = [...families];
                        next[fIdx].nuances[nIdx].description = e.target.value;
                        setFamilies(next);
                      }}
                      className="w-full text-xs text-stone-700 bg-white border border-stone-200 rounded-lg p-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
