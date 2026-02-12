"use client";

// import { useApp } from '@/context/AppContext';
import { useCourses, useBlogPosts, useGallery } from "@/hooks/useContent";
import { motion } from "framer-motion";
import {
  BarChart,
  Users,
  BookOpen,
  DollarSign,
  Activity,
  FileText,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useState, useEffect, useMemo } from "react";
import { getAuditLogs } from "@/actions/audit";
import { getDetailedDashboardStats } from "@/app/actions/admin/dashboard";
import { Settings, Zap, Shield, Globe, Award, List } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { runEnrollmentMigration } from "@/app/actions/admin/maintenance";
import { useToast } from "@/context/ToastContext";

export default function AdminDashboard() {
  const { addToast } = useToast();
  const { data: courses = [] } = useCourses(true);
  const { data: blogPosts = [] } = useBlogPosts(true);
  const { data: gallery = [] } = useGallery();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [serverStats, setServerStats] = useState<any>(null);

  useEffect(() => {
    getAuditLogs(10).then((res) => {
      if (res.success) setAuditLogs(res.logs);
    });
    getDetailedDashboardStats().then((res) => {
      if (res.success) setServerStats(res.stats);
    });
  }, []);

  const libraryDocs = useMemo(
    () => blogPosts.filter((p: any) => p.type === "library"),
    [blogPosts],
  );

  const stats = [
    {
      label: "Alunos Totais",
      value: serverStats?.totalUsers || "...",
      icon: Users,
      change: "Base de Dados",
    },
    {
      label: "Matrículas Ativas",
      value: serverStats?.activeEnrollments || "...",
      icon: Zap,
      change: "Vigentes",
    },
    {
      label: "Cursos",
      value: serverStats?.totalCourses || "...",
      icon: BookOpen,
      change: "Catálogo",
    },
    {
      label: "Documentos",
      value: serverStats?.libraryDocs || "...",
      icon: FileText,
      change: "Biblioteca",
    },
  ];

  const resources = [
    {
      label: "Configurações",
      desc: "Ajustes do site e textos legais",
      href: "/admin/settings",
      icon: Settings,
      color: "text-blue-500",
    },
    {
      label: "Matrículas",
      desc: "Gerenciar acessos e inscrições",
      href: "/admin/enrollments",
      icon: Award,
      color: "text-gold",
    },
    {
      label: "Agenda & Eventos",
      desc: "Calendário de lives e encontros",
      href: "/admin/events",
      icon: Globe,
      color: "text-green-500",
    },
    {
      label: "Auditoria",
      desc: "Logs completos de segurança",
      href: "/admin/logs",
      icon: Shield,
      color: "text-red-500",
    },
  ];

  const formatTimeAgo = (dateStr: any) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Data inválida";

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "agora mesmo";

    let interval = seconds / 31536000;
    if (interval > 1)
      return (
        Math.floor(interval) +
        (Math.floor(interval) === 1 ? " ano" : " anos") +
        " atrás"
      );
    interval = seconds / 2592000;
    if (interval > 1)
      return (
        Math.floor(interval) +
        (Math.floor(interval) === 1 ? " mês" : " meses") +
        " atrás"
      );
    interval = seconds / 86400;
    if (interval > 1)
      return (
        Math.floor(interval) +
        (Math.floor(interval) === 1 ? " dia" : " dias") +
        " atrás"
      );
    interval = seconds / 3600;
    if (interval > 1)
      return (
        Math.floor(interval) +
        (Math.floor(interval) === 1 ? " hora" : " horas") +
        " atrás"
      );
    interval = seconds / 60;
    if (interval > 1)
      return (
        Math.floor(interval) +
        (Math.floor(interval) === 1 ? " minuto" : " minutos") +
        " atrás"
      );
    return "agora mesmo";
  };

  return (
    <div>
      {/* Premium Welcome Section */}
      <header className="mb-12 relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-r from-primary/5 to-transparent border border-primary/5">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-2">
            Painel Administrativo
          </h1>
          <p className="text-lg text-primary/60 font-light flex items-center gap-2">
            <Activity className="w-4 h-4 text-gold" />
            Visão geral do sistema e atividades recentes
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:border-gold/30 transition-all duration-300 hover:shadow-lg bg-white/50 hover:bg-white h-full">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-gold/10 group-hover:text-gold transition-colors text-primary">
                    <stat.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-primary/40 bg-primary/5 px-2 py-1 rounded-full uppercase tracking-wider">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-4xl font-serif text-primary mb-1">
                  {stat.value}
                </h3>
                <p className="text-primary/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* New Dashboard Cards: Pending & Recent */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-gold/20 bg-gold/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Award size={18} className="text-gold" /> Matrículas
                    Pendentes
                  </h3>
                  <Link
                    href="/admin/enrollments"
                    className="text-[10px] font-bold text-gold uppercase tracking-widest"
                  >
                    Ver Tudo
                  </Link>
                </div>
                <div className="space-y-3">
                  {serverStats?.pendingEnrollments?.length > 0 ? (
                    serverStats.pendingEnrollments.map((en: any) => (
                      <div
                        key={en.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-gold/10"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-primary truncate">
                            {en.userName || en.email}
                          </p>
                          <p className="text-[10px] text-primary/40 truncate">
                            {en.courseTitle}
                          </p>
                        </div>
                        <Link
                          href="/admin/enrollments"
                          className="text-[10px] px-2 py-1 bg-gold text-white rounded-md font-bold uppercase tracking-tighter"
                        >
                          Aprovar
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-primary/40 italic py-2 text-center">
                      Nenhuma matrícula pendente.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Users size={18} className="text-primary" /> Novos Usuários
                  </h3>
                  <Link
                    href="/admin/users"
                    className="text-[10px] font-bold text-primary/40 uppercase tracking-widest"
                  >
                    Ver Todos
                  </Link>
                </div>
                <div className="space-y-3">
                  {serverStats?.recentUsers?.length > 0 ? (
                    serverStats.recentUsers.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/50 border border-primary/10"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                          {u.displayName?.charAt(0) ||
                            u.email?.charAt(0) ||
                            "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-primary truncate">
                            {u.displayName || "Sem Nome"}
                          </p>
                          <p className="text-[10px] text-primary/40 truncate">
                            {u.email}
                          </p>
                        </div>
                        <span className="text-[8px] text-primary/20">
                          {formatTimeAgo(u.createdAt)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-primary/40 italic py-2 text-center">
                      Nenhum usuário recente.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-primary/5 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl text-primary">
                  Atividade Recente
                </h3>
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/logs"
                    className="text-primary/40 text-[10px] font-bold uppercase tracking-widest hover:text-gold transition-colors"
                  >
                    Ver Tudo
                  </Link>
                  <div className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider">
                    Logs
                  </div>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 border-b border-primary/5 pb-4 last:border-0 last:pb-0 hover:bg-primary/5 p-3 rounded-xl transition-all -mx-2 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-serif font-bold text-lg shrink-0 group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                        {(log.actor?.email || "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary break-words">
                          <span className="font-bold">
                            {log.actor?.email?.split("@")[0] || "Sistema"}
                          </span>{" "}
                          <span className="text-primary/70">
                            {log.action || log.eventType}
                          </span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/5 text-primary/60 font-bold uppercase tracking-wider">
                            {log.target?.collection || "Geral"}
                          </span>
                          <span className="text-xs text-primary/30">
                            • {formatTimeAgo(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-primary/5 rounded-3xl border border-dashed border-primary/10">
                    <Activity className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                    <p className="text-primary/40 italic">
                      Nenhuma atividade recente registrada.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resources & Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-serif text-2xl text-primary mb-4 px-2">
            Recursos Rápidos
          </h3>
          {resources.map((res, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={res.href}>
                <Card className="hover:border-gold/30 hover:shadow-md transition-all group overflow-hidden bg-white/50 backdrop-blur-sm group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={cn(
                        "p-4 rounded-2xl bg-primary/5 group-hover:bg-gold/10 transition-colors",
                        res.color,
                      )}
                    >
                      <res.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-primary group-hover:text-gold transition-colors">
                        {res.label}
                      </h4>
                      <p className="text-xs text-primary/40 line-clamp-1">
                        {res.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}

          {/* Users Quick Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/admin/users">
              <Card className="hover:border-primary/30 hover:shadow-md transition-all group bg-primary text-white overflow-hidden">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Users size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">Gerenciar Usuários</h4>
                    <p className="text-xs text-white/60 line-clamp-1">
                      Controle perfis e acessos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Maintenance Quick Action */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-red-100 bg-red-50/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <Zap size={18} className="text-red-500" /> Manutenção
                  </h3>
                </div>
                <p className="text-[10px] text-primary/40 mb-4 uppercase tracking-widest leading-relaxed">
                  {" "}
                  Standardize enrollment IDs to {`{uid}_{courseId}`}{" "}
                </p>
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        "Deseja iniciar a migração de IDs de matrícula? Esta ação é irreversível e atualizará todos os registros para o formato determinístico.",
                      )
                    ) {
                      const loadingToastId = "migration-loading";
                      addToast("Iniciando migração...", "info");

                      const res = await runEnrollmentMigration();

                      if (res.success) {
                        addToast(
                          `Sucesso! ${(res as any).migratedCount} registros migrados.`,
                          "success",
                        );
                      } else {
                        addToast(
                          "Erro na migração: " + (res as any).error,
                          "error",
                        );
                      }
                    }
                  }}
                  className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  Executar Migração
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Special Quick Action */}
          <div className="p-8 bg-gold rounded-[2rem] text-white shadow-xl shadow-gold/20 relative overflow-hidden group mt-10">
            <div className="relative z-10">
              <h4 className="font-serif text-xl mb-2">Novo Conteúdo?</h4>
              <p className="text-white/70 text-sm mb-6">
                Comece um novo curso ou artigo agora mesmo.
              </p>
              <Link
                href="/admin/courses"
                className="bg-white text-gold font-bold px-6 py-3 rounded-xl text-sm hover:shadow-lg transition-all inline-block hover:scale-105 active:scale-95"
              >
                Criar Agora
              </Link>
            </div>
            <BookOpen className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 -rotate-12 transition-transform group-hover:scale-110" />
          </div>
        </div>
      </div>
    </div>
  );
}
