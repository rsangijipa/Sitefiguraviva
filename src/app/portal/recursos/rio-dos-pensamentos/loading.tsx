export default function Loading() {
  return (
    <div
      className="flex min-h-[80vh] items-center justify-center bg-[#FDFAF4] p-6"
      role="status"
      aria-label="Carregando Rio dos Pensamentos"
    >
      <div className="w-full max-w-xl space-y-6" aria-busy="true">
        <div className="mx-auto h-8 w-3/4 animate-pulse rounded-xl bg-[#F1E9DB]" />
        <div className="space-y-3">
          <div className="h-4 animate-pulse rounded bg-[#F1E9DB]" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[#F1E9DB]" />
        </div>
      </div>
    </div>
  );
}
