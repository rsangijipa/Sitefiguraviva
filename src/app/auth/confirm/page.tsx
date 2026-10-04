"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { ensureUserProfileAction } from "@/app/actions/auth";
import { getRedirectPathForRole } from "@/lib/auth/authService";
import PageShell from "@/components/ui/PageShell";
function ConfirmationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const courseId = params.get("courseId");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const complete = async () => {
      try {
        const client = createSupabaseBrowserClient();
        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError || !data.session?.access_token)
          throw new Error("Invalid confirmation");
        const result = await ensureUserProfileAction(data.session.access_token);
        if (!result.success) throw new Error("Profile unavailable");
        if (cancelled) return;
        const role = result.user?.role;
        const target =
          courseId && role === "student"
            ? "/inscricao/" + encodeURIComponent(courseId)
            : getRedirectPathForRole(role);
        router.refresh();
        router.replace(target);
      } catch {
        if (!cancelled)
          setError(
            "Não foi possível concluir a confirmação. O link pode ter expirado ou já ter sido utilizado. Tente fazer login ou recuperar sua senha.",
          );
      }
    };
    void complete();
    return () => {
      cancelled = true;
    };
  }, [courseId, router]);
  return (
    <PageShell variant="auth" className="min-h-screen p-8">
      <div className="mx-auto max-w-lg rounded-md border border-border bg-paper p-8 text-center">
        <h1 className="mb-4 font-serif text-2xl text-primary">
          Confirmação de e-mail
        </h1>
        <p role={error ? "alert" : "status"}>
          {error || "Confirmando seu e-mail e preparando sua inscrição…"}
        </p>
        {error && (
          <Link
            className="mt-6 inline-block underline"
            href={
              courseId
                ? "/auth?next=" +
                  encodeURIComponent(
                    "/inscricao/" + encodeURIComponent(courseId),
                  )
                : "/auth"
            }
          >
            Voltar ao login
          </Link>
        )}
      </div>
    </PageShell>
  );
}
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<p role="status">Confirmando e-mail…</p>}>
      <ConfirmationContent />
    </Suspense>
  );
}
