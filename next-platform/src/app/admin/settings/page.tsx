"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Save, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AdminContentPage() {
    const {
        founderData, updateFounder,
        instituteData, updateInstitute,
        teamMembers, addTeamMember, updateTeamMember, deleteTeamMember
    } = useApp();

    const [activeTab, setActiveTab] = useState<'founder' | 'institute' | 'team'>('founder');
    const [loading, setLoading] = useState(false);
    const [founderForm, setFounderForm] = useState<any>({});
    const [instituteForm, setInstituteForm] = useState<any>({});

    // Member form state
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [memberForm, setMemberForm] = useState({ name: '', role: '', bio: '', image: '' });
    const [isAddingMember, setIsAddingMember] = useState(false);

    useEffect(() => {
        if (founderData) setFounderForm(founderData);
        if (instituteData) setInstituteForm(instituteData);
    }, [founderData, instituteData]);

    const handleFounderSave = async () => {
        setLoading(true);
        await updateFounder(founderForm);
        setLoading(false);
        alert('Dados da fundadora atualizados!');
    };

    const handleInstituteSave = async () => {
        setLoading(true);
        await updateInstitute(instituteForm);
        setLoading(false);
        alert('Dados do instituto atualizados!');
    };

    const handleSaveMember = async () => {
        setLoading(true);
        if (editingMember) {
            await updateTeamMember(editingMember, memberForm);
            setEditingMember(null);
        } else {
            await addTeamMember(memberForm);
            setIsAddingMember(false);
        }
        setMemberForm({ name: '', role: '', bio: '', image: '' }); // Reset
        setLoading(false);
    };

    const startEditMember = (member: any) => {
        setMemberForm(member);
        setEditingMember(member.id);
        setIsAddingMember(true);
    };

    const handleDeleteMember = async (id: string) => {
        if (confirm("Tem certeza?")) {
            setLoading(true);
            await deleteTeamMember(id);
            setLoading(false);
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
                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">URL Foto</label>
                            <input
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                                value={founderForm.image || ''}
                                onChange={e => setFounderForm({ ...founderForm, image: e.target.value })}
                            />
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
                                <input
                                    placeholder="Nome"
                                    className="p-3 bg-stone-50 border rounded-lg"
                                    value={memberForm.name}
                                    onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                                />
                                <input
                                    placeholder="Papel/Cargo"
                                    className="p-3 bg-stone-50 border rounded-lg"
                                    value={memberForm.role}
                                    onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                                />
                                <input
                                    placeholder="URL da Foto"
                                    className="p-3 bg-stone-50 border rounded-lg"
                                    value={memberForm.image}
                                    onChange={e => setMemberForm({ ...memberForm, image: e.target.value })}
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
                    )}

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
                </div>
            )}
        </div>
    );
}
