"use client";

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function EventsSection() {
    return (
        <section id="agenda" className="py-24 md:py-48 bg-paper relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-24 items-center">
                    <div className="lg:w-[40%]">
                        <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">Presença em Fluxo</span>
                        <h2 className="font-serif text-5xl md:text-7xl text-primary mb-12 leading-none">Encontros & Eventos</h2>
                        <p className="text-primary/70 font-light mb-12 leading-relaxed text-xl text-balance">
                            Nossa agenda é um organismo vivo. Aqui você encontra workshops abertos, grupos de estudos e supervisões públicas.
                        </p>

                        <div className="space-y-8">
                            <motion.div
                                whileHover={{ x: 10 }}
                                className="flex items-start gap-6 group cursor-pointer p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-soft border border-transparent hover:border-primary/5"
                            >
                                <div className="w-14 h-14 rounded-full glass border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-soft shadow-lg">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-primary mb-1">Próximo Grupo de Estudos</h4>
                                    <p className="text-sm text-sage flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                        Quinta-feira, 19h • Online
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="lg:w-[60%] relative"
                    >
                        <div className="absolute -inset-4 bg-primary rounded-[2.5rem] rotate-2 opacity-5" />
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                            <iframe
                                src="https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=America%2FSao_Paulo&src=YOUR_CALENDAR_ID&color=%23039BE5"
                                style={{ border: 0 }}
                                width="100%"
                                height="500"
                                frameBorder="0"
                                scrolling="no"
                                title="Agenda Figura Viva"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
