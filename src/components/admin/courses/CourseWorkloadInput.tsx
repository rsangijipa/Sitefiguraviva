"use client";
export default function CourseWorkloadInput({ value, onChange }: { value?: number; onChange: (minutes: number | undefined) => void }) {
  return <label className="block text-sm font-semibold">Carga horária total (horas)
    <input type="number" min={0} max={16666} step="any" value={value === undefined ? "" : Math.round(value / 60 * 100) / 100} onChange={e => onChange(e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 60))} className="mt-1 block w-full rounded-xl border border-border bg-paper p-3 text-base text-text" />
    <span className="mt-1 block text-xs font-normal text-muted">Inclua aulas, estudos e atividades. Ex.: 400 horas.</span>
  </label>;
}
