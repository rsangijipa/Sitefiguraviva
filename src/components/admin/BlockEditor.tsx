"use client";

import { useState, useEffect } from 'react';
import { Block, BlockType } from '@/types/lms';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // Or just simple up/down for now to avoid massive dep issues if dnd not installed.
// Let's stick to simple Up/Down buttons + "Add" menu to ensure stability first.
import { Plus, Trash2, ArrowUp, ArrowDown, Type, Video, Image as ImageIcon, FileText, Link as LinkIcon, Minus, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';

interface BlockEditorProps {
    initialBlocks: Block[];
    onSave: (blocks: Block[]) => void;
    isSaving?: boolean;
}

export default function BlockEditor({ initialBlocks, onSave, isSaving }: BlockEditorProps) {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks || []);
    const [lastSavedBlocks, setLastSavedBlocks] = useState<string>(JSON.stringify(initialBlocks));
    const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

    // Autosave Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentString = JSON.stringify(blocks);
            if (currentString !== lastSavedBlocks) {
                setSavingStatus('saving');
                onSave(blocks);
                setLastSavedBlocks(currentString);
                setSavingStatus('saved'); // Optimistic, ideally onSave returns promise
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [blocks, lastSavedBlocks, onSave]);

    // Update status if diff
    useEffect(() => {
        if (JSON.stringify(blocks) !== lastSavedBlocks) {
            setSavingStatus('unsaved');
        }
    }, [blocks, lastSavedBlocks]);

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            title: '',
            content: {},
            order: blocks.length,
            isPublished: true,
            createdAt: {} as any // Handled by server usually, but ok for optimistic
        };

        if (type === 'text') newBlock.content.text = '';
        if (type === 'video') newBlock.content.url = '';
        if (type === 'callout') newBlock.content.calloutType = 'info';

        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<Block>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const updateBlockContent = (id: string, contentUpdates: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...contentUpdates } } : b));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-32">
            <div className="space-y-4">
                {blocks.map((block, index) => (
                    <div key={block.id} className="group relative bg-white border border-stone-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        {/* Controls */}
                        <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded"><ArrowUp size={14} /></button>
                            <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded"><ArrowDown size={14} /></button>
                            <button onClick={() => deleteBlock(block.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                        </div>

                        {/* Block Label */}
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-300 select-none">
                            {block.type === 'text' && <Type size={14} />}
                            {block.type === 'video' && <Video size={14} />}
                            {block.type === 'image' && <ImageIcon size={14} />}
                            {block.type === 'file' && <FileText size={14} />}
                            {block.type === 'divider' && <Minus size={14} />}
                            {block.type} Block
                        </div>

                        {/* Editors */}

                        {/* TEXT BLOCK */}
                        {block.type === 'text' && (
                            <textarea
                                value={block.content.text || ''}
                                onChange={e => updateBlockContent(block.id, { text: e.target.value })}
                                rows={4}
                                className="w-full p-4 bg-stone-50 rounded-lg border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-stone-700 placeholder:text-stone-400"
                                placeholder="Escreva seu conteúdo aqui (suporta Markdown)..."
                            />
                        )}

                        {/* VIDEO BLOCK */}
                        {block.type === 'video' && (
                            <div className="space-y-4">
                                <input
                                    value={block.content.url || ''}
                                    onChange={e => updateBlockContent(block.id, { url: e.target.value })}
                                    className="w-full p-3 bg-stone-50 rounded-lg text-sm border-transparent focus:bg-white outline-none"
                                    placeholder="Cole a URL do vídeo do YouTube..."
                                />
                                {block.content.url && (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${block.content.url.split('v=')[1] || ''}`}
                                            className="w-full h-full pointer-events-none opacity-50"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-80">Preview</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* IMAGE BLOCK */}
                        {block.type === 'image' && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <ImageUpload
                                        defaultImage={block.content.url}
                                        onUpload={(url) => updateBlockContent(block.id, { url })}
                                        className="w-32 h-32"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <input
                                            value={block.title || ''}
                                            onChange={e => updateBlock(block.id, { title: e.target.value })}
                                            className="w-full p-2 bg-stone-50 rounded text-sm font-bold placeholder:font-normal"
                                            placeholder="Título da imagem (opcional)"
                                        />
                                        <input
                                            value={block.content.caption || ''}
                                            onChange={e => updateBlockContent(block.id, { caption: e.target.value })}
                                            className="w-full p-2 bg-stone-50 rounded text-sm italic"
                                            placeholder="Legenda (opcional)"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CALLOUT BLOCK */}
                        {block.type === 'callout' && (
                            <div className="flex gap-4">
                                <select
                                    value={block.content.calloutType || 'info'}
                                    onChange={e => updateBlockContent(block.id, { calloutType: e.target.value })}
                                    className="h-fit p-2 rounded bg-stone-50 text-xs font-bold uppercase text-stone-500"
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Aviso</option>
                                    <option value="success">Sucesso</option>
                                    <option value="tip">Dica</option>
                                </select>
                                <textarea
                                    value={block.content.text || ''}
                                    onChange={e => updateBlockContent(block.id, { text: e.target.value })}
                                    rows={2}
                                    className="flex-1 p-3 bg-stone-50 rounded-lg text-sm border-transparent focus:bg-white outline-none"
                                    placeholder="Texto do destaque..."
                                />
                            </div>
                        )}

                        {/* LINK API */}
                        {block.type === 'link' && (
                            <div className="space-y-4">
                                <input
                                    value={block.content.url || ''}
                                    onChange={e => updateBlockContent(block.id, { url: e.target.value })}
                                    className="w-full p-3 bg-stone-50 rounded-lg text-sm font-mono text-primary"
                                    placeholder="https://..."
                                />
                                <input
                                    value={block.title || ''}
                                    onChange={e => updateBlock(block.id, { title: e.target.value })}
                                    className="w-full p-3 bg-stone-50 rounded-lg text-sm font-bold"
                                    placeholder="Texto do Link"
                                />
                            </div>
                        )}
                        {/* FILE/PDF */}
                        {block.type === 'file' || block.type === 'pdf' ? (
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <div className="p-4 bg-red-50 text-red-500 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            value={block.content.url || ''}
                                            onChange={e => updateBlockContent(block.id, { url: e.target.value })}
                                            className="w-full p-2 bg-stone-50 rounded text-xs font-mono"
                                            placeholder="URL do arquivo (PDF)"
                                        />
                                        <input
                                            value={block.title || ''}
                                            onChange={e => updateBlock(block.id, { title: e.target.value })}
                                            className="w-full p-2 bg-stone-50 rounded text-sm font-bold"
                                            placeholder="Nome do Arquivo"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-stone-400">Nota: Para upload de arquivos, use o gerenciador de materiais ou cole o link direto aqui por enquanto.</p>
                            </div>
                        ) : null}

                    </div>
                ))}
            </div>

            {/* Empty State */}
            {blocks.length === 0 && (
                <div className="text-center py-20 text-stone-300 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-100">
                    <p>Aula vazia. Adicione blocos abaixo.</p>
                </div>
            )}

            {/* Add Menu */}
            <div className="flex flex-wrap gap-2 justify-center p-4 bg-white rounded-2xl border border-stone-100 shadow-xl sticky bottom-8">
                <Button size="sm" variant="ghost" onClick={() => addBlock('text')} leftIcon={<Type size={14} />}>Texto</Button>
                <Button size="sm" variant="ghost" onClick={() => addBlock('video')} leftIcon={<Video size={14} />}>Vídeo</Button>
                <Button size="sm" variant="ghost" onClick={() => addBlock('image')} leftIcon={<ImageIcon size={14} />}>Imagem</Button>
                <Button size="sm" variant="ghost" onClick={() => addBlock('file')} leftIcon={<FileText size={14} />}>Arquivo</Button>
                <Button size="sm" variant="ghost" onClick={() => addBlock('link')} leftIcon={<LinkIcon size={14} />}>Link</Button>
                <Button size="sm" variant="ghost" onClick={() => addBlock('callout')} leftIcon={<AlertCircle size={14} />}>Destaque</Button>
                <div className="w-px h-8 bg-stone-200 mx-2" />
                <Button size="sm" variant="ghost" onClick={() => addBlock('callout')} leftIcon={<AlertCircle size={14} />}>Destaque</Button>
                <div className="w-px h-8 bg-stone-200 mx-2" />
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-stone-400 uppercase">
                        {savingStatus === 'saving' && 'Salvando...'}
                        {savingStatus === 'unsaved' && 'Não salvo'}
                        {savingStatus === 'saved' && 'Salvo'}
                    </span>
                    <Button onClick={() => onSave(blocks)} isLoading={isSaving || savingStatus === 'saving'} className="px-8 shadow-lg shadow-primary/20">
                        {savingStatus === 'saved' ? 'Salvo' : 'Salvar'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
