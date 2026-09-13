export function GardenLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FDFAF4]">
      <div
        className="max-w-xl w-full space-y-6"
        aria-busy="true"
        aria-label="Carregando jardim de pensamentos"
      >
        <div className="h-8 bg-[#F1E9DB] animate-pulse rounded-xl w-3/4 mx-auto" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-4 bg-[#F1E9DB] animate-pulse rounded" />
          ))}
        </div>
        <div className="h-48 sm:h-64 bg-[#F1E9DB]/50 animate-pulse rounded-[24px]" />
      </div>
    </div>
  );
}
