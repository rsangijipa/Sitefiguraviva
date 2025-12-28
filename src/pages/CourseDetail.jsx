import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink } from 'lucide-react';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            const data = await courseService.getById(id);
            setCourse(data);
            setLoading(false);
        };
        fetchCourse();
    }, [id]);

    const getCoverImage = () => {
        if (!course) return '';
        if (course.images && course.images.length > 0) return course.images[0];
        return course.image;
    };

    const getGalleryImages = () => {
        if (!course || !course.images || course.images.length <= 1) return [];
        return course.images.slice(1); // Exclude the cover image
    };

    const openLightbox = (index) => {
        // Index relative to all images (cover + gallery)
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center font-serif text-3xl">Carregando...</div>;
    if (!course) return <div className="min-h-screen bg-paper flex items-center justify-center font-serif text-3xl">Curso não encontrado.</div>;

    const galleryImages = getGalleryImages();
    const allImages = course.images && course.images.length > 0 ? course.images : [course.image];

    return (
        <div className="bg-paper min-h-screen">
            <Navbar />
            <main className="pt-40 pb-20">
                <div className="container mx-auto px-6">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-[10px] mb-12 hover:translate-x-[-5px] transition-transform">
                        <ArrowLeft size={14} /> Voltar
                    </button>

                    <div className="grid lg:grid-cols-2 gap-20 items-start mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-10"
                        >
                            <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">{course.status}</span>
                            <h1 className="font-serif text-5xl md:text-7xl text-primary leading-tight">{course.title}</h1>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-primary/60">
                                    <Calendar className="text-gold" size={20} />
                                    <span className="font-light text-lg">{course.date}</span>
                                </div>
                                <div className="flex items-center gap-4 text-primary/60">
                                    <MapPin className="text-gold" size={20} />
                                    <span className="font-light text-lg">Online via Zoom / Presencial em SP</span>
                                </div>
                                <div className="flex items-center gap-4 text-primary/60">
                                    <Clock className="text-gold" size={20} />
                                    <span className="font-light text-lg">Carga horária: 40 horas</span>
                                </div>
                            </div>

                            <p className="text-primary/70 text-xl font-light leading-relaxed">
                                Este curso propõe um mergulho profundo na fenomenologia e na prática clínica.
                                Ideal para psicólogos e estudantes que buscam aprimorar seu olhar para o campo e para o encontro.
                            </p>

                            <button
                                onClick={() => window.open(course.link, '_blank')}
                                className="px-12 py-6 bg-primary text-paper rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold transition-soft flex items-center gap-3"
                            >
                                Inscrever-se Agora <ExternalLink size={14} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative cursor-pointer group"
                            onClick={() => openLightbox(0)}
                        >
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(38,58,58,0.2)]">
                                <img src={getCoverImage()} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[3rem]">
                                <span className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold">Ampliar</span>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold rounded-full flex items-center justify-center p-8 text-center pointer-events-none">
                                <span className="text-primary font-serif italic text-lg leading-tight">Vagas Limitadas</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Gallery Section */}
                    {galleryImages.length > 0 && (
                        <div className="border-t border-primary/10 pt-16">
                            <h3 className="font-serif text-3xl text-primary mb-8">Galeria do Curso</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {galleryImages.map((img, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative"
                                        onClick={() => openLightbox(idx + 1)} // +1 because index 0 is cover
                                    >
                                        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {/* Simple Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft size={32} className="rotate-180" /> {/* Mimic Close/Back */}
                    </button>
                    <div className="max-w-5xl max-h-screen">
                        <img src={allImages[lightboxIndex]} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                    </div>
                </div>
            )}
        </div>
    );
}
