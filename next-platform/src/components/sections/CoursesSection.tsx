"use client";

import { motion } from 'framer-motion';
import { Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Course {
    id: string | number;
    title: string;
    date: string;
    status: string;
    image: string;
    link: string;
    description?: string;
}

interface CoursesSectionProps {
    courses: Course[];
}

export default function CoursesSection({ courses }: CoursesSectionProps) {
    return (
        <section id="instituto" className="py-24 md:py-48 bg-primary text-paper relative overflow-hidden">
            {/* Background Textures */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24 md:mb-32"
                >
                    <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">Conhecimento que Transforma</span>
                    <h2 className="font-serif text-5xl md:text-[5rem] mb-10 leading-none">Formação & Cursos</h2>
                    <div className="w-24 h-[1px] bg-gold/30 mx-auto" />
                </motion.div>

                {/* Horizontal Snap Scroll for Mobile */}
                <div className="flex md:grid md:grid-cols-3 gap-8 lg:gap-16 overflow-x-auto pb-8 snap-x snap-mandatory md:overflow-visible">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 1, ease: [0.23, 1, 0.32, 1] }}
                            className="group relative min-w-[300px] snap-center w-full"
                        >
                            <div className="bg-paper text-primary rounded-3xl overflow-hidden shadow-2xl transition-soft group-hover:-translate-y-4 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] h-full flex flex-col">
                                <div className="h-72 overflow-hidden relative shrink-0">
                                    <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full backdrop-blur-xl border border-white/20 shadow-sm transition-soft ${course.status === 'Aberto' ? 'bg-white/90 text-green-800' :
                                        course.status === 'Esgotado' ? 'bg-white/90 text-red-800' : 'bg-gray-200/90 text-gray-600'
                                        }`}>
                                        {course.status}
                                    </div>
                                    <motion.img
                                        whileHover={{ scale: 1.15 }}
                                        transition={{ duration: 1.2 }}
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover grayscale transition-soft group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-soft mix-blend-multiply" />
                                </div>

                                <div className="p-10 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-accent font-bold mb-6">
                                        <Calendar size={14} />
                                        <span className="text-[10px] uppercase tracking-[0.2em]">{course.date}</span>
                                    </div>
                                    <h3 className="font-serif text-3xl mb-8 leading-tight line-clamp-2">{course.title}</h3>

                                    <div className="flex gap-4 mt-auto">
                                        <Link
                                            href={`/curso/${course.id}`} // Using next/link behavior
                                            className="flex-1 py-4 rounded-xl border border-primary/5 bg-gray-50 flex items-center justify-center gap-2 transition-soft hover:bg-white hover:shadow-xl group/btn"
                                        >
                                            <span className="font-bold uppercase text-[9px] tracking-[0.2em] text-primary/60">Detalhes</span>
                                        </Link>
                                        <button
                                            onClick={() => window.open(course.link, '_blank')}
                                            className="flex-[2] py-4 rounded-xl bg-primary text-paper flex items-center justify-center gap-2 transition-soft hover:bg-gold hover:shadow-xl group/btn"
                                        >
                                            <span className="font-bold uppercase text-[9px] tracking-[0.2em]">
                                                {course.status === 'Aberto' ? 'Garantir Vaga' : 'Saiba Mais'}
                                            </span>
                                            <ExternalLink size={14} className="transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
