import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ExternalLink, Heart, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AmbientPlayer from '../components/AmbientPlayer';

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
                            <button 
                                onClick={() => navigate('/portal')}
                                className="btn-secondary flex items-center justify-center gap-2 bg-white"
                            >
                                Formação Profissional <ArrowUpRight size={18} className="text-gray-400" />
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            {/* 3. Clean Clinical Section */}
            <section id="clinica" className="py-24 bg-white border-y border-gray-100">
                {/* ... existing content ... */}
            </section>

            {/* NEW: Founder Section */}
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
                                    src="/assets/lilian-vanessa.png" 
                                    alt="Lilian Vanessa Nicacio Gusmão" 
                                    className="w-full h-full object-cover"
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

            {/* 4. Institute Section (Expanded) */}
            <section id="instituto" className="py-24 bg-paper">
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
                                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000" 
                                alt="Ambiente do Instituto" 
                                className="w-full aspect-square object-cover rounded-full border-[12px] border-white shadow-2xl"
                            />
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 rounded-full blur-3xl" />
                        </motion.div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-xl">
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Instituto de Ensino</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Caminhos de Formação</h2>
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
                                onClick={() => navigate(`/curso/${course.id}`)}
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

            {/* 5. Blog Section (Enriched Content) */}
            <section id="blog" className="py-24 bg-white border-t border-gray-100">
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
                        {blogPosts.map((post, index) => (
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

            <Footer />
            <AmbientPlayer />
        </div>
    );
}
