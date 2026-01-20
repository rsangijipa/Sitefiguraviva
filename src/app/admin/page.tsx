"use client";

// import { useApp } from '../../context/AppContext';
import { useCourses, useBlogPosts, useGallery } from '../../hooks/useContent';
import { motion } from 'framer-motion';
import { Users, BookOpen, Eye, FileText, Image as ImageIcon, Activity } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useMemo } from 'react';

export default function AdminDashboard() {
    const { data: courses = [] } = useCourses(true);
    const { data: blogPosts = [] } = useBlogPosts(true);
    const { data: gallery = [] } = useGallery();
    // documents logic to be implemented later or use a new hook
    const documents: any[] = [];

    const stats = [
        { label: 'Total de Cursos', value: courses.length, icon: BookOpen, change: 'Cadastrados' },
        { label: 'Artigos Publicados', value: blogPosts.length, icon: Eye, change: 'No Blog' },
        { label: 'Itens na Galeria', value: gallery.length, icon: ImageIcon, change: 'Media' },
        { label: 'Documentos', value: documents.length, icon: FileText, change: 'Biblioteca' },
    ];

    const activities = useMemo(() => {
        const all = [
            ...courses.map((c: any) => ({
                type: 'Curso',
                action: 'criou o curso',
                title: c.title,
                date: new Date(c.created_at?.seconds * 1000 || Date.now()), // Firestore Timestamp
                user: 'Lilian'
            })),
            ...blogPosts.map((p: any) => ({
                type: 'Blog',
                action: 'publicou o artigo',
                title: p.title,
                date: new Date(p.created_at?.seconds * 1000 || Date.now()),
                user: 'Lilian'
            })),
            ...gallery.map((g: any) => ({
                type: 'Galeria',
                action: 'adicionou uma nova foto',
                title: g.title || 'Imagem da Galeria',
                date: new Date(g.created_at?.seconds * 1000 || Date.now()),
                user: 'Lilian'
            }))
        ];

        return all.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);
    }, [courses, blogPosts, gallery]);

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " anos atrás";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " meses atrás";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " dias atrás";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " horas atrás";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutos atrás";
        return "agora mesmo";
    };

    return (
        <div>
            {/* Premium Welcome Section */}
            <header className="mb-12 relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-r from-primary/5 to-transparent border border-primary/5">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-serif text-primary mb-2">
                        Bem-vinda, Lilian
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
                        <Card className="hover:border-gold/30 transition-all duration-300 hover:shadow-lg bg-white/50 hover:bg-white">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-gold/10 group-hover:text-gold transition-colors text-primary">
                                        <stat.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-primary/40 bg-primary/5 px-2 py-1 rounded-full uppercase tracking-wider">{stat.change}</span>
                                </div>
                                <h3 className="text-4xl font-serif text-primary mb-1">{stat.value}</h3>
                                <p className="text-primary/40 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-1 gap-8">
                <Card className="h-full border-primary/5 bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif text-2xl text-primary">Atividade Recente</h3>
                            <div className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider">
                                Log do Sistema
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                            {activities.length > 0 ? activities.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-4 border-b border-primary/5 pb-4 last:border-0 last:pb-0 hover:bg-primary/5 p-2 rounded-lg transition-colors -mx-2"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-serif font-bold text-sm shrink-0">
                                        {log.user.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-primary break-words">
                                            <span className="font-bold">{log.user}</span> {log.action} <span className="italic">"{log.title}"</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/60 font-bold uppercase tracking-wider">
                                                {log.type}
                                            </span>
                                            <span className="text-xs text-primary/30">• {formatTimeAgo(log.date)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <p className="text-primary/40 italic">Nenhuma atividade recente registrada.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
