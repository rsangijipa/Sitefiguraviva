"use client";

import { useCourses } from '@/hooks/useContent';
import { useParams, usePathname } from 'next/navigation';
import { Loader2, Layout, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CourseAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
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
        return <div className="p-8 text-center text-stone-400">Curso não encontrado</div>
    }

    const tabs = [
        { label: 'Construtor', href: `/admin/courses/${courseId}/builder`, icon: Layout },
        { label: 'Materiais', href: `/admin/courses/${courseId}/materials`, icon: FileText },
        // { label: 'Configurações', href: `/admin/courses/${courseId}/settings`, icon: Settings },
    ];

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">

            {/* Header / Tabs */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                        {course.image ? <img src={course.image} className="h-full w-full object-cover rounded-lg" /> : <Layout size={20} className="text-stone-400" />}
                    </div>
                    <div>
                        <h1 className="font-bold text-stone-800 text-sm md:text-base">{course.title}</h1>
                        <p className="text-xs text-stone-400">Gerenciamento do Curso</p>
                    </div>
                </div>

                <div className="flex bg-stone-100 p-1 rounded-lg">
                    {tabs.map(tab => {
                        const isActive = pathname.startsWith(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all",
                                    isActive ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                )}
                            >
                                <tab.icon size={14} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {children}
            </div>
        </div>
    );
}
