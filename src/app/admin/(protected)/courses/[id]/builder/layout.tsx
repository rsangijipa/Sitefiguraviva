"use client";

import { useCourses } from '@/hooks/useContent';
import { notFound, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const courseId = params.id as string;
    const { data: courses, isLoading } = useCourses();

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary/30" />
            </div>
        );
    }

    const course = courses?.find(c => c.id === courseId);

    if (!course) {
        // Handle not found
        // return notFound(); // This might trigger Next.js error page, maybe better to show UI
        return <div className="p-8 text-center text-stone-400">Curso não encontrado</div>
    }

    return (
        <div className="h-[calc(100vh-6rem)] bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {children}
        </div>
    );
}
