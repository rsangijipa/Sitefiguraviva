import React, { useEffect, useState } from "react";
import { BodyData, RecommendationResponse } from "../types";
import BodyMap from "./BodyMap";
import { generateRecommendation } from "../services/bodyScanService";
import { RefreshCcw, Droplet, Sun, Wind } from "lucide-react";

interface ResultsProps {
  data: BodyData;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ data, onRestart }) => {
  const [insight, setInsight] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const recordedRegions = Object.values(data).filter(Boolean);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const result = await generateRecommendation(data);
        setInsight(result);
      } catch (error) {
        console.error("Failed to generate insight", error);
        setInsight({
          summary: "Scan completo.",
          recommendation: "Respire fundo e beba um pouco de água.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [data]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 animate-fade-in overflow-y-auto">
      <div className="text-center mb-8 mt-4">
        <h2 className="text-4xl font-serif italic text-stone-800">
          Seu Mapa Corporal
        </h2>
        <div className="w-12 h-1 bg-clay mx-auto mt-4 rounded-full opacity-50"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center justify-center flex-1">
        {/* Visual Map */}
        <div className="w-full max-w-xs h-[450px] bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
          <BodyMap
            data={data}
            selectedPart={null}
            onSelectPart={() => {}}
            readOnly={true}
          />
        </div>

        {/* Local recommendation card */}
        <div className="w-full max-w-md space-y-8">
          {loading ? (
            <div
              className="space-y-6 animate-pulse"
              role="status"
              aria-live="polite"
              aria-label="Preparando leitura reflexiva"
            >
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
              <div className="h-24 bg-stone-200 rounded-xl w-full"></div>
              <div className="h-12 bg-stone-200 rounded-full w-1/2 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <span className="text-clay text-xs font-bold tracking-[0.2em] uppercase">
                  Observação
                </span>
                <p className="text-2xl font-serif text-stone-700 leading-snug">
                  {insight?.summary}
                </p>
              </div>

              <div className="bg-[#f0fdf4] border border-sage/20 p-8 rounded-[2rem] relative overflow-hidden">
                {/* Decorative Circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-sage/10 rounded-full blur-2xl"></div>

                <span className="text-sage text-xs font-bold tracking-[0.2em] uppercase block mb-3">
                  Sugestão
                </span>
                <p className="text-lg text-stone-600 font-light leading-relaxed">
                  {insight?.recommendation}
                </p>
                <p className="mt-4 text-xs leading-relaxed text-stone-500">
                  Esta leitura é apenas reflexiva, não é diagnóstico. Procure
                  atendimento profissional diante de sintomas intensos, súbitos
                  ou persistentes.
                </p>
                <div className="flex gap-6 mt-8 text-sm text-stone-500 border-t border-sage/20 pt-6">
                  <span className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-ocean" /> Hidrate-se
                  </span>
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-ochre" /> Acolhimento
                  </span>
                  <span className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sage" /> Respire
                  </span>
                </div>
              </div>
            </>
          )}

          <section
            aria-labelledby="recorded-regions-title"
            className="border-t border-stone-200 pt-5"
          >
            <h3
              id="recorded-regions-title"
              className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500"
            >
              Regiões registradas
            </h3>
            {recordedRegions.length ? (
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {recordedRegions.map((region) => (
                  <li
                    key={region.id}
                    className="flex justify-between gap-4 border-b border-stone-100 pb-2"
                  >
                    <span>{region.label}</span>
                    <span className="capitalize">
                      {region.sensation} · {region.intensity}/5
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                Nenhuma região foi registrada neste scan.
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-4 mt-8 flex items-center justify-center gap-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-all border border-transparent hover:border-stone-200 font-medium tracking-wide"
          >
            <RefreshCcw className="w-4 h-4" /> Iniciar Novo Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
