"use client";

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { libraryContent } from '../../data/staticContent';

export default function LibrarySection() {
    return (
        <section id="biblioteca" className="py-24 bg-white border-t border-gray-100">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="mb-16">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Acervo</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">{libraryContent.title}</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {libraryContent.items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 group"
                        >
                            <div className="h-64 bg-paper/50 flex items-center justify-center relative overflow-hidden p-8">
                                <span className="absolute top-6 left-6 z-10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded bg-white shadow-sm text-primary">
                                    {item.title}
                                </span>
                                <div className="text-primary/10 font-serif text-8xl absolute -right-4 -bottom-4 select-none group-hover:text-gold/10 transition-colors">
                                    {item.coverText}
                                </div>
                                <h3 className="font-serif text-6xl text-gold group-hover:scale-105 transition-transform duration-700 select-none">
                                    {item.coverText}
                                </h3>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-primary/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <FileText size={14} /> {item.type}
                                </div>
                                <h4 className="font-serif text-2xl text-primary leading-tight mb-4 group-hover:text-gold transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-primary/60 mb-8 leading-relaxed">
                                    {item.description}
                                </p>
                                <button
                                    onClick={() => window.open(item.fileUrl, '_blank')}
                                    className="w-full py-4 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"
                                >
                                    Ler PDF <FileText size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
