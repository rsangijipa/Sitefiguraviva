"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, X, ArrowLeft } from 'lucide-react';
import { getMediatorDetails } from '@/utils/mediators';
import { Modal, ModalContent } from './ui/Modal';
import { useState } from 'react';

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: any;
}

export default function CourseModal({ isOpen, onClose, course }: CourseModalProps) {
    const [selectedMediator, setSelectedMediator] = useState<any>(null);

    if (!course) return null;

    const getCoverImage = () => {
        if (!course) return '';
        if (course.images && course.images.length > 0) return course.images[0];
        return course.image;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent size="xl" className="bg-paper overflow-y-auto max-h-[90vh]">
                <div className="relative">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-stone-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 md:p-12">
                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            {/* Left Column: Info */}
                            <div className="space-y-8">
                                <span className="inline-block bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                                    {course.status || 'Aberto'}
                                </span>

                                <div>
                                    <h1 className="font-serif text-3xl md:text-5xl text-primary leading-tight mb-4">{course.title}</h1>
                                    {course.subtitle && <p className="text-xl font-serif italic text-gold/80 leading-snug">{course.subtitle}</p>}
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
                                                        onClick={() => setSelectedMediator(details)}
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
                                </div>

                                <button
                                    onClick={() => window.open(course.link, '_blank')}
                                    className="w-full md:w-auto px-8 py-4 bg-primary text-paper rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-gold hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
                                >
                                    Inscrever-se Agora <ExternalLink size={14} />
                                </button>
                            </div>

                            {/* Right Column: Image */}
                            <div className="relative">
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                                    <img src={getCoverImage()} alt={course.title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Details */}
                        <div className="mt-16 pt-16 border-t border-stone-100">
                            <div className="grid md:grid-cols-12 gap-12">
                                <div className="md:col-span-8 space-y-12">
                                    <section>
                                        <h3 className="font-serif text-2xl text-primary mb-6">O que você vai vivenciar</h3>
                                        <p className="text-lg text-primary/70 font-light leading-relaxed whitespace-pre-line">
                                            {course.details?.intro || course.description}
                                        </p>
                                    </section>

                                    {course.details?.format && (
                                        <section className="bg-stone-50 p-8 rounded-2xl border border-stone-100">
                                            <h3 className="font-serif text-xl text-primary mb-6">Como funciona</h3>
                                            <div className="text-primary/70 leading-relaxed space-y-4">
                                                {Array.isArray(course.details.format) ? (
                                                    <ul className="space-y-4 text-sm">
                                                        {course.details.format.map((item: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-4">
                                                                <span className="w-1.5 h-1.5 mt-2 rounded-full bg-gold shrink-0" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="whitespace-pre-line text-sm">{course.details.format}</p>
                                                )}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                <div className="md:col-span-4">
                                    {course.details?.schedule && (
                                        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                                            <h4 className="font-bold text-primary text-xs uppercase tracking-widest mb-6">Cronograma</h4>
                                            <div className="space-y-3">
                                                {Array.isArray(course.details.schedule) ? (
                                                    course.details.schedule.map((date: string, i: number) => (
                                                        <div key={i} className="bg-stone-50 px-3 py-2 rounded text-center">
                                                            <span className="text-xs font-bold text-primary/70">{date}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-primary/70 whitespace-pre-line">{course.details.schedule}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mediator Sub-modal/Overlay */}
                <AnimatePresence>
                    {selectedMediator && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setSelectedMediator(null)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white max-w-xl w-full rounded-3xl relative z-10 shadow-2xl p-8 overflow-y-auto max-h-[80vh]"
                            >
                                <button onClick={() => setSelectedMediator(null)} className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors">
                                    <X size={24} />
                                </button>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6">
                                        {selectedMediator.image ? (
                                            <img src={selectedMediator.image} alt={selectedMediator.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300 text-4xl">
                                                {selectedMediator.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-serif text-primary mb-4">{selectedMediator.name}</h3>
                                    <p className="text-gray-600 font-light leading-relaxed whitespace-pre-line">
                                        {selectedMediator.bio || 'Sem biografia disponível.'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </ModalContent>
        </Modal>
    );
}
