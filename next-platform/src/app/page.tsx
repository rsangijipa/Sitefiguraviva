"use client";

import { useApp } from '../context/AppContext';
import AlertBar from '../components/AlertBar';
import HeroSection from '../components/sections/HeroSection';
import ClinicalSection from '../components/sections/ClinicalSection';
import CoursesSection from '../components/sections/CoursesSection';
import EventsSection from '../components/sections/EventsSection';
import BlogSection from '../components/sections/BlogSection';
import FounderSection from '../components/sections/FounderSection';
import LibrarySection from '../components/sections/LibrarySection';

export default function PublicHome() {
    const { courses, alertMessage, blogPosts, loading } = useApp();

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
            <HeroSection />
            <ClinicalSection />
            <FounderSection />
            <CoursesSection courses={courses} />
            <EventsSection />
            <LibrarySection />
            <BlogSection blogPosts={blogPosts} />
        </div>
    );
}
