"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Lesson, Module } from "@/types/lms";
import { markLessonCompleted } from "@/app/actions/progress";

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
  assessment?: any;
  submission?: any;
}

import { useState, useEffect } from "react";
const CoursePlayer = dynamic(() =>
  import("./CoursePlayer").then((module) => module.CoursePlayer),
);
const AssessmentPlayer = dynamic(() =>
  import("../assessment/AssessmentPlayer").then(
    (module) => module.AssessmentPlayer,
  ),
);
import { analyticsService } from "@/services/analyticsService";
import { useAuth } from "@/context/AuthContext";

const AUTO_ADVANCE_KEY = "fv:lesson-auto-advance";

export function LessonPlayerWrapper(props: LessonPlayerWrapperProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Per-viewer convenience only; storage can be unavailable (private mode).
  useEffect(() => {
    try {
      setAutoAdvance(window.localStorage.getItem(AUTO_ADVANCE_KEY) === "1");
    } catch {
      /* keep default */
    }
  }, []);

  const changeAutoAdvance = (enabled: boolean) => {
    setAutoAdvance(enabled);
    try {
      window.localStorage.setItem(AUTO_ADVANCE_KEY, enabled ? "1" : "0");
    } catch {
      /* preference just won't persist */
    }
  };

  // Records the "continue where you left off" pointer. A failure here does
  // not affect the lesson itself, so it is logged instead of shown.
  useEffect(() => {
    if (user?.uid && props.course.id && props.activeLesson.id) {
      void analyticsService
        .trackLessonStart(user.uid, props.course.id, props.activeLesson.id)
        .catch((error) =>
          console.warn("Failed to record lesson access", error),
        );
    }
  }, [user?.uid, props.course.id, props.activeLesson.id]);

  const handleSelectLesson = (lessonId: string) => {
    router.push(`/portal/course/${props.course.id}/lesson/${lessonId}`);
  };

  const handleMarkComplete = async (lessonId: string, moduleId?: string) => {
    try {
      const result = await markLessonCompleted(
        props.course.id,
        moduleId ||
          props.activeLesson.moduleId ||
          props.modules.find((item) =>
            item.lessons.some((lesson) => lesson.id === lessonId),
          )?.id,
        lessonId,
      );
      if (!result.success) throw new Error(result.error);
      setProgressError(null);
      router.refresh();
    } catch (error) {
      setProgressError("Não foi possível salvar a conclusão. Tente novamente.");
      console.error("Failed to mark lesson complete", error);
      return;
    }

    // Telemetry runs after the completion is stored and never reports its
    // own failure as a failed completion.
    if (user?.uid) {
      void analyticsService
        .trackLessonCompletion(user.uid, props.course.id, lessonId)
        .catch((error) =>
          console.warn("Failed to track lesson completion", error),
        );
    }
  };

  const handleVideoCompleted = () => {
    // Refresh data implicitly happens via server action revalidation in VideoPlayer
    // but here we handle navigation
    if (autoAdvance && props.nextLessonId) {
      setTimeout(() => {
        router.push(
          `/portal/course/${props.course.id}/lesson/${props.nextLessonId}`,
        );
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      {progressError && (
        <p role="alert" className="text-sm text-red-700">
          {progressError}
        </p>
      )}
      {props.activeLesson.type === "quiz" && props.assessment ? (
        <AssessmentPlayer
          assessment={props.assessment}
          existingSubmission={props.submission}
          onExit={() => router.push(props.course.backLink)}
        />
      ) : (
        <CoursePlayer
          {...props}
          onSelectLesson={handleSelectLesson}
          onMarkComplete={handleMarkComplete}
          // Pass new props
          initialMaxWatchedSecond={props.activeLesson.maxWatchedSecond}
          onVideoCompleted={handleVideoCompleted}
        />
      )}

      {/* Auto-Advance Toggle */}
      {props.nextLessonId && (
        <div className="flex items-center justify-end gap-2 px-2">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => changeAutoAdvance(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
            <span className="text-sm font-medium text-stone-600 group-hover:text-stone-800 transition-colors">
              Ir para a próxima aula ao terminar o vídeo
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
