"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '../ui/Skeleton';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Calendar } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
} as const;

interface Course {
    id: string | number;
    title: string;
    subtitle?: string;
    date: string;
    status: string;
    image?: string;
    images?: string[];
    description?: string;
    details?: { intro: string };
    category?: string;
}

interface CoursesSectionProps {
    courses: Course[];
    onOpenCalendar: () => void;
    onSelectCourse: (course: Course) => void;
    loading?: boolean;
}

export default function CoursesSection({ courses = [], onOpenCalendar, onSelectCourse, loading = false }: CoursesSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="instituto" className="py-16 md:py-24 px-6 bg-[#EFECE5] overflow-hidden transition-colors duration-500">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="mb-12 md:flex justify-between items-end"
                >
                    <div className="max-w-2xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/60 mb-4 block">Formação & Estudos</span>
                        <h2 className="heading-section text-primary">
                            Ciclos de <span className="italic text-gold font-light">Aprendizagem</span>
                        </h2>
                        <p className="text-lg text-primary/70 leading-relaxed font-light text-balance">
                            Nossos percursos formativos são convites para habitar a Gestalt-terapia com rigor ético, densidade teórica e sensibilidade clínica.
                        </p>
                    </div>
                </motion.div>

                <div className="relative group/scroll">
                    <div
                        ref={scrollContainerRef}
                        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="flex-shrink-0 w-80 md:w-96 snap-center">
                                    <div className="flex flex-col h-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100/50">
                                        <Skeleton className="aspect-[4/3] w-full rounded-xl mb-6 bg-stone-200" />
                                        <div className="space-y-4 flex-1">
                                            <Skeleton className="h-6 w-3/4 rounded bg-stone-200" />
                                            <Skeleton className="h-4 w-1/4 rounded bg-stone-200" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : courses.length === 0 ? (
                            <div className="w-full">
                                <EmptyState
                                    title="Nenhuma formação aberta"
                                    description="No momento não temos inscrições abertas, mas você pode consultar nosso calendário para ver as próximas datas."
                                    icon={<Calendar size={32} />}
                                    action={
                                        <button
                                            onClick={onOpenCalendar}
                                            className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:text-gold hover:border-gold transition-colors"
                                        >
                                            Ver Calendário
                                        </button>
                                    }
                                />
                            </div>
                        ) : (
                            courses.map((course, index) => {
                                const isClosed = course.status === 'Encerrado' || course.status === 'Esgotado';
                                return (
                                    <motion.article
                                        key={course.id || index}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex-shrink-0 w-80 md:w-auto snap-center group h-full cursor-pointer"
                                        onClick={() => onSelectCourse(course)}
                                    >
                                        <Card className="h-full p-4 flex flex-col">
                                            <div className="aspect-[4/3] overflow-hidden rounded-xl mb-6 relative shrink-0">
                                                <div className="block w-full h-full relative">
                                                    <Image
                                                        src={(course.image && course.image.trim() !== "") ? course.image : (course.images?.[0] && course.images[0].trim() !== "") ? course.images[0] : 'https://via.placeholder.com/400x300'}
                                                        alt={course.title || "Course Image"}
                                                        fill
                                                        priority={index === 0}
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isClosed ? 'grayscale opacity-70' : ''}`}
                                                    />
                                                </div>
                                                <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                                                    {course.category && (
                                                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-primary shadow-sm border border-gray-100">
                                                            {course.category === 'Formacao' ? 'Formação' : course.category === 'GrupoEstudos' ? 'Grupo de Estudos' : 'Curso Livre'}
                                                        </span>
                                                    )}
                                                    {isClosed && (
                                                        <span className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-white shadow-sm">
                                                            {course.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col px-2">
                                                <div className="mb-4 min-h-[5rem]">
                                                    <h3 className="text-xl font-bold text-primary mb-2 leading-tight group-hover:text-gold transition-colors line-clamp-2">
                                                        {course.title}
                                                    </h3>
                                                    {course.subtitle && (
                                                        <p className="text-sm text-primary/60 italic mb-2 line-clamp-1">
                                                            {course.subtitle}
                                                        </p>
                                                    )}
                                                    <p className="text-xs font-medium uppercase tracking-wider text-sage">
                                                        {course.date}
                                                    </p>
                                                </div>

                                                <p className="text-primary/70 text-sm leading-relaxed mb-6 line-clamp-3 min-h-[4.5em]">
                                                    {course.description || course.details?.intro}
                                                </p>

                                                <div className="mt-auto pt-4 border-t border-gray-100">
                                                    {isClosed ? (
                                                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 cursor-not-allowed py-2">
                                                            Inscrições Encerradas
                                                        </span>
                                                    ) : (
                                                        <button
                                                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all py-3 px-2 -ml-2 rounded-lg hover:bg-gray-50 bg-transparent active:scale-95 touch-manipulation"
                                                        >
                                                            Saiba Mais <span className="text-gold">→</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.article>
                                );
                            })
                        )}
                        <div className="w-6 md:hidden flex-shrink-0" />
                    </div>

                    <div className="flex md:hidden items-center justify-center gap-6 mt-6 opacity-70 hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full hover:bg-stone-200/50 text-stone-400 hover:text-primary transition-colors border border-transparent hover:border-stone-300"
                            aria-label="Scroll Left"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <div className="w-32 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary/30 rounded-full"
                                animate={{ x: ['-100%', '0%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            />
                        </div>

                        <button
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full hover:bg-stone-200/50 text-stone-400 hover:text-primary transition-colors border border-transparent hover:border-stone-300"
                            aria-label="Scroll Right"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={onOpenCalendar}
                            className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:text-gold hover:border-gold transition-colors"
                        >
                            Ver Calendário Completo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
