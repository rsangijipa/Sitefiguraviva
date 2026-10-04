"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { Input } from "@/components/ui/Input";
import PageShell from "@/components/ui/PageShell";
export default function UpdatePasswordPage() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const client = createSupabaseBrowserClient();
        await client.auth.getSession();
        const { data, error: authError } = await client.auth.getUser();
        if (authError || !data.user)
          throw new Error("Invalid recovery session");
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled)
          setError(
            "O link de recuperação é inválido ou expirou. Solicite um novo link.",
          );
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setSaving(true);
    try {
      const client = createSupabaseBrowserClient();
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setPassword("");
      setConfirmation("");
      const { error: logoutError } = await client.auth.signOut({
        scope: "global",
      });
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (logoutError || !response.ok)
        setError(
          "A senha foi alterada, mas não foi possível encerrar todas as sessões. Saia da conta e entre novamente.",
        );
    } catch {
      setError(
        "Não foi possível concluir a operação. Se a senha já foi alterada, faça login com a nova senha; caso contrário, tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <PageShell variant="auth" className="min-h-screen p-8">
      <div className="mx-auto max-w-lg rounded-md border border-border bg-paper p-8">
        <h1 className="mb-6 font-serif text-2xl text-primary">
          Definir nova senha
        </h1>
        {checking && <p role="status">Validando o link…</p>}
        {error && (
          <p role="alert" className="mb-4 text-terra">
            {error}
          </p>
        )}
        {success ? (
          <div role="status">
            <p>Senha alterada. Entre com sua nova senha.</p>
            <Link href="/auth" className="mt-6 inline-block underline">
              Ir para o login
            </Link>
          </div>
        ) : (
          ready && (
            <form onSubmit={submit} className="space-y-4">
              <Input
                id="new-password"
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                id="confirm-password"
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-6 py-3 text-white disabled:opacity-50"
              >
                {saving ? "Salvando…" : "Salvar nova senha"}
              </button>
            </form>
          )
        )}
        {!checking && !ready && (
          <Link href="/auth/reset-password" className="underline">
            Solicitar outro link
          </Link>
        )}
      </div>
    </PageShell>
  );
}
