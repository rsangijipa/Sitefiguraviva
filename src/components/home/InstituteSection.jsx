import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InstituteSection({ courses, onOpenCalendar }) {
    const navigate = useNavigate();

    const formacoes = courses.filter(c => c.category === 'Formacao');
    const grupos = courses.filter(c => c.category === 'GrupoEstudos');
    const cursos = courses.filter(c => c.category === 'Curso');

    const getCoverImage = (course) => {
        if (course.images && course.images.length > 0) return course.images[0];
        return course.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000';
    };

    return (
        <section id="instituto" className="py-16 md:py-24 bg-paper border-t border-stone-100">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* Institute Header */}
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

                {/* UNIFIED LIST OF ACTIVITIES */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Instituto de Ensino</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Grupos e <span className="italic text-gold font-light">Formações</span></h2>
                        <p className="text-lg text-text/80 mt-4 max-w-2xl">
                            Confira nossa agenda completa de atividades presenciais e online.
                        </p>
                    </div>
                    <button
                        onClick={onOpenCalendar}
                        className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-text hover:text-primary transition-colors"
                    >
                        Ver Calendário Completo <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Render Formations first */}
                    {formacoes.map((course, index) => (
                        <motion.div
                            key={`fmt-${course.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden border border-purple-100/50 shadow-sm hover:shadow-xl transition-all duration-300 group h-full flex flex-col"
                        >
                            <div className="h-56 overflow-hidden relative shrink-0">
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
                                <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-purple-900 z-20">
                                    Formação
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-widest mb-4">
                                        <Calendar size={14} /> {course.date}
                                    </div>
                                    <h3 className="font-serif text-2xl text-primary leading-tight mb-4">{course.title}</h3>
                                    <p className="text-sm text-text/60 line-clamp-3">{course.description}</p>
                                </div>
                                <button onClick={() => navigate(`/curso/${course.id}`)} className="w-full mt-6 py-4 border border-purple-100 rounded-xl text-xs font-bold uppercase tracking-widest text-purple-900 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                    Ver Programa <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Render Groups next */}
                    {grupos.map((course, index) => (
                        <motion.div
                            key={`grp-${course.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden border border-blue-100/50 shadow-sm hover:shadow-xl transition-all duration-300 group h-full flex flex-col"
                        >
                            <div className="h-56 overflow-hidden relative shrink-0">
                                <div className="absolute top-0 left-0 w-full h-full bg-blue-900/5 z-10 group-hover:bg-transparent transition-colors duration-500" />
                                <span className={`absolute top-4 left-4 z-20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-white/90 shadow-sm ${course.status === 'Aberto' ? 'text-green-700' : 'text-red-700'}`}>
                                    {course.status}
                                </span>
                                <img
                                    src={getCoverImage(course)}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-blue-900 z-20">
                                    Grupo de Estudos
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
                                        <Calendar size={14} /> {course.date}
                                    </div>
                                    <h3 className="font-serif text-2xl text-primary leading-tight mb-4">{course.title}</h3>
                                    <p className="text-sm text-text/60 line-clamp-3">{course.description}</p>
                                </div>
                                <button onClick={() => navigate(`/curso/${course.id}`)} className="w-full mt-6 py-4 border border-blue-100 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-900 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                    Saiba Mais <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Render Other Courses */}
                    {cursos.map((course, index) => (
                        <motion.div
                            key={`crs-${course.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover group h-full flex flex-col"
                        >
                            <div className="h-56 overflow-hidden relative shrink-0">
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
                                <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-gray-500 z-20">
                                    Curso Livre
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
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
                                    className="w-full mt-6 py-4 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"
                                >
                                    Ver Detalhes <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty State */}
                    {[...formacoes, ...grupos, ...cursos].length === 0 && (
                        <div className="col-span-3 text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="mb-4 font-serif text-xl text-gray-400">Nenhuma atividade agendada no momento.</p>
                            <p className="text-xs font-bold uppercase tracking-widest">Acompanhe nossas redes para novidades.</p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
