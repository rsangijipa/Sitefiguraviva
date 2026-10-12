"use client";

import { motion } from "motion/react";

import type { ThemeFilter, ThemeOption } from "@/components/resources/apps/emotion-tree/types/quote";

type ThemeFilterProps = {
  themes: ThemeOption[];
  value: ThemeFilter;
  onChange: (theme: ThemeFilter) => void;
};

export function ThemeFilter({ themes, value, onChange }: ThemeFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Tema das mensagens"
      className="hud-scroller flex items-center gap-1.5 whitespace-nowrap pr-3 pb-0.5"
    >
      <FilterChip
        label="Todos"
        active={value === "all"}
        onClick={() => onChange("all")}
        color="#D8CFBE"
      />
      {themes.map((theme) => (
        <FilterChip
          key={theme.slug}
          label={theme.label}
          active={value === theme.slug}
          onClick={() => onChange(theme.slug)}
          color={theme.color}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="relative h-8 shrink-0 rounded-full px-3.5 text-[11px] font-semibold tracking-[0.08em] transition"
      style={{
        border: `1px solid ${active ? `${color}70` : "rgb(241 233 219 / 0.14)"}`,
        background: active ? `${color}2E` : "rgb(253 250 244 / 0.04)",
        color: active ? "#FDFAF4" : "#D8CFBE",
        boxShadow: "none",
      }}
    >
      {/* ponto de cor: identifica o tema mesmo quando o chip esta inativo */}
      <span
        aria-hidden
        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
        style={{ background: color, opacity: active ? 1 : 0.5 }}
      />
      {label}
    </motion.button>
  );
}
