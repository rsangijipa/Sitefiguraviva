"use client";

import React from "react";
import {
  TrendingDown,
  Users,
  Clock,
  Award,
  BarChart3,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockStats = [
  {
    label: "Estudantes Ativos",
    value: "1,284",
    icon: Users,
    change: "+12%",
    trend: "up",
  },
  {
    label: "Taxa de Completude",
    value: "64%",
    icon: Award,
    change: "-3%",
    trend: "down",
  },
  {
    label: "Tempo Médio/Aula",
    value: "18m",
    icon: Clock,
    change: "+5%",
    trend: "up",
  },
  {
    label: "Drop-off Crítico",
    value: "Módulo 2",
    icon: TrendingDown,
    change: "Ação req.",
    trend: "neutral",
  },
];

const dropOffData = [
  { lesson: "Introdução", count: 1200, percentage: 100 },
  { lesson: "Teoria das Cores", count: 1100, percentage: 91 },
  { lesson: "Composição Avançada", count: 850, percentage: 70 },
  { lesson: "Iluminação Natural", count: 420, percentage: 35 }, // Critical drop-off
  { lesson: "Pós-processamento", count: 380, percentage: 31 },
  { lesson: "Projeto Final", count: 310, percentage: 25 },
];

export default function AdminDropOffDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Análise de Retenção
        </h1>
        <p className="text-stone-500 text-sm">
          Visualize onde os alunos estão parando e otimize seu conteúdo.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400">
                <stat.icon size={20} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-full",
                  stat.trend === "up"
                    ? "bg-green-50 text-green-600"
                    : stat.trend === "down"
                      ? "bg-red-50 text-red-600"
                      : "bg-stone-50 text-stone-600",
                )}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-stone-800">
              {stat.value}
            </div>
            <div className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Funnel Chart */}
      <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Funil de Conteúdo
          </h2>
          <select className="text-xs font-bold bg-stone-50 border-none rounded-lg p-2 outline-none">
            <option>Curso: Fotografia de Moda</option>
          </select>
        </div>

        <div className="space-y-6">
          {dropOffData.map((item, i) => (
            <div key={i} className="relative">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-stone-700">
                  {item.lesson}
                </span>
                <span className="text-xs text-stone-400">
                  {item.count} alunos ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    item.percentage < 40 ? "bg-red-400" : "bg-primary",
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              {/* Drop-off Indicator */}
              {i > 0 &&
                dropOffData[i - 1].percentage - item.percentage > 20 && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-red-500 animate-pulse">
                    <ArrowDownRight size={14} />
                    <span className="text-[10px] font-bold uppercase">
                      Queda Bruta
                    </span>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
