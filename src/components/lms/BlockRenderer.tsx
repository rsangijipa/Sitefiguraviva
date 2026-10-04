"use client";

import { Block } from '@/types/lms';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Video, FileText, AlertCircle, CheckCircle, Info, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { getClinicalTool } from '@/features/interactive-resources/clinicalToolsRegistry';

interface BlockRendererProps {
    block: Block;
    courseId?: string;
    moduleId?: string; // Added
    lessonId?: string;
    isLessonCompleted?: boolean;
}

export function BlockRenderer({ block, courseId, moduleId, lessonId, isLessonCompleted }: BlockRendererProps) {
    // Don't render unpublished blocks
    // Default: visible. Only hide if explicitly disabled.
    if (block.isPublished === false) return null;

    switch (block.type) {
        case 'text':
            return (
                <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-stone-600 prose-a:text-primary hover:prose-a:text-primary/80 transition-colors">
                    <ReactMarkdown>{block.content.text || ''}</ReactMarkdown>
                </div>
            );

        case 'video':
            // Smart Video Player
            const videoId = block.content.videoId || (block.content.url ? block.content.url.split('v=')[1] : null);
            if (!videoId && block.content.url) {
                return (
                    <div className="bg-stone-100 p-4 rounded text-center">Video URL not supported yet: {block.content.url}</div>
                )
            }
            if (!videoId) return null;

            if (courseId && moduleId && lessonId) {
                // Return tracked player
                return (
                    <VideoPlayer
                        videoId={videoId}
                        courseId={courseId}
                        moduleId={moduleId}
                        lessonId={lessonId}
                        initialCompleted={isLessonCompleted}
                    // initialCompleted could be passed if we had lesson status in BlockRenderer, but we might not.
                    // Ideally BlockRenderer should receive 'isCompleted' for the whole lesson? 
                    // No, video completion triggers lesson completion.
                    />
                );
            }

            // Fallback for when context is missing (admin preview?)
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

        case 'image':
            return (
                <div className="flex flex-col gap-2">
                    <div className="rounded-xl overflow-hidden border border-stone-100">
                        {block.content.url ? (
                            <img src={block.content.url} alt={block.title || 'Imagem da aula'} className="w-full h-auto" />
                        ) : (
                            <div className="bg-stone-100 h-64 flex items-center justify-center text-stone-400">
                                <ImageIcon size={32} />
                            </div>
                        )}
                    </div>
                    {block.content.caption && (
                        <p className="text-center text-xs text-stone-500 italic">{block.content.caption}</p>
                    )}
                </div>
            );

        case 'pdf':
        case 'file': // Legacy compat?
            return (
                <a href={block.content.url} target="_blank" rel="noopener noreferrer" className="block cursor-pointer group">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-stone-700 group-hover:text-primary transition-colors">{block.title || 'Arquivo PDF'}</h4>
                            <p className="text-xs text-stone-400">Clique para visualizar ou baixar</p>
                        </div>
                        <ExternalLink size={16} className="text-stone-300 group-hover:text-primary" />
                    </div>
                </a>
            );
        case 'link':
            return (
                <a href={block.content.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline font-medium">
                    <ExternalLink size={16} />
                    {block.title || block.content.url}
                </a>
            );

        case 'divider':
            return <hr className="border-t border-stone-100 my-8" />;

        case 'callout':
            const styles = {
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
                warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: AlertCircle },
                success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
                tip: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: CheckCircle },
            };
            const type = block.content.calloutType || 'info';
            const style = styles[type] || styles.info;
            const Icon = style.icon;

            return (
                <div className={cn("p-4 rounded-lg border flex gap-3", style.bg, style.border)}>
                    <Icon className={cn("shrink-0", style.text)} size={20} />
                    <div className={cn("text-sm", style.text)}>
                        <ReactMarkdown>{block.content.text || ''}</ReactMarkdown>
                    </div>
                </div>
            );

        case 'clinical_tool':
            const toolSlug = block.content.toolSlug || '';
            const tool = getClinicalTool(toolSlug);
            const toolName = block.content.toolTitle || tool?.name || block.title || 'Exercício Clínico Interativo';
            const toolDesc = tool?.description || 'Prática terapêutica interativa recomendada para esta aula.';
            const toolUrl = tool?.path || `/recursos/${toolSlug}`;

            return (
                <div className="rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-gold/10 via-white to-stone-50 p-6 shadow-sm my-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gold/20 text-gold flex items-center justify-center shrink-0">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gold/20 text-stone-800">
                                        Exercício Clínico
                                    </span>
                                    {tool?.estimatedMinutes && (
                                        <span className="text-[10px] text-stone-500 font-medium">
                                            ~{tool.estimatedMinutes} min
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-serif font-bold text-lg text-primary">
                                    {toolName}
                                </h3>
                                <p className="text-xs text-stone-600 mt-1 max-w-xl">
                                    {toolDesc}
                                </p>
                            </div>
                        </div>

                        <a
                            href={toolUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-paper hover:bg-gold hover:text-stone-900 transition-colors text-xs font-bold shadow-md shrink-0"
                        >
                            <span>Abrir Experimento</span>
                            <ExternalLink size={14} />
                        </a>
                    </div>

                    {block.content.instructions && (
                        <div className="mt-4 pt-4 border-t border-gold/20 text-xs text-stone-700 bg-white/70 rounded-xl p-3.5">
                            <span className="font-bold text-primary block mb-1 uppercase tracking-wider text-[10px]">
                                Orientações do Professor:
                            </span>
                            <ReactMarkdown>{block.content.instructions}</ReactMarkdown>
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
}


