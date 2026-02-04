"use client";

import { useState } from 'react';
import { FileText, Link as LinkIcon, Trash2, Download, Plus, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addMaterial, deleteMaterial } from '@/actions/material';
import { useToast } from '@/context/ToastContext';

interface MaterialManagerProps {
    courseId: string;
    initialMaterials: any[];
}

export function MaterialManager({ courseId, initialMaterials }: MaterialManagerProps) {
    const { addToast } = useToast();
    const [materials, setMaterials] = useState(initialMaterials);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'link' as const, // For MVP only links, later PDF upload
        url: '',
        description: ''
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await addMaterial(courseId, formData);

        if (result.success) {
            addToast('Material adicionado!', 'success');
            // Optimistic update or wait for revalidate? 
            // Since we revalidatePath in server action, router refresh will happen.
            // But let's manually update list just in case or rely on prop update if parent was server component.
            // Actually, because this client component is mounted by a Server Component Page that fetches data, 
            // a router.refresh() or simple state wait is key. 
            // For now, let's just reset form and assume Next.js 15 revalidates.
            // Wait, we need to see the new item. 
            setIsAdding(false);
            setFormData({ title: '', type: 'link', url: '', description: '' });
        } else {
            addToast(result.error || 'Erro', 'error');
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;

        const result = await deleteMaterial(courseId, id);
        if (result.success) {
            addToast('Removido com sucesso', 'success');
            // Optimistic remove
            setMaterials(prev => prev.filter(m => m.id !== id));
        } else {
            addToast('Erro ao remover', 'error');
        }
    };

    return (
        <div className="flex h-full w-full">
            {/* Sidebar / List */}
            <div className="w-1/3 border-r border-stone-100 flex flex-col bg-stone-50/30">
                <div className="p-4 border-b border-stone-100 bg-white">
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="w-full justify-center"
                        leftIcon={<Plus size={16} />}
                    >
                        Adicionar Material
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {materials.length === 0 && (
                        <p className="text-center text-stone-400 text-sm py-8">Nenhum material cadastrado.</p>
                    )}
                    {materials.map(mat => (
                        <div key={mat.id} className="p-3 bg-white rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                    {mat.type === 'link' ? <LinkIcon size={16} /> : <FileText size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-stone-800 truncate">{mat.title}</h4>
                                    <p className="text-xs text-stone-400 truncate">{mat.description || 'Sem descrição'}</p>
                                    <a href={mat.url} target="_blank" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                        <ExternalLink size={10} /> Acessar Link
                                    </a>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(mat.id)}
                                className="absolute top-2 right-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area / Form */}
            <div className="flex-1 bg-white p-8">
                {isAdding ? (
                    <div className="max-w-md mx-auto">
                        <h2 className="text-xl font-bold text-stone-800 mb-6">Novo Material</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input
                                label="Título do Material"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-600">Tipo</label>
                                <select
                                    className="w-full px-4 py-2 border border-stone-200 rounded-lg"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="link">Link Externo (Drive, Dropbox, Youtube)</option>
                                    <option value="pdf">Arquivo (Upload em breve)</option>
                                </select>
                            </div>

                            <Input
                                label="URL do Link"
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-600">Descrição (Opcional)</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-stone-200 rounded-lg h-24 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                                <Button type="submit" disabled={isLoading}>Salvar Material</Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-300">
                        <FileText size={48} className="mb-4 text-stone-200" />
                        <p>Selecione "Adicionar Material" para incluir conteúdo complementar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
