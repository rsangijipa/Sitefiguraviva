'use client';

import { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { updateLessonProgress } from '@/actions/progress';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
    videoId: string;
    courseId: string;
    moduleId: string; // Added for PRG-02
    lessonId: string;
    initialCompleted?: boolean;
}

export function VideoPlayer({ videoId, courseId, moduleId, lessonId, initialCompleted = false }: VideoPlayerProps) {
    const [isCompleted, setIsCompleted] = useState(initialCompleted);
    const [loading, setLoading] = useState(false);
    const playerRef = useRef<any>(null);

    const onEnd = async (event: YouTubeEvent) => {
        if (isCompleted) return;

        const player = event.target;
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();

        // VP-01: Anti-bypass Check using Video API
        // Must have watched at least 90% OR be within last 15s (for very short videos)
        const percentWatched = (currentTime / duration) * 100;

        if (percentWatched < 90 && (duration - currentTime) > 15) {
            console.warn(`[VideoPlayer] Attempted completion at ${percentWatched.toFixed(2)}%`);
            // Optional: User feedback "You must watch to the end"
            return;
        }

        setLoading(true);
        try {
            await updateLessonProgress(
                courseId,
                moduleId,
                lessonId,
                { status: 'completed', percent: 100 }
            );
            setIsCompleted(true);
        } catch (err) {
            console.error("Failed to mark progress", err);
        } finally {
            setLoading(false);
        }
    };

    const onStateChange = (event: YouTubeEvent) => {
        // 1 = Playing, 2 = Paused, 0 = Ended
        // We could track % here if needed
    };

    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-stone-100 aspect-video bg-black">
                <YouTube
                    videoId={videoId}
                    className="absolute inset-0 w-full h-full"
                    iframeClassName="w-full h-full"
                    onEnd={onEnd}
                    onStateChange={onStateChange}
                    onReady={(e) => { playerRef.current = e.target; }}
                    opts={{
                        playerVars: {
                            rel: 0,
                            modestbranding: 1,
                        }
                    }}
                />
            </div>

            {/* Feedback Bar */}
            <div className={cn(
                "flex items-center justify-between p-4 rounded-lg transition-colors",
                isCompleted ? "bg-green-50 border border-green-200" : "bg-stone-50 border border-stone-100"
            )}>
                <div className="flex items-center gap-3">
                    {loading ? (
                        <Loader2 className="animate-spin text-stone-400" size={24} />
                    ) : isCompleted ? (
                        <CheckCircle className="text-green-500" size={24} />
                    ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-stone-300" />
                    )}

                    <div>
                        <p className={cn("font-bold text-sm", isCompleted ? "text-green-800" : "text-stone-600")}>
                            {isCompleted ? "Aula Concluída" : "Assista até o fim para concluir"}
                        </p>
                        {isCompleted && <p className="text-xs text-green-600">Progresso salvo automaticamente.</p>}
                    </div>
                </div>

                {!isCompleted && !loading && (
                    <p className="text-xs text-stone-400 italic">
                        O progresso será registrado ao final do vídeo.
                    </p>
                )}
            </div>
        </div>
    );
}
