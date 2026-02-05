"use client";

import { useState } from 'react';
import { adminCourseService } from '@/services/adminCourseService';
import { CourseDoc } from '@/types/lms';
import { Save, Trash2, Shield, Award, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CourseSettingsTab({ course }: { course: CourseDoc }) {
    const { addToast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Local State
    const [isPublished, setIsPublished] = useState(course.isPublished);
    const [communityEnabled, setCommunityEnabled] = useState(course.communityEnabled !== false); // Default true
    const [certEnabled, setCertEnabled] = useState(course.certificateRules?.enabled || false);
    const [minProgress, setMinProgress] = useState(course.certificateRules?.minProgressPercent || 100);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await adminCourseService.updateCourse(course.id, {
                isPublished,
                communityEnabled,
                certificateRules: {
                    enabled: certEnabled,
                    minProgressPercent: minProgress
                }
            });
            addToast("Configurações salvas", 'success');
            router.refresh();
        } catch (error) {
            addToast("Erro ao salvar", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        const confirm1 = confirm("Tem certeza que deseja EXCLUIR este curso permanentemente?");
        if (!confirm1) return;

        const confirm2 = prompt("Para confirmar, digite o nome do curso exatamente como está:");
        if (confirm2 !== course.title) {
            addToast("O nome digitado não coincide.", 'error');
            return;
        }

        try {
            setIsLoading(true);
            await adminCourseService.deleteCourse(course.id);
            addToast("Curso excluído com sucesso", 'success');
            router.push('/admin/courses');
        } catch (error) {
            addToast("Erro ao excluir", 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-3xl pb-20">

            {/* Visibility Card */}
            <section className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-stone-50 rounded-lg text-stone-400">
                        <Shield size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-stone-800 text-lg mb-1">Visibilidade e Acesso</h3>
                        <p className="text-sm text-stone-500 mb-6">Controle quem pode ver e acessar este curso.</p>

                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-100">
                            <div>
                                <p className="font-bold text-stone-700">Publicar Curso</p>
                                <p className="text-xs text-stone-400">Torna o curso visível para alunos matriculados.</p>
                            </div>
                            <button
                                onClick={() => setIsPublished(!isPublished)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    isPublished ? "bg-green-500" : "bg-stone-200"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                                    isPublished ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Card */}
            <section className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-stone-50 rounded-lg text-stone-400">
                        <Award size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-stone-800 text-lg mb-1">Funcionalidades</h3>
                        <p className="text-sm text-stone-500 mb-6">Ative ou desative recursos específicos para este curso.</p>

                        <div className="space-y-4">
                            {/* Community Toggle */}
                            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-100">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={18} className="text-stone-400" />
                                    <div>
                                        <p className="font-bold text-stone-700">Comunidade</p>
                                        <p className="text-xs text-stone-400">Habilita a aba de discussões.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setCommunityEnabled(!communityEnabled)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative",
                                        communityEnabled ? "bg-primary" : "bg-stone-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                                        communityEnabled ? "right-1" : "left-1"
                                    )} />
                                </button>
                            </div>

                            {/* Certificate Toggle */}
                            <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Award size={18} className="text-stone-400" />
                                        <div>
                                            <p className="font-bold text-stone-700">Certificados</p>
                                            <p className="text-xs text-stone-400">Emissão automática.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setCertEnabled(!certEnabled)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            certEnabled ? "bg-primary" : "bg-stone-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                                            certEnabled ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>

                                {certEnabled && (
                                    <div className="pl-8 animate-in fade-in slide-in-from-top-1">
                                        <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Progresso Mínimo (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={minProgress}
                                            onChange={(e) => setMinProgress(Number(e.target.value))}
                                            className="w-24 p-2 rounded border border-stone-200 text-sm font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 opacity-80 hover:opacity-100 transition-opacity">
                <h3 className="font-bold text-red-800 mb-2">Zona de Perigo</h3>
                <p className="text-sm text-red-600/80 mb-6">Ações irreversíveis.</p>

                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 hover:border-red-300 bg-white"
                        onClick={handleDeleteCourse}
                        leftIcon={<Trash2 size={16} />}
                        isLoading={isLoading}
                    >
                        Excluir Curso
                    </Button>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
                <Button onClick={handleSave} isLoading={isLoading} size="lg" className="px-8" leftIcon={<Save size={18} />}>
                    Salvar Configurações
                </Button>
            </div>
        </div>
    );
}
