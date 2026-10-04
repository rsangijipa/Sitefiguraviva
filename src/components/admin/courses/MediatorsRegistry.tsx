"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteMediatorAction,
  listMediatorsAction,
  saveMediatorAction,
} from "@/app/actions/admin/mediators";
import MediatorProfileEditor from "./MediatorProfileEditor";
import Button from "@/components/ui/Button";
import type { Mediator } from "@/utils/mediators";

export default function MediatorsRegistry() {
  const [items, setItems] = useState<Mediator[]>([]);
  const [draft, setDraft] = useState<Mediator | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMediatorsAction());
      setError("");
    } catch {
      setError("Não foi possível carregar o cadastro.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || saving || uploading) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await saveMediatorAction(draft);
      setDraft(null);
      await load();
      setMessage(
        "Perfil salvo. A alteração vale para todos os cursos vinculados.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(member: Mediator) {
    if (!member.id || !confirm(`Excluir o cadastro de ${member.name}?`)) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await deleteMediatorAction(member.id);
      await load();
      setMessage("Cadastro excluído.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao excluir.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section
      id="mediadores"
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-primary">
            Cadastro de mediadores
          </h2>
          <p className="text-sm text-stone-600">
            Cadastre cada pessoa uma vez e selecione seu perfil nos cursos.
          </p>
        </div>
        <Button
          disabled={saving || uploading || !!draft}
          onClick={() => {
            setMessage("");
            setDraft({ name: "", role: "Mediador(a)", image: "", bio: "" });
          }}
        >
          Novo mediador
        </Button>
      </div>
      {error && (
        <div>
          <p role="alert" className="text-red-700">
            {error}
          </p>
          {!draft && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void load()}
              className="min-h-11 underline"
            >
              Recarregar cadastro
            </button>
          )}
        </div>
      )}
      {message && (
        <p role="status" className="text-primary">
          {message}
        </p>
      )}
      {draft ? (
        <form onSubmit={save} className="space-y-4">
          <MediatorProfileEditor
            value={[draft]}
            onChange={(members) => setDraft(members[0])}
            disabled={saving || uploading}
            onUploadingChange={setUploading}
          />
          <div className="flex gap-3">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Salvando…" : "Salvar perfil"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving || uploading}
              onClick={() => {
                setDraft(null);
                setError("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : loading ? (
        <p role="status">Carregando cadastro…</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {items.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-stone-500">{member.role}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setDraft(member);
                    setError("");
                    setMessage("");
                  }}
                  className="min-h-11 px-3 text-primary underline"
                  aria-label={`Editar ${member.name}`}
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void remove(member)}
                  className="min-h-11 px-3 text-red-700 underline"
                  aria-label={`Excluir ${member.name}`}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
          {!items.length && !error && (
            <li className="py-3">Nenhum mediador cadastrado.</li>
          )}
        </ul>
      )}
    </section>
  );
}
