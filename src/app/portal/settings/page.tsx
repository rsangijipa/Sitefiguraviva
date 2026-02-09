import { ProfileForm } from "@/components/profile/ProfileForm";
import { UserAchievements } from "@/components/profile/UserAchievements";

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="mb-8 px-4">
        <h1 className="font-serif text-3xl text-stone-800">Minha Conta</h1>
        <p className="text-stone-500 mt-1">
          Gerencie suas preferências e conquistas pessoais.
        </p>
      </header>

      <div className="flex-1 pb-12 space-y-8">
        <UserAchievements />
        <ProfileForm />
      </div>
    </div>
  );
}
