"use client";
import { useId, useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { EditorialItem } from "./editorial-schema";

export function Button({ children, secondary = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return <button type="button" className={`fv-button${secondary ? " fv-button--secondary" : ""}`} {...props}>{children}</button>;
}
export function SelectableCard({ label, selected, onSelect, children }: { label: string; selected: boolean; onSelect: () => void; children?: ReactNode }) {
  return <button type="button" className="fv-option" aria-pressed={selected} onClick={onSelect}><strong>{label}</strong>{children}<span className="fv-option-check">{selected ? <><Check size={18} aria-hidden="true" />Selecionado</> : "Selecionar"}</span></button>;
}
export function TextArea({ label, value, onChange, maxLength = 500 }: { label: string; value: string; onChange: (value: string) => void; maxLength?: number }) {
  const id = useId();
  return <label className="fv-field" htmlFor={id}><span>{label}</span><textarea id={id} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength} aria-describedby={id + "-count"} /><span className="fv-counter" id={id + "-count"}>{value.length} de {maxLength} caracteres</span></label>;
}
export function TextField({ label, value, onChange, maxLength = 120 }: { label: string; value: string; onChange: (value: string) => void; maxLength?: number }) {
  const id = useId();
  return <label className="fv-field" htmlFor={id}><span>{label}</span><input id={id} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength} /></label>;
}
export function RangeScale({ label, value, onChange, min = 0, max = 10, ends = ["0", "10"] }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; ends?: [string, string] }) {
  const id = useId();
  return <label className="fv-field fv-scale" htmlFor={id}><span>{label}: {value}</span><input id={id} type="range" min={min} max={max} step={1} value={value} aria-valuetext={`${value} de ${max}`} onChange={event => onChange(Number(event.target.value))} /><span className="fv-scale-ends"><span>{ends[0]}</span><span>{ends[1]}</span></span></label>;
}
export function ReferenceLine({ item }: { item: EditorialItem }) {
  return <div className="fv-reference">{item.references.map((reference, index) => <p key={index}>{reference.author} · {reference.work} · {reference.year}{reference.edition ? ` · ${reference.edition}` : ""}{reference.pages ? ` · p. ${reference.pages}` : ""}</p>)}</div>;
}
export function Dialog({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  const id = useId();
  const ref = useFocusTrap<HTMLDialogElement>(open);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open, ref]);
  return <dialog ref={ref} className="fv-modal fv-resources" aria-labelledby={id} onCancel={event => { event.preventDefault(); onClose(); }}><h2 id={id}>{title}</h2>{open && children}<div className="fv-actions"><Button secondary onClick={onClose}>Fechar</Button></div></dialog>;
}
export function EmptyContent() {
  return <section aria-label="Acervo em revisão"><h2>O acervo aguarda revisão docente</h2><p>Os conteúdos aparecem aqui depois da autoria, revisão e publicação pela equipe.</p></section>;
}
export function PrivacyNote() {
  return <p className="fv-note">Nada é guardado automaticamente. Se você escolher guardar, o registro fica no seu histórico privado. Professores e outros alunos não têm acesso por esta ferramenta.</p>;
}
