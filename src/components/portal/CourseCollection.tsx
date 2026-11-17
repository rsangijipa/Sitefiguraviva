"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  completed: boolean;
  lastAccess: string;
  card: ReactNode;
}

const searchable = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export function CourseCollection({ items }: { items: CourseItem[] }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const filtered = useMemo(() => items.filter(item =>
    searchable(item.title).includes(searchable(query.trim())) &&
    (status === "all" || (status === "completed" ? item.completed : !item.completed)),
  ).sort((a, b) => sort === "title"
    ? a.title.localeCompare(b.title, "pt-BR")
    : (Date.parse(b.lastAccess) || 0) - (Date.parse(a.lastAccess) || 0)), [items, query, status, sort]);

  return <div className="space-y-4">
    <div className="portal-course-filters">
      <label htmlFor={`${id}-search`} className="portal-field">
        <span>Buscar meus cursos</span>
        <div className="relative"><Search size={18} aria-hidden="true" className="absolute left-3 top-4 text-stone-500" />
          <input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome do curso" className="pl-10" />
        </div>
      </label>
      <label className="portal-field"><span>Situação</span><select value={status} onChange={event => setStatus(event.target.value)}>
        <option value="all">Todos os meus cursos</option><option value="progress">Em andamento</option><option value="completed">Concluídos</option>
      </select></label>
      <label className="portal-field"><span>Ordenar por</span><select value={sort} onChange={event => setSort(event.target.value)}>
        <option value="recent">Último acesso</option><option value="title">Nome do curso</option>
      </select></label>
    </div>
    <p role="status" className="text-sm text-stone-600">{filtered.length} {filtered.length === 1 ? "curso encontrado" : "cursos encontrados"}</p>
    {filtered.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{filtered.map(item => <div key={item.id} className="min-w-0">{item.card}</div>)}</div>
      : <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-emerald-950"><p>Nenhum curso corresponde à busca.</p><button type="button" className="mt-2 min-h-12 font-semibold underline" onClick={() => { setQuery(""); setStatus("all"); }}>Limpar filtros</button></div>}
  </div>;
}
