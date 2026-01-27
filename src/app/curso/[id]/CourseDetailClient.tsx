"use client";

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ArrowLeft, ExternalLink, X } from 'lucide-react';
import { getMediatorDetails } from '@/utils/mediators';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CourseDetailClient({ course }: { course: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Derive Mediator State from URL
    const mediatorParam = searchParams.get('mediator');
    let selectedMediator: any = null;

    if (mediatorParam && course) {
        if (course.mediators && Array.isArray(course.mediators)) {
            const foundInCourse = course.mediators.find((m: any) => {
                if (typeof m === 'string') return m === mediatorParam;
                return m.name === mediatorParam;
            });
            if (foundInCourse) {
                selectedMediator = getMediatorDetails(foundInCourse);
            }
        }
        if (!selectedMediator) {
            selectedMediator = getMediatorDetails(mediatorParam);
        }
    }

    const getCoverImage = () => {
        if (!course) return '';
        if (course.images && course.images.length > 0) return course.images[0];
        return course.image;
    };

    const getGalleryImages = () => {
        if (!course || !course.images || course.images.length <= 1) return [];
        return course.images.slice(1);
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const galleryImages = getGalleryImages();
    const allImages = course.images && course.images.length > 0 ? course.images : [course.image];

    return (
        <div className="bg-paper min-h-screen">
            <Navbar />
            <main className="pt-32 pb-20 md:pt-40">
                <div className="container mx-auto px-6 max-w-6xl relative">

                    <button
                        onClick={() => router.push('/#instituto')}
                        className="hidden md:flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-[10px] mb-12 hover:translate-x-[-5px] transition-transform"
                    >
                        <ArrowLeft size={14} /> Voltar para Cursos
                    </button>

                    <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                                {course.status || 'Aberto'}
                            </span>

                            <div>
                                <h1 className="font-serif text-4xl md:text-6xl text-primary leading-tight mb-4">{course.title}</h1>
                                {course.subtitle && <p className="text-xl md:text-2xl font-serif italic text-gold/80 leading-snug">{course.subtitle}</p>}
                            </div>

                            {course.mediators && Array.isArray(course.mediators) && course.mediators.length > 0 && (
                                <div className="border-l-4 border-accent/20 pl-6 py-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Mediadoras</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {course.mediators.map((mediator: any, index: number) => {
                                            const details = getMediatorDetails(mediator);
                                            if (!details) return null;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        const name = typeof mediator === 'string' ? mediator : mediator.name;
                                                        const current = new URLSearchParams(Array.from(searchParams.entries()));
                                                        current.set('mediator', name);
                                                        router.push(`${pathname}?${current.toString()}`);
                                                    }}
                                                    className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gold/30 group"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                                                        {details.image ? (
                                                            <img src={details.image} alt={details.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-bold">
                                                                {details.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-primary group-hover:text-gold transition-colors">{details.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 text-primary/70">
                                    <Calendar className="text-gold shrink-0" size={20} />
                                    <span className="font-light text-lg">{course.date}</span>
                                </div>
                                <div className="flex items-center gap-4 text-primary/70">
                                    <MapPin className="text-gold shrink-0" size={20} />
                                    <span className="font-light text-lg">Online via Zoom</span>
                                </div>
                                {course.tags && Array.isArray(course.tags) && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {(Array.isArray(course.tags) ? course.tags : (typeof course.tags === 'string' ? course.tags.split(',') : [])).map((tag: string) => (
                                            <span key={tag} className="px-3 py-1 bg-white border border-gray-100 rounded text-[10px] uppercase font-bold text-gray-400">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => router.push(`/inscricao/${course.id}`)}
                                className="w-full md:w-auto px-8 py-4 bg-primary text-paper rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-gold hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
                            >
                                Fazer Inscrição <ExternalLink size={14} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative cursor-pointer group"
                            onClick={() => openLightbox(0)}
                        >
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-8 border-white bg-white">
                                <img src={getCoverImage()} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-12 gap-12">
                        <div className="md:col-span-8 space-y-16">
                            <section>
                                <h3 className="font-serif text-3xl text-primary mb-6">O que você vai vivenciar</h3>
                                <p className="text-lg text-primary/70 font-light leading-relaxed whitespace-pre-line">
                                    {course.details?.intro || course.description}
                                </p>
                            </section>

                            {course.details?.format && (
                                <section className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
                                    <h3 className="font-serif text-2xl text-primary mb-6">Como funciona</h3>
                                    <div className="text-primary/70 leading-relaxed space-y-4">
                                        {Array.isArray(course.details.format) ? (
                                            <ul className="space-y-4">
                                                {course.details.format.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-4">
                                                        <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-accent shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="whitespace-pre-line">{course.details.format}</p>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="md:col-span-4 space-y-8">
                            {course.details?.schedule && (
                                <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 sticky top-32">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Cronograma</h4>
                                            {Array.isArray(course.details.schedule) && <p className="text-xs text-primary/50">{course.details.schedule.length} Encontros</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-8">
                                        {Array.isArray(course.details.schedule) ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                {course.details.schedule.map((date: string, i: number) => (
                                                    <div key={i} className="bg-white px-3 py-2 rounded border border-stone-100 text-center">
                                                        <span className="text-sm font-bold text-primary/80">{date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-primary/70 whitespace-pre-line">{course.details.schedule}</p>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-primary/50 mb-4">Tem alguma dúvida?</p>
                                        <a
                                            href="https://wa.me/556992481585"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-3 border border-green-200 bg-green-50 text-green-700 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            Falar no WhatsApp
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
                    >
                        <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X size={32} />
                        </button>
                        <div className="max-w-5xl max-h-screen">
                            <img src={allImages[lightboxIndex]} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedMediator && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => {
                            const current = new URLSearchParams(Array.from(searchParams.entries()));
                            current.delete('mediator');
                            router.push(`${pathname}?${current.toString()}`);
                        }} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white max-w-2xl w-full rounded-3xl relative z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            <button onClick={() => {
                                const current = new URLSearchParams(Array.from(searchParams.entries()));
                                current.delete('mediator');
                                router.push(`${pathname}?${current.toString()}`);
                            }} className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors z-20">
                                <X size={24} />
                            </button>

                            <div className="overflow-y-auto p-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-stone-100 overflow-hidden shrink-0 border-4 border-white shadow-lg mx-auto md:mx-0">
                                        {selectedMediator.image ? (
                                            <img src={selectedMediator.image} alt={selectedMediator.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl font-serif">
                                                {selectedMediator.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif text-primary mb-2 text-center md:text-left">{selectedMediator.name}</h3>
                                        <div className="w-10 h-1 bg-gold/30 mb-6 mx-auto md:mx-0 rounded-full" />
                                        <p className="text-lg text-gray-600 leading-relaxed font-light whitespace-pre-line text-center md:text-left">
                                            {selectedMediator.bio || 'Sem biografia disponível.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
