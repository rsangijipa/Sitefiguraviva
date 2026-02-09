"use client";

import { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { updateLessonProgress } from "@/app/actions/progress";
import { trackEvent } from "@/actions/analytics";
import {
  CheckCircle,
  Loader2,
  Play,
  RotateCcw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  initialCompleted?: boolean;
  initialMaxWatchedSecond?: number;
  onCompleted?: () => void;
}

export function VideoPlayer({
  videoId,
  courseId,
  moduleId,
  lessonId,
  initialCompleted = false,
  initialMaxWatchedSecond = 0,
  onCompleted,
}: VideoPlayerProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [maxWatched, setMaxWatched] = useState(
    Math.max(initialMaxWatchedSecond, 0),
  );
  const [resumeSeconds, setResumeSeconds] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const playerRef = useRef<any>(null);
  const lastPushedTime = useRef<number>(0);
  const lastUpdateTs = useRef<number>(Date.now());
  const hasResumed = useRef(false);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
  ) => {
    setNotification({ message, type });
  };

  // Initial Resume Logic
  // If we have a significant progress (> 5s) and not completed, prompt or auto-seek?
  // Requirement says "Resume from mm:ss" UI. Let's do auto-seek with toast notification for now for better UX, or just track it.
  // Actually user requirement: "Exibir UI: 'Retomando de mm:ss' com opção 'começar do zero'."
  // So we should NOT auto-play/seek immediately, but maybe set startSeconds?
  // YouTube embeds are tricky with "starting from".
  // Let's settle on: Auto-seek to position if > 0.

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    if (initialMaxWatchedSecond > 5 && !initialCompleted) {
      setResumeSeconds(initialMaxWatchedSecond);
      // We don't auto-seek immediately to let user decide,
      // OR we auto-seek and show "Start Over" button.
      // Given the requirement "UI: Retomando...", let's simply seek and pause, or let user click play.
      event.target.seekTo(initialMaxWatchedSecond, true);
      // showToast(`Retomando de ${formatTime(initialMaxWatchedSecond)}`, 'info');
      hasResumed.current = true;
    }
  };

  const handleStartOver = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      showToast("Iniciando do zero", "success");
    }
  };

  const onEnd = async (event: YouTubeEvent) => {
    if (isCompleted) return;
    await markAsCompleted();
  };

  const markAsCompleted = async () => {
    if (isCompleted || loading) return;

    setLoading(true);
    try {
      await updateLessonProgress(courseId, moduleId, lessonId, {
        status: "completed",
        percent: 100,
        maxWatchedSecond: playerRef.current?.getDuration() || 0,
      });
      setIsCompleted(true);
      showToast("Aula concluída!", "success");
      trackEvent("video_complete", lessonId, { courseId, moduleId });
      if (onCompleted) onCompleted();
    } catch (err) {
      console.error("Failed to mark progress", err);
      showToast("Erro ao salvar progresso.", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkAntiSkip = (currentTime: number) => {
    if (isCompleted) return; // No restrictions if already completed

    // Allow strictly forward seek up to maxWatched + 15s
    // We look at state `maxWatched`.
    const allowedHorizon = maxWatched + 15;

    // Tolerance of 2s for seeking precision
    if (currentTime > allowedHorizon + 2) {
      // USER TRIED TO SKIP
      if (playerRef.current) {
        playerRef.current.seekTo(maxWatched, true);
        showToast("Você não pode pular o vídeo ainda.", "warning");
      }
      return false;
    }
    return true;
  };

  const onStateChange = (event: YouTubeEvent) => {
    // 1 = Playing, 2 = Paused, 0 = Ended
    if (event.data === 1 || event.data === 2) {
      const currentTime = event.target.getCurrentTime();

      if (event.data === 1) {
        // Playing
        // Check anti-skip immediately on play (seek end)
        if (!checkAntiSkip(currentTime)) return;
        trackEvent("video_play", lessonId, { courseId, moduleId, currentTime });
      }

      if (event.data === 2) {
        // Paused
        pushProgress(currentTime);
      }
    }
  };

  const pushProgress = async (currentTime: number) => {
    if (!currentTime || currentTime < 0) return;

    // Update local maxWatched
    if (currentTime > maxWatched) {
      setMaxWatched(currentTime);
    }

    // Check for 90% completion
    const duration = playerRef.current?.getDuration();
    if (duration > 0 && !isCompleted) {
      const percent = (currentTime / duration) * 100;
      if (percent >= 90) {
        await markAsCompleted();
        return;
      }
    }

    // Debounce network calls
    const now = Date.now();
    if (now - lastUpdateTs.current < 5000) return; // 5s throttle

    // Only push if we have new maxWatched worth saving (or at least some progress)
    // For SSoT, we want to save maxWatchedSecond mostly.
    const effectiveMax = Math.max(maxWatched, currentTime);

    try {
      await updateLessonProgress(courseId, moduleId, lessonId, {
        status: "in_progress",
        maxWatchedSecond: Math.floor(effectiveMax),
        percent: duration ? Math.floor((effectiveMax / duration) * 100) : 0,
      });
      lastUpdateTs.current = now;
    } catch (e) {
      console.error("Failed to push metrics", e);
    }
  };

  // Polling for progress and anti-skip
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getPlayerState() === 1) {
        // Playing
        const currentTime = playerRef.current.getCurrentTime();

        // Continuous Anti-Skip check
        if (!checkAntiSkip(currentTime)) return;

        // Sync local maxWatched
        if (currentTime > maxWatched) {
          setMaxWatched(currentTime);
        }

        pushProgress(currentTime);
      }
    }, 1000); // Check every 1s

    return () => clearInterval(interval);
  }, [courseId, moduleId, lessonId, maxWatched, isCompleted]);

  function formatTime(seconds: number) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(14, 5);
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden shadow-lg border border-stone-100 aspect-video bg-black group">
        <YouTube
          videoId={videoId}
          className="absolute inset-0 w-full h-full"
          iframeClassName="w-full h-full"
          onEnd={onEnd}
          onStateChange={onStateChange}
          onReady={onReady}
          opts={{
            playerVars: {
              rel: 0,
              modestbranding: 1,
              controls: 1,
            },
          }}
        />

        {/* Resume Overlay / Hint */}
        {resumeSeconds && resumeSeconds > 0 && !isCompleted && (
          <div className="absolute top-4 left-4 z-20 animate-in fade-in slide-in-from-top-4 duration-700 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm flex items-center gap-3 shadow-xl pointer-events-auto">
              <span className="flex items-center gap-2">
                <RotateCcw size={14} className="text-primary" />
                Retomando de{" "}
                <span className="font-mono font-bold text-primary">
                  {formatTime(resumeSeconds)}
                </span>
              </span>
              <div className="w-px h-4 bg-white/20" />
              <button
                onClick={handleStartOver}
                className="hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider"
              >
                Reiniciar
              </button>
            </div>
          </div>
        )}

        {/* Local Notification Toast */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in zoom-in duration-300">
            <div
              className={cn(
                "px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2",
                notification.type === "error"
                  ? "bg-red-500 text-white"
                  : notification.type === "warning"
                    ? "bg-amber-500 text-white"
                    : notification.type === "success"
                      ? "bg-green-500 text-white"
                      : "bg-stone-800 text-white",
              )}
            >
              {notification.type === "error" && <AlertTriangle size={16} />}
              {notification.type === "warning" && <AlertTriangle size={16} />}
              {notification.type === "success" && <CheckCircle size={16} />}
              {notification.message}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Bar */}
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-lg transition-colors border",
          isCompleted
            ? "bg-green-50 border-green-200"
            : "bg-white border-stone-200",
        )}
      >
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="animate-spin text-stone-400" size={24} />
          ) : isCompleted ? (
            <CheckCircle className="text-green-500" size={24} />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-stone-300 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-stone-300" />
            </div>
          )}

          <div>
            <p
              className={cn(
                "font-bold text-sm",
                isCompleted ? "text-green-800" : "text-stone-700",
              )}
            >
              {isCompleted ? "Aula Concluída" : "Progresso do Vídeo"}
            </p>
            {isCompleted ? (
              <p className="text-xs text-green-600">
                Progresso salvo automaticamente.
              </p>
            ) : (
              <p className="text-xs text-stone-500">
                {maxWatched > 0
                  ? `Assistido até ${formatTime(maxWatched)}`
                  : "Assista para contabilizar o progresso."}
              </p>
            )}
          </div>
        </div>

        {!isCompleted && !loading && maxWatched < 15 && (
          <p className="text-xs text-stone-400 italic hidden sm:block">
            O progresso é salvo periodicamente.
          </p>
        )}
      </div>
    </div>
  );
}
