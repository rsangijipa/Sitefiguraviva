"use client";

import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import Footer from './Footer';
import AlertBar from './AlertBar';
import HeroSection from './sections/HeroSection';
import CoursesSection from './sections/CoursesSection';
import BlogSection from './sections/BlogSection';
import FounderSection from './sections/FounderSection';
import ResourcesSection from './ResourcesSection';
import InstagramSection from './InstagramSection';
import FloatingControls from './ui/FloatingControls';
import GalleryModal from './GalleryModal';
import CalendarModal from './CalendarModal';
import PDFReader from './PDFReader';
import { useSearchParams, useRouter } from 'next/navigation';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import CourseModal from './CourseModal';
import BlogPostModal from './BlogPostModal';

interface HomeClientProps {
    courses: any[];
    blogPosts: any[];
    gallery: any[];
}

export default function HomeClient({ courses, blogPosts, gallery }: HomeClientProps) {
    const { alertMessage } = useApp();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Modal states derived from URL
    const modalType = searchParams.get('modal');
    const isCalendarOpen = modalType === 'calendar';
    const isReaderOpen = modalType === 'reader';
    const isGalleryOpen = modalType === 'gallery';

    // New Modal types for Course and Blog
    const isCourseOpen = modalType === 'course';
    const isBlogOpen = modalType === 'blog';

    // Item IDs
    const articleId = searchParams.get('articleId');
    const courseId = searchParams.get('courseId');
    const postId = searchParams.get('postId');

    // Resolve selections
    const selectedArticle = articleId ? blogPosts.find((p: any) => String(p.id) === String(articleId)) : null;
    const selectedCourse = courseId ? courses.find((c: any) => String(c.id) === String(courseId)) : null;
    const selectedPost = postId ? blogPosts.find((p: any) => String(p.id) === String(postId)) : null;

    const closeModals = () => {
        router.push('/', { scroll: false });
    };

    const openModal = (name: string) => {
        router.push(`/?modal=${name}`, { scroll: false });
    };

    const selectCourse = (course: any) => {
        router.push(`/?modal=course&courseId=${course.id}`, { scroll: false });
    };

    const selectPost = (post: any) => {
        if (post.type === 'library') {
            router.push(`/?modal=reader&articleId=${post.id}`, { scroll: false });
        } else {
            router.push(`/?modal=blog&postId=${post.id}`, { scroll: false });
        }
    };

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
                    onSelectCourse={selectCourse}
                />
                <BlogSection
                    blogPosts={blogPosts}
                    onSelectPost={selectPost}
                />

                {/* GALLERY TRIGGER SECTION */}
                <section className="py-20 relative overflow-hidden bg-stone-100 border-t border-stone-200">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/assets/fundo-galeria.png"
                            alt="Galeria de fundo"
                            fill
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
            <FloatingControls />

            {/* MODALS */}
            <CourseModal
                isOpen={isCourseOpen}
                onClose={closeModals}
                course={selectedCourse}
            />

            <BlogPostModal
                isOpen={isBlogOpen}
                onClose={closeModals}
                post={selectedPost}
            />

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
