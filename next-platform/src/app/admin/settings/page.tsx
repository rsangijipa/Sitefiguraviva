"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc, setDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { usePageContent, useTeamMembers } from '@/hooks/useContent';
import { useToast } from '@/context/ToastContext';
import { Save, Plus, Trash2, Edit2, Check, X, Upload, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { uploadFiles } from '@/services/uploadService';
// useApp removed

export default function AdminContentPage() {
    const { data: founderData, refetch: refetchFounder } = usePageContent('founder');
    const { data: instituteData, refetch: refetchInstitute } = usePageContent('institute');
    const { data: teamMembers = [], refetch: refetchTeam } = useTeamMembers();

    // Helper functions for CRUD
    const updateFounder = async (data: any) => {
        try {
            await setDoc(doc(db, 'pages', 'founder'), data, { merge: true });
            refetchFounder();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const updateInstitute = async (data: any) => {
        try {
            await setDoc(doc(db, 'pages', 'institute'), data, { merge: true });
            refetchInstitute();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const addTeamMember = async (member: any) => {
        try {
            await addDoc(collection(db, 'team_members'), member);
            refetchTeam();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const updateTeamMember = async (id: string, updates: any) => {
        try {
            await updateDoc(doc(db, 'team_members', id), updates);
            refetchTeam();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const deleteTeamMember = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'team_members', id));
            refetchTeam();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<'founder' | 'institute' | 'team'>('founder');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [founderForm, setFounderForm] = useState<any>({});
    const [instituteForm, setInstituteForm] = useState<any>({});

    // Member form state
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [memberForm, setMemberForm] = useState({ name: '', role: '', bio: '', image: '' });
    const [isAddingMember, setIsAddingMember] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'founder' | 'team') => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setUploading(true);
        try {
            const urls = await uploadFiles([file], 'avatars'); // Consistently use 'avatars' bucket
            const url = urls[0];

            if (target === 'founder') {
                setFounderForm(prev => ({ ...prev, image: url }));
            } else if (target === 'team') {
                setMemberForm(prev => ({ ...prev, image: url }));
            }
            addToast('Imagem enviada com sucesso!', 'success');
        } catch (error) {
            console.error("Upload error:", error);
            addToast("Erro ao enviar imagem.", 'error');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (founderData) setFounderForm(founderData);
        if (instituteData) setInstituteForm(instituteData);
    }, [founderData, instituteData]);

    const handleFounderSave = async () => {
        setLoading(true);
        const success = await updateFounder(founderForm);
        setLoading(false);
        if (success) addToast('Dados da fundadora atualizados!', 'success');
        else addToast('Erro ao atualizar dados.', 'error');
    };

    const handleInstituteSave = async () => {
        setLoading(true);
        const success = await updateInstitute(instituteForm);
        setLoading(false);
        if (success) addToast('Dados do instituto atualizados!', 'success');
        else addToast('Erro ao atualizar dados.', 'error');
    };

    const handleSaveMember = async () => {
        setLoading(true);
        let success;
        if (editingMember) {
            success = await updateTeamMember(editingMember, memberForm);
            setEditingMember(null);
        } else {
            success = await addTeamMember(memberForm);
            setIsAddingMember(false);
        }

        if (success) {
            addToast(`Membro ${editingMember ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
            setMemberForm({ name: '', role: '', bio: '', image: '' }); // Reset
        } else {
            addToast('Erro ao salvar membro da equipe.', 'error');
        }
        setLoading(false);
    };

    const startEditMember = (member: any) => {
        setMemberForm(member);
        setEditingMember(member.id);
        setIsAddingMember(true);
    };

    const handleDeleteMember = async (id: string) => {
        if (confirm("Tem certeza que deseja remover este membro?")) {
            setLoading(true);
            const success = await deleteTeamMember(id);
            setLoading(false);
            if (success) addToast('Membro removido com sucesso.', 'success');
            else addToast('Erro ao remover membro.', 'error');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex gap-4 border-b border-stone-200 pb-1 overflow-x-auto">
                {['founder', 'institute', 'team'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-2 border-gold' : 'text-stone-400 hover:text-primary'
                            }`}
                    >
                        {tab === 'founder' ? 'Fundadora' : tab === 'institute' ? 'Instituto' : 'Equipe'}
                    </button>
                ))}
            </div>

            {/* FOUNDER TAB */}
            {activeTab === 'founder' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-2xl animate-fade-in-up">
                    <h3 className="font-serif text-2xl text-primary mb-6">Editar Fundadora</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Nome</label>
                            <input
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                value={founderForm.name || ''}
                                onChange={e => setFounderForm({ ...founderForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Papel/Cargo</label>
                            <input
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                value={founderForm.role || ''}
                                onChange={e => setFounderForm({ ...founderForm, role: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Bio</label>
                            <textarea
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-32"
                                value={founderForm.bio || ''}
                                onChange={e => setFounderForm({ ...founderForm, bio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Link Lattes</label>
                            <input
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                value={founderForm.link || ''}
                                onChange={e => setFounderForm({ ...founderForm, link: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Foto da Fundadora</label>
                            <div className="flex gap-6 items-start">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 border relative group">
                                    {founderForm.image ? (
                                        <div className="w-full h-full relative">
                                            <Image src={founderForm.image} alt="Founder" fill className="object-cover" />
                                            <button
                                                onClick={() => setFounderForm({ ...founderForm, image: '' })}
                                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <User size={32} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, 'founder')}
                                        disabled={uploading}
                                    />
                                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin" size={20} /></div>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-stone-500 mb-2">Clique na imagem para alterar a foto (Upload).</p>
                                    <input
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                        value={founderForm.image || ''}
                                        onChange={e => setFounderForm({ ...founderForm, image: e.target.value })}
                                        placeholder="Ou cole uma URL aqui..."
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleFounderSave}
                            disabled={loading}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
                        >
                            <Save size={16} /> Salvar Alterações
                        </button>
                    </div>
                </div>
            )}

            {/* INSTITUTE TAB */}
            {activeTab === 'institute' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-4xl animate-fade-in-up">
                    <h3 className="font-serif text-2xl text-primary mb-6">Editar Instituto</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Título Principal</label>
                                <input
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                    value={instituteForm.title || ''}
                                    onChange={e => setInstituteForm({ ...instituteForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Subtítulo</label>
                                <textarea
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-24"
                                    value={instituteForm.subtitle || ''}
                                    onChange={e => setInstituteForm({ ...instituteForm, subtitle: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Endereço</label>
                                <input
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                    value={instituteForm.address || ''}
                                    onChange={e => setInstituteForm({ ...instituteForm, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Título do Manifesto</label>
                                <input
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                    value={instituteForm.manifesto_title || ''}
                                    onChange={e => setInstituteForm({ ...instituteForm, manifesto_title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Texto do Manifesto</label>
                                <textarea
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-40"
                                    value={instituteForm.manifesto_text || ''}
                                    onChange={e => setInstituteForm({ ...instituteForm, manifesto_text: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Frase de Destaque (Quote)</label>
                                <input
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                    value={instituteForm.quote || ''}
                                    onChange={e => setInstituteForm({ ...instituteForm, quote: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-stone-100">
                        <button
                            onClick={handleInstituteSave}
                            disabled={loading}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
                        >
                            <Save size={16} /> Salvar Instituto
                        </button>
                    </div>
                </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="flex justify-between items-center">
                        <h3 className="font-serif text-2xl text-primary">Membros da Equipe</h3>
                        {!isAddingMember && (
                            <button
                                onClick={() => { setIsAddingMember(true); setEditingMember(null); setMemberForm({ name: '', role: '', bio: '', image: '' }) }}
                                className="bg-gold text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold-dark transition-colors"
                            >
                                <Plus size={16} /> Novo Membro
                            </button>
                        )}
                    </div>

                    {isAddingMember && (
                        <div className="bg-white p-6 rounded-xl border-l-4 border-gold shadow-md">
                            <h4 className="font-bold text-primary mb-4">{editingMember ? 'Editar Membro' : 'Novo Membro'}</h4>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 border relative group">
                                        {memberForm.image ? (
                                            <div className="w-full h-full relative">
                                                <Image src={memberForm.image} alt="Preview" fill className="object-cover" />
                                                <button
                                                    onClick={() => setMemberForm({ ...memberForm, image: '' })}
                                                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                <Upload size={24} />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileUpload(e, 'team')}
                                            disabled={uploading}
                                        />
                                        {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin" size={16} /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Foto do Membro</p>
                                        <input
                                            placeholder="Nome"
                                            className="w-full p-3 bg-stone-50 border rounded-lg mb-2"
                                            value={memberForm.name}
                                            onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        placeholder="Papel/Cargo"
                                        className="p-3 bg-stone-50 border rounded-lg"
                                        value={memberForm.role}
                                        onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                                    />
                                    <input
                                        placeholder="Bio curta"
                                        className="p-3 bg-stone-50 border rounded-lg"
                                        value={memberForm.bio}
                                        onChange={e => setMemberForm({ ...memberForm, bio: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveMember} disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Save size={14} /> Salvar
                                    </button>
                                    <button onClick={() => setIsAddingMember(false)} className="bg-stone-200 text-stone-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                    }

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamMembers.map((member: any) => (
                            <div key={member.id} className="bg-white p-6 rounded-xl border border-stone-100 hover:shadow-lg transition-all group relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100 relative">
                                        {member.image ? (
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : <div className="w-full h-full flex items-center justify-center font-bold text-stone-300">?</div>}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-primary">{member.name}</h5>
                                        <span className="text-[10px] uppercase font-bold text-stone-400">{member.role}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-stone-500 line-clamp-2">{member.bio}</p>

                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditMember(member)} className="p-2 bg-stone-100 text-primary rounded hover:bg-gold hover:text-white transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteMember(member.id)} className="p-2 bg-stone-100 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div >
            )}
        </div >
    );
}
