import { Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
    url: string;
    poster?: string;
    autoPlay?: boolean;
}

export const VideoPlayer = ({ url, poster, autoPlay = false }: VideoPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(autoPlay);

    const isDirectFile = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');

    // Simple helper to determine embed URL for common providers if not direct file
    // Note: In a real app, use a library like react-player or robust regex
    const getEmbedUrl = (inputUrl: string) => {
        if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) {
            const videoId = inputUrl.split('v=')[1]?.split('&')[0] || inputUrl.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}`;
        }
        if (inputUrl.includes('vimeo.com')) {
            const videoId = inputUrl.split('/').pop();
            return `https://player.vimeo.com/video/${videoId}?autoplay=${isPlaying ? 1 : 0}`;
        }
        return inputUrl;
    };

    if (!url) {
        return (
            <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center text-white/20">
                <Play size={48} />
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
            {isDirectFile ? (
                <video
                    src={url}
                    poster={poster}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay={autoPlay}
                    playsInline
                />
            ) : (
                <iframe
                    src={getEmbedUrl(url)}
                    title="Video Player"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            )}
        </div>
    );
};
