import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';

export default function CalendarModal({ isOpen, onClose, courses }) {
    if (!isOpen) return null;

    // Helper to parse dates and sort chronologically
    const getAllEvents = () => {
        const events = [];

        // 1. Static Courses with schedule
        courses.forEach(course => {
            if (course.details?.schedule && Array.isArray(course.details.schedule)) {
                course.details.schedule.forEach(dateStr => {
                    events.push({
                        date: dateStr,
                        title: course.title,
                        type: course.category || 'Curso',
                        time: course.time || '09h às 11h', // Default or specific
                        originalDate: dateStr // To do: parse real date for sorting if needed
                    });
                });
            } else if (course.date) {
                // Simple single date course
                events.push({
                    date: course.date.replace('Início: ', ''),
                    title: course.title,
                    type: course.category || 'Curso'
                });
            }
        });

        // Simple sort attempt (dd/mm)
        return events.sort((a, b) => {
            // Extract day/month/year roughly
            // Assumes dd/mm format basically
            return 0; // Keeping original order for now or need better parser
        });
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
                        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-stone-50">
                            <div>
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold block mb-2">Agenda 2026</span>
                                <h3 className="font-serif text-2xl md:text-3xl text-primary">Próximos Encontros</h3>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            {events.length > 0 ? (
                                <div className="space-y-4">
                                    {events.map((evt, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gold/30 hover:bg-gold/5 transition-colors group">
                                            <div className="w-14 h-14 bg-white rounded-lg border border-gray-100 flex flex-col items-center justify-center shadow-sm shrink-0">
                                                <CalendarIcon size={16} className="text-gold mb-1" />
                                                <span className="text-[10px] font-bold text-primary/60 uppercase">Data</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                                                    <h4 className="font-serif text-lg text-primary">{evt.date}</h4>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-primary/80 px-2 py-0.5 rounded-full">{evt.type}</span>
                                                </div>
                                                <p className="font-medium text-primary/80">{evt.title}</p>
                                                {evt.time && (
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-text/60">
                                                        <Clock size={12} /> {evt.time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p>Nenhuma data agendada no momento.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
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
