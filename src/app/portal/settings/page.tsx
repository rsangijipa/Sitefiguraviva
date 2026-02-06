import { ProfileForm } from '@/components/profile/ProfileForm';

export default function SettingsPage() {
    return (
        <div className="h-full flex flex-col">
            <header className="mb-8 px-4">
                <h1 className="font-serif text-3xl text-stone-800">Minha Conta</h1>
                <p className="text-stone-500 mt-1">Gerencie suas preferências e dados pessoais.</p>
            </header>

            <div className="flex-1 pb-12">
                <ProfileForm />
            </div>
        </div>
    );
}
