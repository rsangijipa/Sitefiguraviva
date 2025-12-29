import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlogSection({ blogPosts, onOpenReader }) {
    return (
        <section id="blog" className="py-16 md:py-24 bg-white border-t border-stone-100">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Reflexões & Saberes</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Blog Figura Viva</h2>
                        <p className="text-lg text-text/60 mt-4">
                            Artigos, ensaios e pílulas de awareness sobre a clínica, a vida e o encontro.
                        </p>
                    </div>
                    <Link to="/blog/1" className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-primary hover:text-gold transition-colors">
                        Ver Todas as Publicações <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {/* Itens da Biblioteca (PDFs) */}
                    {blogPosts.filter(post => post.type === 'library').map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 group"
                        >
                            <div className={`h-64 ${index % 2 === 0 ? 'bg-paper/50' : 'bg-accent/5'} flex items-center justify-center relative overflow-hidden p-8`}>
                                <span className="absolute top-6 left-6 z-10 px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded bg-white shadow-sm text-primary">
                                    Biblioteca
                                </span>
                                <div className={`text-primary/10 font-serif text-8xl absolute -right-4 -bottom-4 select-none group-hover:text-gold/10 transition-colors`}>
                                    {post.title.substring(0, 4).toUpperCase()}
                                </div>
                                <h3 className={`font-serif text-6xl ${index % 2 === 0 ? 'text-gold' : 'text-accent'} group-hover:scale-105 transition-transform duration-700 select-none`}>
                                    {post.title.substring(0, 4).toUpperCase()}
                                </h3>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-text/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <FileText size={14} /> {post.category || 'Artigo Técnico'}
                                </div>
                                <h4 className="font-serif text-2xl text-primary leading-tight mb-4 group-hover:text-gold transition-colors">
                                    {post.title}
                                </h4>
                                <p className="text-sm text-text/60 mb-8 leading-relaxed line-clamp-3">
                                    {post.excerpt || "Clique para ler o artigo completo extraído do arquivo PDF original."}
                                </p>
                                <button
                                    onClick={() => onOpenReader(post)}
                                    className="mt-auto text-primary font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-gold transition-colors"
                                >
                                    Ler Artigo <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Blog Posts (Dinâmicos) */}
                    {blogPosts.filter(post => post.type === 'blog' || !post.type).map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/blog/${post.id}`} className="group block">
                                <div className="relative mb-8 overflow-hidden rounded-2xl aspect-[16/10] bg-paper">
                                    <img
                                        src={post.image || `https://images.unsplash.com/photo-${1550000000000 + index}?auto=format&fit=crop&q=80&w=800`}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <span className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-primary">
                                            Ler Artigo
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-gold">
                                            {post.category || 'Gestalt-Terapia'}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-text/40">
                                            {post.date}
                                        </span>
                                    </div>
                                    <h3 className="font-serif text-2xl text-primary leading-snug group-hover:text-gold transition-colors duration-300">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-text/60 line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="pt-2 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                                        Continuar Lendo <ArrowUpRight size={12} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
