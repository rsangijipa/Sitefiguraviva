"use client";

import { Block } from '@/types/lms';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Video, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface BlockRendererProps {
    block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
    if (!block.isPublished) return null;

    switch (block.type) {
        case 'text':
            return (
                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-stone-600 prose-a:text-primary hover:prose-a:text-primary/80 transition-colors">
                    <ReactMarkdown>{block.content.text || ''}</ReactMarkdown>
                </div>
            );

        case 'video':
            // Simple YouTube embed
            const videoId = block.content.videoId || (block.content.url ? block.content.url.split('v=')[1] : null);
            if (!videoId) return null;

            return (
                <div className="rounded-xl overflow-hidden shadow-lg border border-stone-100 aspect-video bg-black relative">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
            );

        case 'callout':
            const styles = {
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
                warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: AlertCircle },
                success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
            };
            const type = block.content.calloutType || 'info';
            const style = styles[type];
            const Icon = style.icon;

            return (
                <div className={cn("p-4 rounded-lg border flex gap-3", style.bg, style.border)}>
                    <Icon className={cn("shrink-0", style.text)} size={20} />
                    <div className={cn("text-sm", style.text)}>
                        <ReactMarkdown>{block.content.text || ''}</ReactMarkdown>
                    </div>
                </div>
            );

        default:
            return null;
    }
}
