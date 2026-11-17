import { ProfileForm } from "@/components/profile/ProfileForm";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="mb-8 px-4">
        <h1 className="font-serif text-3xl text-stone-800">Minha Conta</h1>
        <p className="text-stone-500 mt-1">
          Gerencie seus dados pessoais e acesse sua jornada.
        </p>
      </header>

      <div className="flex-1 pb-12 space-y-8">
        <nav aria-label="Minha conta" className="flex flex-wrap gap-2 px-4"><Link href="/portal/settings" aria-current="page" className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Dados pessoais</Link><Link href="/portal/gamificacao" className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-primary">Conquistas</Link><Link href="/portal/courses" className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-primary">Meus cursos</Link></nav>
        <ProfileForm />
      </div>
    </div>
  );
}
