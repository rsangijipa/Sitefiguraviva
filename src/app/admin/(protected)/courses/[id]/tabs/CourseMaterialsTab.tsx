"use client";

import { useState, useEffect } from 'react';
import { adminCourseService } from '@/services/adminCourseService';
import { FileText, Link as LinkIcon, Download, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import ImageUpload from '@/components/admin/ImageUpload'; // Using for file upload? No, likely just URL for now or need a FileUpload component.
// Assuming we input URLs only for now as requested in previous conversations ("links, PDFs").

export default function CourseMaterialsTab({ courseId }: { courseId: string }) {
    const { addToast } = useToast();
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Material State
    const [newMaterial, setNewMaterial] = useState({ title: '', url: '', type: 'pdf', visibility: 'enrolled', tags: '', moduleId: '' });
    const [modules, setModules] = useState<any[]>([]);

    useEffect(() => {
        loadMaterials();
        loadModules();
    }, [courseId]);

    const loadModules = async () => {
        const mods = await adminCourseService.getModules(courseId);
        setModules(mods);
    };

    const loadMaterials = async () => {
        setLoading(true);
        try {
            const data = await adminCourseService.getMaterials(courseId);
            const sorted = data.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            setMaterials(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newMaterial.title || !newMaterial.url) {
            addToast("Preencha título e URL", 'error');
            return;
        }
        try {
            await adminCourseService.addMaterial(courseId, newMaterial);
            addToast("Material adicionado", 'success');
            setNewMaterial({ title: '', url: '', type: 'pdf', visibility: 'enrolled', tags: '', moduleId: '' });
            setIsCreating(false);
            loadMaterials();
        } catch (e) {
            addToast("Erro ao criar", 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir material?")) return;
        try {
            await adminCourseService.deleteMaterial(courseId, id);
            addToast("Material removido", 'success');
            loadMaterials();
        } catch (e) {
            addToast("Erro ao remover", 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-stone-400">Carregando materiais...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-stone-700">Materiais Complementares</h3>
                <Button size="sm" onClick={() => setIsCreating(!isCreating)} leftIcon={isCreating ? undefined : <Plus size={16} />}>
                    {isCreating ? 'Cancelar' : 'Adicionar Material'}
                </Button>
            </div>

            {isCreating && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 animate-in slide-in-from-top-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-stone-500 uppercase">Título</label>
                            <input
                                value={newMaterial.title}
                                onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                className="w-full p-2 rounded border-stone-200"
                                placeholder="Ex: E-book do Módulo 1"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase">Tipo</label>
                            <select
                                value={newMaterial.type}
                                onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                className="w-full p-2 rounded border-stone-200"
                            >
                                <option value="pdf">PDF</option>
                                <option value="link">Link Externo</option>
                                <option value="archive">Arquivo (Zip)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase">Visibilidade</label>
                            <select
                                value={newMaterial.visibility}
                                onChange={e => setNewMaterial({ ...newMaterial, visibility: e.target.value })}
                                className="w-full p-2 rounded border-stone-200"
                            >
                                <option value="enrolled">Alunos (Matriculados)</option>
                                <option value="after_completion">Após Conclusão</option>
                                <option value="team_only">Equipe (Team Role)</option>
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs font-bold text-stone-500 uppercase">Vincular a Módulo (Opcional)</label>
                            <select
                                value={newMaterial.moduleId}
                                onChange={e => setNewMaterial({ ...newMaterial, moduleId: e.target.value })}
                                className="w-full p-2 rounded border-stone-200"
                            >
                                <option value="">Geral (Todo o Curso)</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-stone-500 uppercase">URL do Arquivo</label>
                        <input
                            value={newMaterial.url}
                            onChange={e => setNewMaterial({ ...newMaterial, url: e.target.value })}
                            className="w-full p-2 rounded border-stone-200 font-mono text-xs"
                            placeholder="https://..."
                        />
                        <p className="text-[10px] text-stone-400 mt-1">Cole o link direto do Firebase Storage ou Google Drive.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleCreate}>Salvar Material</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
                {materials.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                {item.type === 'link' ? <LinkIcon size={20} /> : <FileText size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-700 text-sm">{item.title}</h4>
                                <a href={item.url} target="_blank" className="text-xs text-stone-400 hover:text-primary truncate max-w-[200px] block font-mono">
                                    {item.url}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end gap-1">
                                <button
                                    onClick={() => {
                                        const states = ['enrolled', 'after_completion', 'team_only'];
                                        const next = states[(states.indexOf(item.visibility || 'enrolled') + 1) % states.length];
                                        // Optimistic
                                        setMaterials(materials.map(m => m.id === item.id ? { ...m, visibility: next } : m));
                                        adminCourseService.updateMaterial(courseId, item.id, { visibility: next });
                                    }}
                                    className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border cursor-pointer hover:bg-white transition-all",
                                        item.visibility === 'team_only' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                            item.visibility === 'after_completion' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                "bg-green-50 text-green-600 border-green-100"
                                    )}
                                >
                                    {item.visibility === 'team_only' ? 'Equipe' : item.visibility === 'after_completion' ? 'Pós-Curso' : 'Alunos'}
                                </button>
                                {item.moduleId && (
                                    <span className="text-[10px] text-stone-400 border border-stone-100 px-1 rounded truncate max-w-[100px]">
                                        {modules.find(m => m.id === item.moduleId)?.title || 'Módulo'}
                                    </span>
                                )}
                                <span className="text-xs text-stone-300 font-mono bg-stone-100 px-2 py-1 rounded">{item.type}</span>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {materials.length === 0 && !isCreating && (
                    <div className="text-center py-12 text-stone-400">
                        Nenhum material cadastrado.
                    </div>
                )}
            </div>
        </div>
    );
}
