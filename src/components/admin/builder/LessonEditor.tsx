"use client";

import { useEffect, useState } from 'react';
import { Lesson, Block, BlockType } from '@/types/lms';
import { Loader2, Plus, Save, GripVertical, Trash2, Video, FileText, Link as LinkIcon, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { updateLessonBlocksAction } from '@/app/actions/lms';

// Simple ID gen if uuid missing
const genId = () => Math.random().toString(36).substring(2, 9);

// --- EDITORS ---

const TextEditor = ({ content, onChange }: { content: string, onChange: (val: string) => void }) => {
    return (
        <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 min-h-[150px] border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
            placeholder="Escreva seu conteúdo em Markdown..."
        />
    );
};

const VideoEditor = ({ url, videoId, onChange }: { url?: string, videoId?: string, onChange: (updates: { url?: string, videoId?: string }) => void }) => {
    return (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-stone-600 font-bold text-sm">
                <Video size={16} />
                Video (YouTube)
            </div>
            <input
                type="text"
                value={videoId || url || ''}
                onChange={(e) => onChange({ videoId: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded text-sm"
                placeholder="YouTube Video ID (ex: dQw4w9WgXcQ)"
            />
            <p className="text-xs text-stone-400">Cole o ID do vídeo do YouTube.</p>
        </div>
    );
};

// --- RENDERER / WRAPPER ---

const BlockItem = ({
    block,
    index,
    total,
    onUpdate,
    onDelete,
    onMove
}: {
    block: Block,
    index: number,
    total: number,
    onUpdate: (id: string, content: any) => void,
    onDelete: (id: string) => void,
    onMove: (index: number, direction: 'up' | 'down') => void
}) => {
    return (
        <div className="group relative pl-8 transition-all duration-200">
            {/* Controls */}
            <div className="absolute left-0 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-stone-100 rounded text-stone-300 hover:text-primary disabled:opacity-0"
                >
                    <ChevronUp size={16} />
                </button>
                <div className="p-1 text-stone-300 cursor-grab active:cursor-grabbing"><GripVertical size={16} /></div>
                <button
                    onClick={() => onMove(index, 'down')}
                    disabled={index === total - 1}
                    className="p-1 hover:bg-stone-100 rounded text-stone-300 hover:text-primary disabled:opacity-0"
                >
                    <ChevronDown size={16} />
                </button>
            </div>

            {/* Content Area */}
            <div className="relative">
                {block.type === 'text' && (
                    <TextEditor
                        content={block.content.text || ''}
                        onChange={(text) => onUpdate(block.id, { text })}
                    />
                )}

                {block.type === 'video' && (
                    <VideoEditor
                        url={block.content.url}
                        videoId={block.content.videoId}
                        onChange={(updates) => onUpdate(block.id, updates)}
                    />
                )}

                {/* Generic / Other types */}
                {!['text', 'video'].includes(block.type) && (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-stone-500">
                        Bloco {block.type} (Editor não implementado)
                    </div>
                )}

                {/* Block Actions */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded border border-stone-200 shadow-sm p-1">
                    <button
                        onClick={() => onDelete(block.id)}
                        className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-stone-400 transition-colors"
                        title="Remover bloco"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface LessonEditorProps {
    moduleId: string;
    lessonId: string;
    initialData?: Lesson;
}

export function LessonEditor({ moduleId, lessonId, initialData }: LessonEditorProps) {
    const [lesson, setLesson] = useState<Lesson | null>(initialData || null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Mock fetch for prototype
    useEffect(() => {
        // simulation
        if (!initialData) {
            setIsLoading(true);
            // Reset state when lessonId changes
            setBlocks([]);

            setTimeout(() => {
                setLesson({
                    id: lessonId,
                    moduleId,
                    courseId: 'demo',
                    title: 'Aula Carregada ' + lessonId.substring(0, 4),
                    order: 1,
                    isPublished: false,
                    duration: 10
                });
                // In real app, fetch blocks here or pass them in
                setBlocks([
                    { id: 'b1', type: 'text', order: 1, isPublished: true, content: { text: "# Bem vindo\nEsta é a introdução da aula." } },
                ]);
                setIsLoading(false);
            }, 300);
        }
    }, [lessonId, moduleId, initialData]);

    const handleAddBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: genId(),
            type,
            order: blocks.length + 1,
            isPublished: true,
            content: { text: '' } // default
        };
        setBlocks([...blocks, newBlock]);
    };

    const handleUpdateBlock = (id: string, contentUpdates: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...contentUpdates } } : b));
    };

    const handleDeleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newBlocks.length) {
            [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
            // Reassign orders
            const ordered = newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
            setBlocks(ordered);
        }
    };


    // ...

    const handleSave = async () => {
        if (!lesson) return;
        setIsSaving(true);

        // Use real action for persistence
        // Passing 'demo' as courseId for MVP if context missing, but ideally passed as prop.
        const targetCourseId = lesson.courseId || moduleId.split('_')[0] || 'demo';

        const result = await updateLessonBlocksAction(targetCourseId, moduleId, lessonId, blocks);

        setIsSaving(false);
        if (result.success) {
            alert('Aula salva com sucesso!');
        } else {
            alert('Erro ao salvar: ' + (result.error || 'Erro desconhecido'));
        }
    };

    if (isLoading || !lesson) {
        return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-stone-300" /></div>;
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-stone-50/30">
            {/* Header */}
            <div className="bg-white border-b border-stone-100 p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-primary">{lesson.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                        <span className={cn("uppercase font-bold tracking-wider", lesson.isPublished ? "text-green-600" : "text-stone-400")}>
                            {lesson.isPublished ? "Publicado" : "Rascunho"}
                        </span>
                        <span>•</span>
                        <span>{blocks.length} blocos</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">Preview</Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        rightIcon={<Save size={16} />}
                    >
                        Salvar
                    </Button>
                </div>
            </div>

            {/* Blocks Area */}
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">

                {blocks.map((block, index) => (
                    <BlockItem
                        key={block.id}
                        block={block}
                        index={index}
                        total={blocks.length}
                        onUpdate={handleUpdateBlock}
                        onDelete={handleDeleteBlock}
                        onMove={handleMoveBlock}
                    />
                ))}

                {/* Add Block Placeholder */}
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-stone-400 bg-white/50 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                    <span className="font-bold text-sm">Adicionar Bloco de Conteúdo</span>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleAddBlock('text')}
                            className="flex flex-col items-center gap-2 p-4 bg-white border border-stone-100 rounded-xl shadow-sm hover:border-primary hover:text-primary transition-all w-24"
                        >
                            <FileText size={20} />
                            <span className="text-[10px] font-bold uppercase">Texto</span>
                        </button>
                        <button
                            onClick={() => handleAddBlock('video')}
                            className="flex flex-col items-center gap-2 p-4 bg-white border border-stone-100 rounded-xl shadow-sm hover:border-primary hover:text-primary transition-all w-24"
                        >
                            <Video size={20} />
                            <span className="text-[10px] font-bold uppercase">Vídeo</span>
                        </button>
                        {/* Other types disabled for Sprint 1 MVP */}
                    </div>
                </div>

            </div>
        </div>
    );
}
