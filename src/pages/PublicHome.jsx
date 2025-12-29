import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, ExternalLink, Heart, ArrowUpRight, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AmbientPlayer from '../components/AmbientPlayer';
import PDFReader from '../components/PDFReader';

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
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isReaderOpen, setIsReaderOpen] = useState(false);

    // Filters
    const formacoes = courses.filter(c => c.category === 'Formacao');
    const grupos = courses.filter(c => c.category === 'GrupoEstudos');
    const cursos = courses.filter(c => !c.category || c.category === 'Curso');

    const openReader = (article) => {
        setSelectedArticle(article);
        setIsReaderOpen(true);
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://w.behold.so/widget.js';
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const getCoverImage = (course) => {
        if (course.images && course.images.length > 0) return course.images[0];
        return course.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000';
    };

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
            <header className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 bg-paper relative overflow-hidden">
                {/* Background Logo Texture */}
                <div className="absolute top-0 left-0 w-full h-full z-0 select-none">
                    <img
                        src="/assets/logo-figura-viva.jpg"
                        className="w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] absolute -right-[20%] -top-[10%] object-contain opacity-80 mix-blend-multiply"
                        style={{
                            maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
                            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)'
                        }}
                        alt=""
                        width="1920"
                        height="1080"
                    />
                </div>
                <div className="absolute top-0 left-0 w-full h-full z-0 bg-paper/80 mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-paper/40 via-paper/60 to-paper" />
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl relative z-10"
                    >
                        <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
                            <span className="w-12 h-[1px] bg-primary/20"></span>
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/60">Instituto de Gestalt-Terapia</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="font-serif text-5xl sm:text-6xl md:text-8xl text-primary leading-[0.95] tracking-tight mb-8">
                            Habitar a <span className="italic text-gold font-light">Fronteira</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-text font-light leading-relaxed mb-12 max-w-2xl text-balance">
                            Um espaço vivo de acolhimento clínico e formação profissional, onde o encontro transforma.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="https://wa.me/556992481585"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                Agendamento <ArrowRight size={18} aria-hidden="true" />
                            </a>
                            <a
                                href="#cursos"
                                className="btn-secondary flex items-center justify-center gap-2 bg-white"
                                aria-label="Ver cursos livres"
                            >
                                Cursos Livres <ArrowUpRight size={18} className="text-gray-400" aria-hidden="true" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </header>



            {/* NEW: Founder Section */}
            <section id="fundadora" className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="order-2 lg:order-1"
                        >
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Fundadora</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8 leading-tight">Lilian Vanessa <span className="italic text-gold font-light">Nicacio Gusmão</span></h2>

                            <div className="space-y-6 text-lg text-text/80 leading-relaxed font-light">
                                <p>
                                    Psicóloga (CRP 20/1228) e Mestre em Ciências Ambientais pela UNITAU, Lilian Vanessa dedica sua trajetória à integração entre a fenomenologia, a natureza e o desenvolvimento humano.
                                </p>
                                <p>
                                    Com formação sólida em <span className="text-primary font-medium text-base uppercase tracking-wider">Gestalt-Terapia</span> pelo Instituto da Bahia, sua atuação transita entre a clínica, a supervisão e a docência, tendo coordenado a Clínica-Escola de Psicologia da UNIJIPA.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gold flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-1">Especialista</h4>
                                            <p className="text-xs text-text/60">Gestalt-Terapia e Psicologia do Trânsito (CFP).</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gold flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-1">Pesquisadora</h4>
                                            <p className="text-xs text-text/60">Foco em prevenção de transtornos emocionais e interação natureza-criança.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <a
                                        href="http://lattes.cnpq.br/"
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
                                    src="/assets/lilian-vanessa.jpeg"
                                    alt="Lilian Vanessa Nicacio Gusmão"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    width="500"
                                    height="625"
                                />
                            </div>
                            <div className="absolute -top-10 -right-10 w-full h-full border-2 border-gold/20 rounded-[2rem] -z-10" />
                            <div className="absolute -bottom-6 -left-6 bg-paper p-8 rounded-2xl shadow-xl z-20 hidden md:block border border-gray-100">
                                <p className="font-serif italic text-primary text-lg leading-snug">
                                    "O encontro é a fronteira onde a vida se renova."
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* NEW: Formation Section */}
            {formacoes.length > 0 && (
                <section id="formacoes" className="py-16 md:py-24 bg-stone-100/30 border-t border-stone-100">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="mb-16">
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-600 mb-4 block">Longa Duração</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Formações em <span className="italic text-gold font-light">Gestalt</span></h2>
                            <p className="text-lg text-text/80 mt-4 max-w-2xl">Percursos aprofundados para o desenvolvimento da identidade clínica.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {formacoes.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl overflow-hidden border border-purple-100/50 shadow-sm hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="h-56 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-full h-full bg-purple-900/10 z-10 group-hover:bg-transparent transition-colors duration-500" />
                                        <span className={`absolute top-4 left-4 z-20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-white/90 shadow-sm ${course.status === 'Aberto' ? 'text-green-700' : 'text-red-700'}`}>
                                            {course.status}
                                        </span>
                                        <img
                                            src={getCoverImage(course)}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-8">
                                        <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-widest mb-4">
                                            <Calendar size={14} /> {course.date}
                                        </div>
                                        <h3 className="font-serif text-2xl text-primary leading-tight mb-4">{course.title}</h3>
                                        {course.description && <p className="text-sm text-text/60 mb-6 line-clamp-2">{course.description}</p>}
                                        <button onClick={() => navigate(`/curso/${course.id}`)} className="w-full py-4 border border-purple-100 rounded-xl text-xs font-bold uppercase tracking-widest text-purple-900 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                            Ver Programa <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* NEW: Study Groups Section */}
            {grupos.length > 0 && (
                <section id="grupos" className="py-16 md:py-24 bg-white border-t border-stone-100">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div className="max-w-xl">
                                <span className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-4 block">Estudos Contínuos</span>
                                <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Grupos de <span className="italic text-blue-400 font-light">Estudos</span></h2>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {grupos.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col md:flex-row bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className="w-full md:w-1/3 relative h-48 md:h-auto">
                                        <img src={getCoverImage(course)} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                                            <Calendar size={14} /> {course.date}
                                        </div>
                                        <h3 className="font-serif text-2xl text-primary mb-3">{course.title}</h3>
                                        {course.description && <p className="text-sm text-text/60 mb-6 line-clamp-2">{course.description}</p>}
                                        <button onClick={() => navigate(`/curso/${course.id}`)} className="text-xs font-bold uppercase tracking-widest text-primary hover:text-blue-600 flex items-center gap-2 transition-colors">
                                            Saiba Mais <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Institute Section (Standard Courses) */}
            <section id="instituto" className="py-16 md:py-24 bg-paper border-t border-stone-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Nossa Essência</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-8 leading-tight">Um Solo Fértil para o <span className="italic text-gold font-light">Devir</span></h2>
                            <p className="text-lg text-text/80 mb-6 leading-relaxed">
                                O Instituto Figura Viva nasceu do desejo de criar um espaço onde a clínica e o ensino caminham juntos. Somos uma comunidade dedicada ao estudo e à prática da Gestalt-Terapia, fundamentada na ética do cuidado e na estética do encontro.
                            </p>
                            <p className="text-lg text-text/80 mb-8 leading-relaxed">
                                Mais do que uma escola, somos um organismo vivo que busca integrar o saber acadêmico com a experiência sentida, formando profissionais capazes de sustentar a presença e acolher a singularidade.
                            </p>
                            <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
                                <div>
                                    <h5 className="font-serif text-3xl text-primary mb-1">10+</h5>
                                    <p className="text-xs font-bold tracking-widest uppercase text-text/50">Anos de Prática</p>
                                </div>
                                <div>
                                    <h5 className="font-serif text-3xl text-primary mb-1">500+</h5>
                                    <p className="text-xs font-bold tracking-widest uppercase text-text/50">Alunos Formados</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <img
                                src="/assets/foto-grupo.jpg"
                                alt="Ambiente do Instituto"
                                className="w-full aspect-square object-cover rounded-full border-[12px] border-white shadow-2xl"
                                loading="lazy"
                                width="800"
                                height="800"
                            />
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 rounded-full blur-3xl" />
                        </motion.div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-xl">
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Instituto de Ensino</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Cursos Livres</h2>
                        </div>
                        <a href="#" className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-text hover:text-primary transition-colors">
                            Ver Calendário Completo <ArrowRight size={14} />
                        </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {cursos.length > 0 ? cursos.map((course, index) => (
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
                                        src={getCoverImage(course)}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
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
                                        onClick={() => navigate(`/curso/${course.id}`)}
                                        className="w-full py-4 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"
                                    >
                                        Ver Detalhes <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-3 text-center py-12 text-gray-400">
                                Nenhum curso breve agendado no momento. Confira nossas Formações e Grupos de Estudos!
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 5. Blog Section (Enriched Content) */}
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
                                        onClick={() => openReader(post)}
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

            {/* NEW: Instagram Section */}
            <section className="py-16 md:py-24 bg-surface border-t border-stone-100">
                <div className="container mx-auto px-6 max-w-6xl text-center mb-12">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">@institutofiguraviva</span>
                    <h2 className="text-3xl md:text-4xl font-serif text-primary">Nos Acompanhe no Instagram</h2>
                </div>
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <behold-widget feed-id="e6Ie6LXMRqDXJvfkbx6U"></behold-widget>
                </div>
            </section>

            <Footer />
            <AmbientPlayer />
            <PDFReader
                isOpen={isReaderOpen}
                onClose={() => setIsReaderOpen(false)}
                article={selectedArticle}
            />
        </div>
    );
}
