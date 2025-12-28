"use client";

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { founderContent } from '../../data/staticContent';

export default function FounderSection() {
    return (
        <section id="fundadora" className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="order-2 lg:order-1"
                    >
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">{founderContent.role}</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8 leading-tight">
                            {founderContent.name} <span className="italic text-gold font-light">{founderContent.surname}</span>
                        </h2>

                        <div className="space-y-6 text-lg text-primary/80 leading-relaxed font-light">
                            {founderContent.description.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                                {founderContent.specializations.map((spec, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gold flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-1">{spec.title}</h4>
                                            <p className="text-xs text-primary/60">{spec.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8">
                                <a
                                    href={founderContent.lattesLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-b border-primary pb-1 hover:text-gold hover:border-gold transition-colors"
                                >
                                    Acesse o Currículo Lattes <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="order-1 lg:order-2 relative"
                    >
                        <div className="relative z-10 aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                            <img
                                src={founderContent.image}
                                alt={`${founderContent.name} ${founderContent.surname}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -top-10 -right-10 w-full h-full border-2 border-gold/20 rounded-[2rem] -z-10" />
                        <div className="absolute -bottom-6 -left-6 bg-paper p-8 rounded-2xl shadow-xl z-20 hidden md:block border border-gray-100">
                            <p className="font-serif italic text-primary text-lg leading-snug">
                                "{founderContent.quote}"
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
