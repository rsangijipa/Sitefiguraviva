"use client";

import { useApp } from '../context/AppContext';
import { useState, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AlertBar from '../components/AlertBar';
import HeroSection from '../components/sections/HeroSection';
import ClinicalSection from '../components/sections/ClinicalSection';
import CoursesSection from '../components/sections/CoursesSection';
import EventsSection from '../components/sections/EventsSection';
import BlogSection from '../components/sections/BlogSection';
import FounderSection from '../components/sections/FounderSection';
import LibrarySection from '../components/sections/LibrarySection';
import ResourcesSection from '../components/ResourcesSection';
import InstagramSection from '../components/InstagramSection';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollToTopButton from '../components/ScrollToTopButton';
import AmbientPlayer from '../components/AmbientPlayer';
import GalleryModal from '../components/GalleryModal';
import CalendarModal from '../components/CalendarModal';
import PDFReader from '../components/PDFReader';
import { useSearchParams, useRouter } from 'next/navigation';
import { Image as ImageIcon } from 'lucide-react';

function HomeContent() {
    const { courses, alertMessage, blogPosts, gallery, loading } = useApp();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Modal states derived from URL
    const isCalendarOpen = searchParams.get('modal') === 'calendar';
    const isReaderOpen = searchParams.get('modal') === 'reader';
    const isGalleryOpen = searchParams.get('modal') === 'gallery';
    const articleId = searchParams.get('articleId');
    const selectedArticle = articleId ? blogPosts.find((p: any) => String(p.id) === String(articleId)) : null;

    const closeModals = () => {
        router.push('/');
    };

    const openModal = (name: string) => {
        router.push(`/?modal=${name}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-primary/60 font-serif animate-pulse">Carregando o campo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-paper min-h-screen flex flex-col font-sans text-primary overflow-hidden">
            <AlertBar message={alertMessage} />
            <Navbar />

            <main>
                <HeroSection />
                <FounderSection />
                <ResourcesSection />
                <CoursesSection
                    courses={courses}
                    onOpenCalendar={() => openModal('calendar')}
                />
                <BlogSection
                    blogPosts={blogPosts}
                    onOpenReader={(post) => openModal(`reader&articleId=${post.id}`)}
                />

                {/* GALLERY TRIGGER SECTION */}
                <section className="py-20 relative overflow-hidden bg-stone-100 border-t border-stone-200">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/assets/fundo-galeria.png"
                            alt=""
                            className="w-full h-full object-cover blur-[8px] opacity-40 scale-105"
                        />
                        <div className="absolute inset-0 bg-stone-100/60 mix-blend-overlay" />
                    </div>

                    <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">Memória Viva</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight mb-8">Galeria <span className="italic text-gold font-light">Visual</span></h2>

                        <button
                            onClick={() => openModal('gallery')}
                            className="group bg-white border border-stone-200 px-8 py-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 inline-flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-primary group-hover:bg-gold group-hover:text-white transition-colors">
                                <ImageIcon size={32} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Abrir Galeria de Fotos</span>
                        </button>

                        <p className="mt-8 text-primary/40 text-sm max-w-lg mx-auto">
                            Explore os registros fotográficos de nossas vivências, formações e da natureza que compõe o instituto.
                        </p>
                    </div>
                </section>

                <InstagramSection />
            </main>

            <Footer />

            <WhatsAppButton />
            <ScrollToTopButton />
            <AmbientPlayer />

            <PDFReader
                isOpen={isReaderOpen}
                onClose={closeModals}
                article={selectedArticle}
            />
            <CalendarModal
                isOpen={isCalendarOpen}
                onClose={closeModals}
                courses={courses}
            />
            <GalleryModal
                isOpen={isGalleryOpen}
                onClose={closeModals}
                gallery={gallery}
            />
        </div>
    );
}

export default function PublicHome() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}
