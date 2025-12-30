"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function CalendarModal({ isOpen, onClose, courses }) {
    if (!isOpen) return null;

    const MONTHS = {
        'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11,
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
        'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
    };

    const parseDate = (str, defaultYear = 2026) => {
        if (!str) return null;
        str = str.toLowerCase().trim();

        // 1. Format: "27/02" or "27/02/2026"
        const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
        if (slashMatch) {
            const day = parseInt(slashMatch[1]);
            const month = parseInt(slashMatch[2]) - 1;
            const year = slashMatch[3] ? parseInt(slashMatch[3]) : defaultYear;
            return new Date(year, month, day);
        }

        // 2. Format: "27 de fev" or "27 de fevereiro 2026"
        // Try to find month name
        for (const [monthName, monthIndex] of Object.entries(MONTHS)) {
            if (str.includes(monthName)) {
                const dayMatch = str.match(/(\d{1,2})/); // First number is day
                const yearMatch = str.match(/20\d{2}/); // Look for year like 2025, 2026

                const day = dayMatch ? parseInt(dayMatch[1]) : 1;
                const year = yearMatch ? parseInt(yearMatch[0]) : defaultYear;

                return new Date(year, monthIndex, day);
            }
        }

        return null; // parse failed
    };

    // Helper to parse dates and sort chronologically
    const getAllEvents = () => {
        let events = [];

        courses.forEach(course => {
            // Determine course year contexts if possible, else 2026
            const yearContext = course.date && course.date.includes('2025') ? 2025 : 2026;

            // 1. Static Schedule Array
            if (course.details?.schedule && Array.isArray(course.details.schedule)) {
                course.details.schedule.forEach(dateStr => {
                    const parsed = parseDate(dateStr, yearContext);
                    if (parsed) {
                        events.push({
                            timestamp: parsed.getTime(),
                            displayDate: parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                            monthName: parsed.toLocaleDateString('pt-BR', { month: 'long' }),
                            weekday: parsed.toLocaleDateString('pt-BR', { weekday: 'short' }),
                            title: course.title,
                            type: course.category || 'Curso',
                            time: course.time || 'Horário a confirmar',
                            link: course.link
                        });
                    }
                });
            } else if (course.date) {
                // 2. Single Date String parsing
                // Example: "Início: 27 de fev 2026" or "25 e 26 de abril 2026"
                // This is tricker, we take the FIRST date found
                const parsed = parseDate(course.date, yearContext);
                if (parsed) {
                    events.push({
                        timestamp: parsed.getTime(),
                        displayDate: parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        monthName: parsed.toLocaleDateString('pt-BR', { month: 'long' }),
                        weekday: parsed.toLocaleDateString('pt-BR', { weekday: 'short' }),
                        title: course.title,
                        type: course.category || 'Curso',
                        time: 'Verificar detalhes',
                        link: course.link
                    });
                }
            }
        });

        // Sort by timestamp
        return events.sort((a, b) => a.timestamp - b.timestamp);
    };

    const events = getAllEvents();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-stone-50 shrink-0">
                            <div>
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold block mb-2">Agenda 2026</span>
                                <h3 className="font-serif text-2xl md:text-3xl text-primary">Próximos Encontros</h3>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar flex-1">
                            {events.length > 0 ? (
                                <div className="space-y-4">
                                    {events.map((evt, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold/30 hover:bg-gold/5 transition-colors group bg-white">
                                            <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center shadow-sm shrink-0 group-hover:border-gold/30 transition-colors">
                                                <span className="text-xl font-serif font-bold text-primary">{evt.displayDate.split('/')[0]}</span>
                                                <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{evt.weekday.replace('.', '')}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/40 bg-gray-50 px-2 py-0.5 rounded-full w-fit">{evt.type}</span>
                                                    <span className="text-[10px] font-bold text-gray-300 hidden md:block capitalize">{evt.monthName}</span>
                                                </div>
                                                <h4 className="font-serif text-lg text-primary leading-tight mb-2 group-hover:text-gold transition-colors">{evt.title}</h4>

                                                <div className="flex items-center gap-4 text-xs text-text/60">
                                                    {evt.time && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-gold" /> {evt.time}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {evt.link && (
                                                <a href={evt.link} target="_blank" rel="noopener noreferrer" className="self-center p-2 text-primary/20 hover:text-gold transition-colors">
                                                    <ArrowUpRight size={20} />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="font-serif text-xl mb-2">Nenhuma data encontrada.</p>
                                    <p className="text-xs uppercase tracking-widest">Aguarde as novidades em breve.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-stone-50 border-t border-stone-100 text-center shrink-0 w-full relative z-10">
                            <a
                                href="https://wa.me/556992481585"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-gold transition-colors"
                            >
                                Dúvidas sobre a agenda? Fale Conosco <ArrowRight size={14} />
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
