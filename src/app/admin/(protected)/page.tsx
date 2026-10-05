"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  ImagePlus,
  LibraryBig,
  Plus,
  RefreshCw,
  Users,
  AlertCircle,
  Activity,
  ChevronDown,
} from "lucide-react";
import { getAdminDashboardKPIs } from "@/app/actions/metrics";
import { getAuditLogs } from "@/actions/audit";
import type { AdminDashboardKpisData } from "@/lib/metrics/kpi";
import { SupabaseSyncHealth } from "@/components/admin/SupabaseSyncHealth";
import styles from "./Dashboard.module.css";

type AuditLog = {
  id: string;
  action: string;
  timestamp: string;
  actor: { email?: string };
  target: { collection: string; id: string };
};
const formatNumber = (value?: number) =>
  value === undefined ? "—" : value.toLocaleString("pt-BR");
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data indisponível"
    : date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
};
const actionLabel = (action: string) => {
  const labels: Record<string, string> = {
    create: "Criação",
    update: "Atualização",
    delete: "Exclusão",
    login: "Entrada",
    publish: "Publicação",
    approve: "Aprovação",
  };
  return labels[action.toLowerCase()] ?? action.replace(/[_.-]/g, " ");
};
const quickActions = [
  {
    label: "Novo curso",
    description: "Preparar uma formação",
    href: "/admin/courses/new",
    icon: Plus,
    tone: "green",
  },
  {
    label: "Avaliações",
    description: "Organizar provas e atividades",
    href: "/admin/assessments",
    icon: FilePlus2,
    tone: "blue",
  },
  {
    label: "Adicionar foto",
    description: "Atualizar a galeria",
    href: "/admin/gallery/new",
    icon: ImagePlus,
    tone: "amber",
  },
  {
    label: "Novo livro",
    description: "Ampliar a estante",
    href: "/admin/books/new",
    icon: LibraryBig,
    tone: "violet",
  },
];

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardKpisData>();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [auditError, setAuditError] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const mounted = useRef(false);
  const pending = useRef(false);

  const load = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    const [metrics, activity] = await Promise.allSettled([
      getAdminDashboardKPIs(),
      getAuditLogs(6),
    ]);
    if (mounted.current) {
      if (
        metrics.status === "fulfilled" &&
        metrics.value.success &&
        metrics.value.data
      ) {
        setData(metrics.value.data);
        setUpdatedAt(metrics.value.updatedAt);
        setError(undefined);
      } else {
        setError("Não foi possível atualizar as métricas. Tente novamente.");
      }
      if (
        activity.status === "fulfilled" &&
        activity.value.success &&
        activity.value.logs
      ) {
        setLogs(activity.value.logs);
        setAuditError(false);
      } else {
        setAuditError(true);
      }
      setLoading(false);
    }
    pending.current = false;
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    const refreshIfVisible = () => {
      if (!document.hidden) void load();
    };
    const interval = setInterval(refreshIfVisible, 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      mounted.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [load]);

  const stats = [
    {
      label: "Usuários cadastrados",
      value: data?.totalUsers,
      description: data
        ? formatNumber(data.newUsers30Days) + " novos nos últimos 30 dias"
        : "Todos os perfis da plataforma",
      icon: Users,
      tone: "blue",
      href: "/admin/users",
    },
    {
      label: "Matrículas com acesso",
      value: data?.accessGranted,
      description: "Acessos ativos e de cursos concluídos",
      icon: CheckCircle2,
      tone: "green",
      href: "/admin/enrollments",
    },
    {
      label: "Matrículas pendentes",
      value: data?.pendingEnrollmentCount,
      description: "Aguardando aprovação de acesso",
      icon: Clock3,
      tone: "amber",
      href: "/admin/enrollments",
    },
    {
      label: "Cursos publicados",
      value: data?.publishedCourses,
      description: data
        ? formatNumber(data.totalCourses) + " cursos no catálogo completo"
        : "Disponíveis na plataforma",
      icon: BookOpen,
      tone: "violet",
      href: "/admin/courses",
    },
  ];
  const tasks = [
    {
      title: "Revisar matrículas",
      description: "Confira os pedidos antes de liberar acesso.",
      count: data?.pendingEnrollmentCount,
      href: "/admin/enrollments",
      icon: Users,
      tone: "amber",
    },
    {
      title: "Corrigir avaliações",
      description: "Respostas enviadas aguardando correção.",
      count: data?.submissionsToGrade,
      href: "/admin/assessments/submissions",
      icon: ClipboardCheck,
      tone: "blue",
    },
    {
      title: "Preparar cursos",
      description: "Rascunhos que você pode continuar editando.",
      count: data?.draftCourses,
      href: "/admin/courses",
      icon: BookOpen,
      tone: "violet",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Seu espaço de gestão</p>
          <h1>Visão geral</h1>
          <p>Acompanhe o que importa e escolha a próxima ação.</p>
        </div>
        <div className={styles.refreshArea}>
          <span>
            {updatedAt
              ? "Atualizado em " + formatDate(updatedAt)
              : loading
                ? "Carregando dados…"
                : "Dados indisponíveis"}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={styles.refresh}
          >
            <RefreshCw
              size={17}
              className={loading ? styles.spinning : undefined}
              aria-hidden="true"
            />
            {loading ? "Atualizando" : "Atualizar"}
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className={styles.error}>
          <AlertCircle size={19} aria-hidden="true" />
          <span>
            {error}{" "}
            {data &&
              "Os números abaixo são da última atualização bem-sucedida."}
          </span>
        </div>
      )}

      <section
        className={styles.stats}
        aria-label="Indicadores principais"
        aria-busy={loading}
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={styles.stat}
            data-tone={stat.tone}
          >
            <div className={styles.statTop}>
              <span className={styles.icon}>
                <stat.icon size={21} aria-hidden="true" />
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </div>
            <p className={styles.statLabel}>{stat.label}</p>
            <strong className={styles.statValue}>
              {formatNumber(stat.value)}
            </strong>
            <p className={styles.statDescription}>{stat.description}</p>
          </Link>
        ))}
      </section>

      <section className={styles.priorities} aria-labelledby="admin-priorities">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="admin-priorities">Próximas ações</h2>
            <p>Pedidos, correções e conteúdos em preparação.</p>
          </div>
          <span className={styles.sectionTag}>Rotina do dia</span>
        </div>
        <div className={styles.tasks}>
          {tasks.map((task) => (
            <Link
              key={task.title}
              href={task.href}
              className={styles.task}
              data-tone={task.tone}
            >
              <span className={styles.icon}>
                <task.icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
              </div>
              <strong
                aria-label={
                  task.count === undefined
                    ? "Quantidade indisponível"
                    : task.count + " registros"
                }
              >
                {formatNumber(task.count)}
              </strong>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="admin-shortcuts">
        <div className={styles.sectionHeading}>
          <h2 id="admin-shortcuts">Acesso rápido</h2>
        </div>
        <div className={styles.shortcuts}>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={styles.shortcut}
              data-tone={action.tone}
            >
              <span className={styles.icon}>
                <action.icon size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>{action.label}</strong>
                <p>{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.twoColumns}>
        <section className={styles.panel} aria-labelledby="admin-pending">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="admin-pending">Aguardando aprovação</h2>
              <p>
                {data
                  ? "Mostrando " +
                    data.pendingEnrollments.length +
                    " de " +
                    formatNumber(data.pendingEnrollmentCount) +
                    " matrículas pendentes"
                  : "Pedidos mais recentes"}
              </p>
            </div>
            <Link href="/admin/enrollments">
              Ver todas <ArrowRight size={15} />
            </Link>
          </div>
          {!data ? (
            <p className={styles.empty}>
              {loading ? "Carregando matrículas…" : "Matrículas indisponíveis."}
            </p>
          ) : data.pendingEnrollments.length ? (
            <ul className={styles.list}>
              {data.pendingEnrollments.map((enrollment) => (
                <li key={enrollment.id}>
                  <span className={styles.personIcon} data-tone="amber">
                    <Users size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>
                      {enrollment.userName ||
                        enrollment.email ||
                        "Usuário sem nome"}
                    </strong>
                    <p>{enrollment.courseTitle}</p>
                  </div>
                  <Link href="/admin/enrollments" className={styles.review}>
                    Revisar
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <CheckCircle2 size={25} />
              <p>Nenhuma matrícula aguardando aprovação.</p>
            </div>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="admin-users">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="admin-users">Cadastros recentes</h2>
              <p>Últimos usuários que chegaram à plataforma.</p>
            </div>
            <Link href="/admin/users">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          {!data ? (
            <p className={styles.empty}>
              {loading ? "Carregando usuários…" : "Cadastros indisponíveis."}
            </p>
          ) : data.recentUsers.length ? (
            <ul className={styles.list}>
              {data.recentUsers.map((person) => (
                <li key={person.id}>
                  <span className={styles.personIcon} data-tone="blue">
                    {(person.display_name || person.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <div>
                    <strong>
                      {person.display_name || "Sem nome informado"}
                    </strong>
                    <p>{person.email || "Sem e-mail informado"}</p>
                  </div>
                  <time dateTime={person.created_at}>
                    {formatDate(person.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Nenhum cadastro encontrado.</p>
          )}
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="admin-activity">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="admin-activity">Atividade recente</h2>
            <p>Últimas ações registradas na administração.</p>
          </div>
          <Link href="/admin/logs">
            Ver histórico <ArrowRight size={15} />
          </Link>
        </div>
        {auditError ? (
          <p role="status" className={styles.empty}>
            Não foi possível carregar o histórico. Use “Atualizar” para tentar
            novamente.
          </p>
        ) : !logs.length ? (
          <p className={styles.empty}>
            {loading
              ? "Carregando atividade…"
              : "Nenhuma atividade registrada."}
          </p>
        ) : (
          <ul className={styles.activityList}>
            {logs.map((log) => (
              <li key={log.id}>
                <span className={styles.activityIcon}>
                  <Activity size={17} aria-hidden="true" />
                </span>
                <div>
                  <strong>{actionLabel(log.action)}</strong>
                  <p>
                    {log.actor.email || "Sistema"}
                    {log.target.collection ? " · " + log.target.collection : ""}
                  </p>
                </div>
                <time dateTime={log.timestamp}>
                  {formatDate(log.timestamp)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details
        className={styles.technical}
        onToggle={(event) => setHealthOpen(event.currentTarget.open)}
      >
        <summary>
          Publicação e ferramentas <ChevronDown size={17} aria-hidden="true" />
        </summary>
        {healthOpen && (
          <div>
            <SupabaseSyncHealth />
            <Link href="/admin/utilities">
              Abrir ferramentas de manutenção <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </details>
    </div>
  );
}
