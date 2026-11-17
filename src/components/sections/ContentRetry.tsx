"use client";

export function ContentRetry({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      role="status"
      className="w-full rounded-md border border-border bg-paper p-6 text-primary"
    >
      <p className="font-semibold">Não foi possível carregar este conteúdo.</p>
      <p className="mt-2">Confira sua conexão e tente novamente.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-md border border-primary px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Tentar novamente
      </button>
    </div>
  );
}
