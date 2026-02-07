'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { updateProfile as updateProfileAction, uploadAvatar } from '@/actions/profile';
import { Camera, Loader2, Save, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export function ProfileForm() {
    const { user, updateProfile } = useAuth(); // Get context updater
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);

    // Avatar State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fetch Extra Data (Bio)
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setPreviewUrl(user.photoURL);

            // Fetch Bio from Firestore
            getDoc(doc(db, 'users', user.uid)).then(snap => {
                if (snap.exists()) {
                    setBio(snap.data().bio || '');
                }
                setDataLoaded(true);
            }).catch(err => console.error(err));
        }
    }, [user]);

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // Needed for re-auth
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // 1. Upload Avatar if changed
            let newPhotoURL = user?.photoURL;
            if (avatarFile) {
                console.log("[DEBUG] Starting avatar upload...", avatarFile.name);
                const formData = new FormData();
                formData.append('file', avatarFile);

                const uploadRes = await uploadAvatar(formData);
                console.log("[DEBUG] Upload result:", uploadRes);
                if (uploadRes.error) throw new Error(uploadRes.error);
                if (uploadRes.url) newPhotoURL = uploadRes.url;
            }

            console.log("[DEBUG] Updating profile info...");
            // 2. Update Info
            const updateRes = await updateProfileAction({ displayName, bio });
            console.log("[DEBUG] Update result:", updateRes);
            if (updateRes.error) throw new Error(updateRes.error);

            // 3. Update Client Context (Sync Sidebar)
            if (user) {
                console.log("[DEBUG] Syncing client context...");
                try {
                    // We don't want this to block if there's a connection issue with Firebase Client SDK,
                    // since the source of truth (Firestore/Action) already succeeded.
                    await updateProfile({ displayName, photoURL: newPhotoURL });
                } catch (e) {
                    console.error("[DEBUG] Client-side updateProfile failed, but data is saved in Firestore:", e);
                }
            }

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            router.refresh();
            // Force page reload as fallback or rely on context?
            // Ideally context. But let's look at imports.
            // Import alias needed.

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao salvar perfil.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Senhas não conferem.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Senha deve ter no mínimo 6 caracteres.' });
            return;
        }
        if (!user || !user.email) return;

        setLoading(true);
        setMessage(null);

        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Usuário não autenticado.");

            // Re-authenticate (Best practice before sensitive changes)
            if (currentPassword) {
                const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
            }

            await updatePassword(currentUser, newPassword);
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
            setShowPasswordSection(false);

        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                setMessage({ type: 'error', text: 'Por segurança, faça login novamente antes de trocar a senha.' });
            } else if (error.code === 'auth/wrong-password') {
                setMessage({ type: 'error', text: 'Senha atual incorreta.' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao alterar senha.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Info Form */}
            <form onSubmit={handleSaveProfile} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
                <h2 className="text-xl font-serif font-bold text-stone-800">Dados Pessoais</h2>

                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border border-stone-200">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif text-3xl">
                                    {(displayName?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <Camera size={24} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-stone-700">Foto de Perfil</p>
                        <p className="text-xs text-stone-400">JPG, PNG ou WEBP. Máx 5MB.</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Bio / Sobre Você</label>
                        <textarea
                            className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Conte um pouco sobre você..."
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="primary" isLoading={loading} leftIcon={<Save size={18} />}>
                        Salvar Alterações
                    </Button>
                </div>
            </form>

            {/* Security Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
                        <Lock size={20} className="text-stone-400" />
                        Segurança
                    </h2>
                    {!showPasswordSection && (
                        <button
                            onClick={() => setShowPasswordSection(true)}
                            className="text-sm text-primary hover:underline font-medium"
                        >
                            Alterar Senha
                        </button>
                    )}
                </div>

                {showPasswordSection && (
                    <form onSubmit={handleChangePassword} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg mb-4">
                            Para sua segurança, confirme sua senha atual antes de definir uma nova.
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Senha Atual</label>
                            <input
                                type="password"
                                className="w-full p-2 border border-stone-200 rounded-lg"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Nova Senha</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border border-stone-200 rounded-lg"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    className="w-full p-2 border border-stone-200 rounded-lg"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setCurrentPassword('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" variant="outline" isLoading={loading} className="border-red-200 text-red-600 hover:bg-red-50">
                                Atualizar Senha
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
