
"use client";

import { useRouter } from 'next/navigation';
import { CoursePlayer } from './CoursePlayer';
import { Lesson, Module } from '@/types/lms';
import { useProgress } from '@/hooks/useProgress';

interface LessonPlayerWrapperProps {
    course: {
        id: string;
        title: string;
        backLink: string;
    };
    modules: Module[];
    activeLesson: Lesson;
    prevLessonId?: string;
    nextLessonId?: string;
}

export function LessonPlayerWrapper(props: LessonPlayerWrapperProps) {
    const router = useRouter();
    // We can use the hook here to expose "markComplete" logic if needed outside the video player
    // but CoursePlayer's CourseVideoWrapper already does it for the video.
    // For non-video lessons (text/pdf), we might need logic here.

    // For now, simple navigation handler
    const handleSelectLesson = (lessonId: string) => {
        router.push(`/portal/course/${props.course.id}/lesson/${lessonId}`);
    };

    const handleMarkComplete = async (lessonId: string) => {
        // In the future, call Server Action here to ensure "Enrollment Summary" is updated immediately
        // For P1.2, we rely on the internal useProgress hook (inside VideoPlayer) + UI optimistic update
        // We can just refresh the page or let the user navigate
        console.log("Marking complete:", lessonId);
        // Force refresh to update server-side progress bars if needed, or just let useProgress handle it
    };

    return (
        <CoursePlayer
            {...props}
            onSelectLesson={handleSelectLesson}
            onMarkComplete={handleMarkComplete}
        />
    );
}
