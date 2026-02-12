"use client";

import { Lock, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export function NoPermission() {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitchAccount = async () => {
    // Redirect to auth preserving the current intent (admin page)
    await signOut(`/auth?next=${encodeURIComponent(pathname)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-500">
        <Lock size={40} />
      </div>

      <h1 className="font-serif text-3xl text-primary font-bold mb-4">
        Acesso Restrito
      </h1>
      <p className="text-muted max-w-md mx-auto mb-8 leading-relaxed">
        Você não tem permissão para acessar esta área. Se acredita que isso é um
        erro, entre em contato com o suporte.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
        >
          Voltar para o Início
        </Link>

        <button
          onClick={handleSwitchAccount}
          className="inline-flex items-center justify-center bg-white border-2 border-primary/10 text-primary px-8 py-3 rounded-xl font-bold hover:bg-stone-50 transition-all gap-2"
        >
          <LogOut size={18} />
          Entrar com outra conta
        </button>
      </div>
    </div>
  );
}
