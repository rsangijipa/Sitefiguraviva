"use client";

import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Mediator } from "@/utils/mediators";

export default function MediatorsEditor({
  value,
  onChange,
  onUploadingChange,
  disabled = false,
}: {
  value: Mediator[];
  onChange: (value: Mediator[]) => void;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const prefix = useId();
  const update = (index: number, change: Partial<Mediator>) =>
    onChange(
      value.map((member, i) =>
        i === index ? { ...member, ...change } : member,
      ),
    );
  return (
    <fieldset disabled={disabled} className="space-y-5">
      <legend className="font-serif text-xl text-primary">Mediadoras</legend>
      <p className="text-sm text-stone-600">
        Cadastre o retrato e o currículo de cada mediadora. Na página pública, o
        visitante toca no nome para conhecer sua trajetória.
      </p>
      {value.map((member, index) => (
        <div
          key={index}
          className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-primary">
              Mediadora {index + 1}
            </h3>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`Remover mediadora ${index + 1}`}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} /> Remover
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
            <div>
              <p className="mb-2 text-sm font-medium text-primary">
                Foto do rosto
              </p>
              <ImageUpload
                onUploadingChange={onUploadingChange}
                defaultImage={member.image}
                bucket="public-avatars"
                folder="mediators"
                className="h-36 w-36"
                onUpload={(image) => update(index, { image })}
              />
              <p className="mt-2 text-xs text-stone-500">
                Foto quadrada, até 5 MB.
              </p>
            </div>
            <div className="space-y-3">
              <label
                htmlFor={`${prefix}-${index}-name`}
                className="block text-sm font-medium text-primary"
              >
                Nome *
              </label>
              <input
                id={`${prefix}-${index}-name`}
                value={member.name}
                required
                maxLength={200}
                onChange={(e) => update(index, { name: e.target.value })}
                className="w-full rounded-lg border border-stone-200 bg-white p-3"
              />
              <label
                htmlFor={`${prefix}-${index}-role`}
                className="block text-sm font-medium text-primary"
              >
                Título profissional
              </label>
              <input
                id={`${prefix}-${index}-role`}
                value={member.role}
                maxLength={300}
                onChange={(e) => update(index, { role: e.target.value })}
                placeholder="Ex.: Psicóloga e Gestalt-terapeuta"
                className="w-full rounded-lg border border-stone-200 bg-white p-3"
              />
            </div>
          </div>
          <label
            htmlFor={`${prefix}-${index}-bio`}
            className="mb-2 mt-5 block text-sm font-medium text-primary"
          >
            Currículo e trajetória
          </label>
          <textarea
            id={`${prefix}-${index}-bio`}
            rows={6}
            value={member.bio}
            maxLength={20000}
            onChange={(e) => update(index, { bio: e.target.value })}
            placeholder="Formação, experiência clínica, docência e áreas de atuação. Separe os parágrafos com uma linha em branco."
            className="w-full rounded-lg border border-stone-200 bg-white p-3 leading-relaxed"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...value,
            { name: "", role: "Mediadora", image: "", bio: "" },
          ])
        }
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/25 px-4 text-sm font-semibold text-primary hover:bg-primary/5"
      >
        <Plus size={18} /> Adicionar mediadora
      </button>
    </fieldset>
  );
}
