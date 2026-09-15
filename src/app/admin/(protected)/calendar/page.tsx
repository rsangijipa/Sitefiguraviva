"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { createEvent, deleteEvent } from "@/app/actions/admin/events";
import { useToast } from "@/context/ToastContext";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  MapPin,
  Trash2,
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle2,
  Sparkles,
  List,
  CalendarDays,
  X,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  status: "scheduled" | "live" | "ended" | "cancelled";
  isPublic: boolean;
  courseId?: string | null;
  courseTitle?: string | null;
  type: "webinar" | "in_person" | "hybrid";
  joinUrl?: string | null;
  location?: string | null;
}

interface CourseOption {
  id: string;
  title: string;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AdminCalendarPage() {
  const { addToast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Filter states
  const [selectedCourseFilter, setSelectedCourseFilter] =
    useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // Current calendar month view
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    startsAt: "",
    endsAt: "",
    type: "webinar" as "webinar" | "in_person" | "hybrid",
    joinUrl: "",
    location: "",
    isPublic: false,
  });

  const fetchData = async () => {
    try {
      const supabase = createSupabaseBrowserClient();

      // Fetch Courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .order("title", { ascending: true });

      const courseMap = new Map<string, string>();
      const courseList: CourseOption[] = (coursesData ?? []).map((c: any) => {
        courseMap.set(c.id, c.title);
        return { id: c.id, title: c.title };
      });
      setCourses(courseList);

      // Fetch Events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true });

      if (eventsError) throw eventsError;

      const mappedEvents: CalendarEvent[] = (eventsData ?? []).map(
        (row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          status: row.status || "scheduled",
          isPublic: !!row.is_public,
          courseId: row.course_id,
          courseTitle: row.course_id
            ? courseMap.get(row.course_id) || "Curso"
            : null,
          type: row.type || "webinar",
          joinUrl: row.join_url,
          location: row.location,
        }),
      );

      setEvents(mappedEvents);
    } catch (err: any) {
      console.error("Error loading calendar data:", err);
      addToast("Erro ao carregar dados do calendário.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCourseFilter !== "all") {
        if (selectedCourseFilter === "none" && ev.courseId) return false;
        if (
          selectedCourseFilter !== "none" &&
          ev.courseId !== selectedCourseFilter
        )
          return false;
      }
      if (selectedTypeFilter !== "all" && ev.type !== selectedTypeFilter) {
        return false;
      }
      return true;
    });
  }, [events, selectedCourseFilter, selectedTypeFilter]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Days matrix for current month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    // Next month filler days (to fill 35 or 42 grid slots)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const getEventsForDate = (y: number, m: number, d: number) => {
    return filteredEvents.filter((ev) => {
      const date = new Date(ev.startsAt);
      return (
        date.getFullYear() === y &&
        date.getMonth() === m &&
        date.getDate() === d
      );
    });
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente remover o encontro "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res.success) {
        addToast("Atividade removida com sucesso.", "success");
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        addToast(res.error || "Erro ao excluir atividade.", "error");
      }
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startsAt) {
      addToast("Informe ao menos o título e a data de início.", "error");
      return;
    }

    startTransition(async () => {
      const res = await createEvent({
        title: formData.title,
        description: formData.description,
        startsAt: new Date(formData.startsAt),
        endsAt: formData.endsAt ? new Date(formData.endsAt) : undefined,
        courseId: formData.courseId || undefined,
        meetingUrl: formData.joinUrl || undefined,
        isPublic: formData.isPublic,
      });

      if (res.success) {
        addToast("Atividade criada com sucesso no Supabase!", "success");
        setIsModalOpen(false);
        setFormData({
          title: "",
          description: "",
          courseId: "",
          startsAt: "",
          endsAt: "",
          type: "webinar",
          joinUrl: "",
          location: "",
          isPublic: false,
        });
        fetchData();
      } else {
        addToast(res.error || "Erro ao registrar atividade.", "error");
      }
    });
  };

  const today = new Date();
  const isToday = (y: number, m: number, d: number) =>
    today.getFullYear() === y &&
    today.getMonth() === m &&
    today.getDate() === d;

  return (
    <AdminPageShell
      title="Calendário Acadêmico & Encontros"
      description="Gerencie encontros de cursos, aulas ao vivo, vivências e atividades institucionais sincronizados diretamente com o Supabase."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-xs font-semibold text-[#262B22] shadow-sm hover:bg-[#F1E9DB]/50 transition-colors"
          >
            <RefreshCw
              size={14}
              className={cn(refreshing && "animate-spin text-[#005A1F]")}
            />
            Atualizar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#005A1F] px-4 py-2 text-xs font-semibold text-[#FDFAF4] shadow-sm hover:bg-[#07614C] transition-colors"
          >
            <Plus size={16} />
            Nova Atividade / Encontro
          </button>
        </div>
      }
    >
      {/* Controls & Filters Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#D8CFBE]/80 bg-[#FDFAF4] p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Month Navigation & Today */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-[#D8CFBE] bg-white shadow-xs">
            <button
              onClick={prevMonth}
              aria-label="Mês anterior"
              className="p-2 text-[#262B22]/70 hover:text-[#005A1F] hover:bg-[#F1E9DB]/40 rounded-l-xl transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-1.5 font-serif text-base font-semibold text-[#005A1F]">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              aria-label="Próximo mês"
              className="p-2 text-[#262B22]/70 hover:text-[#005A1F] hover:bg-[#F1E9DB]/40 rounded-r-xl transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={resetToToday}
            className="rounded-xl border border-[#D8CFBE] bg-white px-3 py-1.5 text-xs font-medium text-[#262B22]/80 hover:border-[#005A1F]/40 hover:text-[#005A1F] transition-colors"
          >
            Hoje
          </button>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Course filter */}
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#96551F]" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="rounded-xl border border-[#D8CFBE] bg-white px-3 py-1.5 text-xs font-medium text-[#262B22] shadow-xs focus:border-[#005A1F] focus:outline-none"
            >
              <option value="all">Todos os Cursos</option>
              <option value="none">Sem Curso (Geral)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-[#07614C]" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="rounded-xl border border-[#D8CFBE] bg-white px-3 py-1.5 text-xs font-medium text-[#262B22] shadow-xs focus:border-[#005A1F] focus:outline-none"
            >
              <option value="all">Todos os Tipos</option>
              <option value="webinar">Online (Webinar)</option>
              <option value="in_person">Presencial</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-[#D8CFBE] bg-white p-1 shadow-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all",
                viewMode === "calendar"
                  ? "bg-[#005A1F] text-[#FDFAF4]"
                  : "text-[#262B22]/70 hover:text-[#005A1F]",
              )}
            >
              <CalendarDays size={14} />
              Grade
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all",
                viewMode === "list"
                  ? "bg-[#005A1F] text-[#FDFAF4]"
                  : "text-[#262B22]/70 hover:text-[#005A1F]",
              )}
            >
              <List size={14} />
              Lista
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-[#D8CFBE] bg-white p-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#005A1F] border-t-transparent mb-4" />
          <p className="text-sm font-medium text-[#6B6B63]">
            Sincronizando calendário com o Supabase...
          </p>
        </div>
      ) : viewMode === "calendar" ? (
        /* Monthly Calendar Grid View */
        <div className="overflow-hidden rounded-2xl border border-[#D8CFBE] bg-white shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#D8CFBE] bg-[#F1E9DB]/60 text-center text-xs font-bold uppercase tracking-wider text-[#005A1F] py-3">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={cn(idx === 0 || idx === 6 ? "text-[#96551F]" : "")}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#D8CFBE]/60">
            {calendarDays.map((cell, idx) => {
              const dayEvents = getEventsForDate(
                cell.year,
                cell.month,
                cell.day,
              );
              const isCurrentDay = isToday(cell.year, cell.month, cell.day);

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[110px] p-2 transition-colors flex flex-col justify-between",
                    !cell.isCurrentMonth
                      ? "bg-stone-50/50 text-stone-400"
                      : "bg-white text-[#262B22] hover:bg-[#FDFAF4]/60",
                    isCurrentDay && "bg-[#005A1F]/5 font-semibold",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                        isCurrentDay
                          ? "bg-[#005A1F] text-[#FDFAF4] font-bold"
                          : "text-[#262B22]/80",
                      )}
                    >
                      {cell.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#96551F]">
                        {dayEvents.length}{" "}
                        {dayEvents.length === 1 ? "atv" : "atvs"}
                      </span>
                    )}
                  </div>

                  {/* Events Badges in Cell */}
                  <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map((ev) => {
                      const time = new Date(ev.startsAt).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      );
                      return (
                        <div
                          key={ev.id}
                          title={`${ev.title} - ${time}${ev.courseTitle ? ` (${ev.courseTitle})` : ""}`}
                          className={cn(
                            "group flex flex-col rounded-md border px-2 py-1 text-[11px] leading-tight transition-all",
                            ev.courseId
                              ? "border-[#005A1F]/20 bg-[#005A1F]/10 text-[#005A1F]"
                              : "border-[#96551F]/20 bg-[#96551F]/10 text-[#96551F]",
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold truncate">
                              {ev.title}
                            </span>
                            <span className="shrink-0 text-[9px] font-mono opacity-80">
                              {time}
                            </span>
                          </div>
                          {ev.courseTitle && (
                            <span className="text-[9px] opacity-75 truncate">
                              {ev.courseTitle}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Chronological List / Agenda View */
        <div className="rounded-2xl border border-[#D8CFBE] bg-white shadow-sm overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon
                size={36}
                className="mx-auto text-[#6B6B63]/40 mb-3"
              />
              <h3 className="font-serif text-lg text-[#262B22]">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-xs text-[#6B6B63] mt-1">
                Não há encontros ou atividades cadastradas com os filtros
                selecionados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D8CFBE]/60">
              {filteredEvents.map((ev) => {
                const startDate = new Date(ev.startsAt);
                const formattedDate = startDate.toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const formattedTime = startDate.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={ev.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#FDFAF4] transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#D8CFBE] bg-[#F1E9DB]/50 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#96551F]">
                          {startDate
                            .toLocaleDateString("pt-BR", { month: "short" })
                            .replace(".", "")}
                        </span>
                        <span className="font-serif text-xl font-bold leading-none text-[#005A1F]">
                          {startDate.getDate()}
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-serif text-base font-semibold text-[#262B22]">
                            {ev.title}
                          </h4>
                          {ev.courseTitle ? (
                            <span className="rounded-full bg-[#005A1F]/10 border border-[#005A1F]/20 px-2 py-0.5 text-[10px] font-bold text-[#005A1F]">
                              {ev.courseTitle}
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#96551F]/10 border border-[#96551F]/20 px-2 py-0.5 text-[10px] font-bold text-[#96551F]">
                              Atividade Geral
                            </span>
                          )}
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] uppercase font-semibold text-stone-600">
                            {ev.type === "webinar"
                              ? "Online"
                              : ev.type === "in_person"
                                ? "Presencial"
                                : "Híbrido"}
                          </span>
                        </div>

                        {ev.description && (
                          <p className="text-xs text-[#6B6B63] line-clamp-1 mb-2">
                            {ev.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6B63]">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-[#07614C]" />
                            {formattedDate} às {formattedTime}
                          </span>
                          {ev.joinUrl && (
                            <a
                              href={ev.joinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[#005A1F] hover:underline"
                            >
                              <Video size={13} />
                              Link da Sala
                              <ExternalLink size={10} />
                            </a>
                          )}
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        disabled={isPending}
                        className="rounded-xl border border-red-200 bg-red-50/50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                        title="Remover atividade"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Nova Atividade / Encontro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#D8CFBE] bg-[#FDFAF4] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D8CFBE]/70 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#005A1F]/10 p-2 text-[#005A1F]">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#005A1F]">
                    Novo Encontro / Atividade
                  </h3>
                  <p className="text-xs text-[#6B6B63]">
                    Cadastre uma aula ou atividade sincronizada com o Supabase.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-[#F1E9DB] hover:text-[#262B22] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#262B22]/80 mb-1">
                  Título da Atividade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aula Inaugural: Fundamentos da Gestalt"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#262B22]/80 mb-1">
                  Vincular a um Curso (Opcional)
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                >
                  <option value="">Nenhum (Atividade Geral / Livre)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#262B22]/80 mb-1">
                    Data e Horário de Início *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#262B22]/80 mb-1">
                    Data e Horário de Término
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, endsAt: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#262B22]/80 mb-1">
                    Formato
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as
                          | "webinar"
                          | "in_person"
                          | "hybrid",
                      })
                    }
                    className="w-full rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                  >
                    <option value="webinar">Online (Webinar / Meet)</option>
                    <option value="in_person">Presencial</option>
                    <option value="hybrid">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#262B22]/80 mb-1">
                    Link da Sala / Local
                  </label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/..."
                    value={formData.joinUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, joinUrl: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#262B22]/80 mb-1">
                  Descrição ou Pauta
                </label>
                <textarea
                  rows={2}
                  placeholder="Temas abordados, leituras prévias ou instruções aos participantes..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#D8CFBE] bg-white px-3.5 py-2 text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="rounded border-[#D8CFBE] text-[#005A1F] focus:ring-[#005A1F]"
                />
                <label
                  htmlFor="isPublic"
                  className="text-xs font-medium text-[#262B22]"
                >
                  Exibir no calendário público do site
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D8CFBE]/70">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#D8CFBE] bg-white px-4 py-2 text-xs font-semibold text-[#262B22] hover:bg-[#F1E9DB]/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#005A1F] px-4 py-2 text-xs font-semibold text-[#FDFAF4] hover:bg-[#07614C] transition-colors disabled:opacity-50"
                >
                  {isPending ? "Salvando..." : "Salvar no Supabase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
