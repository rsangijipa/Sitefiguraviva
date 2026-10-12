"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import PageShell from "@/components/ui/PageShell";
import styles from "../AuthPage.module.css";
function ResetContent() {
  const { resetPassword } = useAuth();
  const params = useSearchParams();
  const back = "/auth?" + params.toString();
  const [email,setEmail] = useState("");
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [error,setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try { await resetPassword(email); setSuccess(true); }
    catch { setError("Não foi possível enviar as instruções. Tente novamente em instantes."); }
    finally { setLoading(false); }
  };
  return <PageShell variant="auth" className={styles.shell}>
    <nav className={styles.navigation}><Link href={back} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-paper/95 px-4 text-sm font-semibold text-primary"><ArrowLeft size={16} />Voltar para login</Link></nav>
    <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-lg items-center justify-center py-8">
      <div className={styles.card}><h1 className="font-serif text-3xl text-primary">Recuperar acesso</h1>
        {success ? <div role="status" className="mt-5 space-y-5 text-text"><p>Se existir uma conta para este e-mail, você receberá as instruções. Confira sua caixa de entrada e a pasta de spam.</p><Link href={back} className="inline-flex min-h-11 items-center font-bold text-primary underline">Voltar para login</Link></div> : <form onSubmit={submit} className="mt-5 space-y-5"><p className="text-muted">Informe o e-mail da sua conta para receber um link de recuperação.</p><Input id="recovery-email" label="E-mail" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />{error && <p role="alert" className="text-sm text-terra">{error}</p>}<button disabled={loading} className="min-h-12 w-full rounded-xl bg-primary px-4 font-bold text-white disabled:opacity-50">{loading ? "Enviando…" : "Enviar instruções"}</button></form>}
      </div>
    </div>
  </PageShell>;
}
export default function ResetPasswordPage() { return <Suspense fallback={<p role="status">Preparando recuperação…</p>}><ResetContent /></Suspense>; }
