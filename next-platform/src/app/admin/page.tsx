"use client";

import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Users, BookOpen, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function AdminDashboard() {
    const { courses, blogPosts } = useApp();

    const stats = [
        { label: 'Total de Cursos', value: courses.length, icon: BookOpen, change: '+2 esse mês' },
        { label: 'Artigos Publicados', value: blogPosts.length, icon: Eye, change: '+1 essa semana' },
        { label: 'Alunos Ativos', value: '324', icon: Users, change: '+12 novos' },
        { label: 'Eventos Agendados', value: '8', icon: Calendar, change: 'Próximo em 2 dias' },
    ];

    return (
        <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:border-gold/30">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                                        <stat.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                                </div>
                                <h3 className="text-4xl font-serif text-primary mb-1">{stat.value}</h3>
                                <p className="text-primary/40 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardContent className="p-10">
                            <h3 className="font-serif text-2xl mb-8">Atividade Recente</h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary/40 text-xs font-bold">
                                            JS
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-primary">João Silva se inscreveu no curso "Formação Gestalt"</p>
                                            <p className="text-xs text-primary/30 mt-1">Há 2 horas</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-primary text-paper p-10 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[40px]" />
                    <h3 className="font-serif text-2xl mb-4 relative z-10">Lembrete</h3>
                    <p className="font-light text-paper/70 mb-8 relative z-10">Atualizar a agenda de workshops para o próximo trimestre.</p>
                    <button className="w-full py-4 bg-gold rounded-xl text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-colors relative z-10 shadow-lg">
                        Ver Agenda
                    </button>
                </div>
            </div>
        </div>
    );
}
