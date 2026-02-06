
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-[#FDFCF9] py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Meu Perfil</h1>
                <p className="text-stone-500">Gerencie suas informações pessoais e segurança.</p>
            </div>

            <ProfileForm />
        </div>
    );
}
