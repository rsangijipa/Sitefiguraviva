import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ExternalLink, Heart, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Minimalist Fade Variant
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function PublicHome() {
    const { courses, alertMessage, blogPosts } = useApp();
    const navigate = useNavigate();

    return (
        <div className="bg-paper min-h-screen text-text font-sans antialiased selection:bg-accent/20">

            {/* 1. Alert Bar */}
            {alertMessage && (
                <div className="bg-primary text-white text-xs font-bold tracking-widest uppercase text-center py-3 px-4 relative z-50">
                    {alertMessage}
                </div>
            )}

            <Navbar />

            {/* 2. Minimalist Hero */}
            <header className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 bg-paper">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl"
                    >
                        <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
                            <span className="w-12 h-[1px] bg-primary/20"></span>
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/60">Instituto de Gestalt-Terapia</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="font-serif text-6xl md:text-8xl text-primary leading-[0.95] tracking-tight mb-8">
                            Habitar a <span className="italic text-gold font-light">Fronteira</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-text font-light leading-relaxed mb-12 max-w-2xl text-balance">
                            Um espaço vivo de acolhimento clínico e formação profissional, onde o encontro transforma.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                            <a href="#clinica" className="btn-primary flex items-center justify-center gap-2">
                                Começar Terapia <ArrowRight size={18} />
                            </a>
                            <a href="#instituto" className="btn-secondary flex items-center justify-center gap-2 bg-white">
                                Formação Profissional <ArrowUpRight size={18} className="text-gray-400" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            {/* 3. Clean Clinical Section */}
            <section id="clinica" className="py-24 bg-white border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-6xl grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000"
                                alt="Sessão de Terapia"
                                className="w-full aspect-[4/5] object-cover rounded-2xl shadow-xl"
                            />
                            <div className="absolute -bottom-6 -right-6 w-full h-full border border-gray-200 rounded-2xl -z-10" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">Abordagem Clínica</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8 leading-tight">A Arte da <span className="italic text-gold font-light">Presença</span></h2>
                        <p className="text-lg text-text/80 mb-8 leading-relaxed">
                            Na Gestalt-Terapia, não buscamos apenas "consertar" o que está errado. Buscamos ampliar a <span className="text-primary font-medium">awareness</span> sobre como você existe no mundo, aqui e agora.
                        </p>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-paper transition-colors cursor-default">
                                <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-primary mb-1">Atendimento Individual</h4>
                                    <p className="text-sm text-text/70">Sessões semanais focadas no seu processo de crescimento.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-paper transition-colors cursor-default">
                                <div className="w-2 h-2 mt-2 rounded-full bg-accent flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-primary mb-1">Supervisão Clínica</h4>
                                    <p className="text-sm text-text/70">Suporte para terapeutas em formação ou profissionais.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <button className="text-primary font-bold border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors">
                                Agendar Sessão de Avaliação
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 4. Institute Section (Clean Cards) */}
            <section id="instituto" className="py-24 bg-paper">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-xl">
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Instituto de Ensino</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Formação & Cursos</h2>
                        </div>
                        <a href="#" className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-text hover:text-primary transition-colors">
                            Ver Calendário Completo <ArrowRight size={14} />
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover group"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <span className={`absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-white/90 shadow-sm ${course.status === 'Aberto' ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                        {course.status}
                                    </span>
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-8 flex flex-col h-[280px]">
                                    <div className="mb-auto">
                                        <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest mb-4">
                                            <Calendar size={14} />
                                            {course.date}
                                        </div>
                                        <h3 className="font-serif text-2xl text-primary leading-tight mb-4 group-hover:text-gold transition-colors">
                                            {course.title}
                                        </h3>
                                    </div>

                                    <button
                                        onClick={() => window.open(course.link, '_blank')}
                                        className="w-full py-4 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"
                                    >
                                        Ver Detalhes <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Minimalist Blog Grid */}
            <section id="blog" className="py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-text/40 mb-4 block">Diário Visual</span>
                        <h2 className="text-4xl font-serif text-primary">Arquivo de Sentidos</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {blogPosts.map((post) => (
                            <Link to={`/blog/${post.id}`} key={post.id} className="group block cursor-pointer">
                                <div className="mb-6 overflow-hidden rounded-xl bg-gray-50 aspect-[4/3] relative">
                                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
                                    {/* Placeholder for blog image if exists, utilizing abstract patterns if not */}
                                    <div className="w-full h-full flex items-center justify-center text-primary/10">
                                        <div className="w-16 h-16 rounded-full border-2 border-current" />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-gold mb-3 block">{post.date}</span>
                                    <h3 className="font-serif text-2xl text-primary mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-text/60 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
