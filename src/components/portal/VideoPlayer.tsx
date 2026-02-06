import { Play, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeEvent } from 'react-youtube';

interface VideoPlayerProps {
    url: string;
    poster?: string;
    autoPlay?: boolean;
    initialTime?: number;
    onTimeUpdate?: (currentTime: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
}

export const VideoPlayer = ({
    url,
    poster,
    autoPlay = false,
    initialTime = 0,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded
}: VideoPlayerProps) => {
    const [loading, setLoading] = useState(true);
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Extract Video ID
    const getYouTubeId = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        }
        return null;
    };
    const videoId = getYouTubeId(url);

    // YouTube Events
    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        setLoading(false);
        if (initialTime > 0) {
            event.target.seekTo(initialTime);
        }
    };

    const onStateChange = (event: YouTubeEvent) => {
        // 1 = Playing, 2 = Paused, 0 = Ended
        if (event.data === 1) {
            // Start polling for time
            startPolling();
            if (onPlay) onPlay();
        } else {
            stopPolling();
            if (event.data === 2 && onPause) onPause();
            if (event.data === 0 && onEnded) onEnded();
        }
    };

    // Polling for Time Update (YouTube API doesn't have onTimeUpdate event)
    const startPolling = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (playerRef.current && onTimeUpdate) {
                const time = playerRef.current.getCurrentTime();
                onTimeUpdate(time);
            }
        }, 1000);
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Cleanup
    useEffect(() => {
        return () => stopPolling();
    }, []);

    // Fallback for native files (legacy)
    const isDirectFile = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');

    if (!url) {
        return (
            <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center text-white/20">
                <Play size={48} />
            </div>
        );
    }

    if (isDirectFile) {
        return (
            <video
                src={url}
                poster={poster}
                className="w-full aspect-video rounded-xl bg-black object-contain"
                controls
                autoPlay={autoPlay}
                playsInline
                onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
                onPause={onPause}
                onEnded={onEnded}
            />
        );
    }

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center text-white">
                URL de vídeo inválida ou não suportada.
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 text-white/50">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            )}
            <YouTube
                videoId={videoId}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                onReady={onReady}
                onStateChange={onStateChange}
                opts={{
                    playerVars: {
                        autoplay: autoPlay ? 1 : 0,
                        controls: 1,
                        rel: 0,
                        modestbranding: 1
                    }
                }}
            />
        </div>
    );
};
