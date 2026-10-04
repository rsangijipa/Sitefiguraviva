"use client";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { listMediatorsAction } from "@/app/actions/admin/mediators";
import type { Mediator } from "@/utils/mediators";

export default function MediatorsEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: Mediator[];
  onChange: (value: Mediator[]) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [options, setOptions] = useState<Mediator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listMediatorsAction()
      .then((items) => {
        if (active)
          setOptions(
            [...items].sort((a, b) =>
              a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
            ),
          );
      })
      .catch(() => {
        if (active)
          setError(
            "Não foi possível carregar os mediadores. A seleção atual foi preservada.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="font-serif text-xl text-primary">
        Mediadores do curso
      </legend>
      <p id={`${id}-help`} className="text-sm text-stone-600">
        Selecione os perfis cadastrados. Fotos e currículos são compartilhados
        entre os cursos.
      </p>
      {loading ? (
        <p role="status">Carregando mediadores…</p>
      ) : error ? (
        <div>
          <p role="alert">{error}</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="min-h-11 underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <label htmlFor={id} className="block text-sm font-medium">
            Selecionar mediadores
          </label>
          <select
            id={id}
            multiple
            size={Math.min(8, Math.max(3, options.length))}
            aria-describedby={`${id}-help ${id}-selection`}
            value={value.flatMap((member) => (member.id ? [member.id] : []))}
            onChange={(event) => {
              const selected = new Set(
                Array.from(
                  event.target.selectedOptions,
                  (option) => option.value,
                ),
              );
              onChange(
                options.filter(
                  (member) => member.id && selected.has(member.id),
                ),
              );
            }}
            className="w-full rounded-lg border border-stone-300 bg-white p-3 focus:ring-2 focus:ring-primary"
          >
            {options.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-500">
            No computador, use Ctrl ou ⌘ para selecionar mais de um nome.
          </p>
          {!options.length && <p>Nenhum mediador cadastrado.</p>}
        </>
      )}
      <p id={`${id}-selection`} className="text-sm" aria-live="polite">
        Selecionados:{" "}
        {value.map((member) => member.name).join(", ") || "nenhum"}.
      </p>
      <Link
        href="/admin/courses#mediadores"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
      >
        Gerenciar cadastro de mediadores em outra aba
      </Link>
      <button
        type="button"
        disabled={loading}
        onClick={() => setAttempt((n) => n + 1)}
        className="ml-3 min-h-11 text-sm text-primary underline"
      >
        Atualizar lista
      </button>
    </fieldset>
  );
}
