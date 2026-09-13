interface GardenEmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function GardenEmptyState({
  message,
  actionLabel,
  onAction,
}: GardenEmptyStateProps) {
  return (
    <div
      className="relative min-h-[240px] sm:min-h-[320px] rounded-[24px] border-2 border-[#D8CFBE] bg-[#FDFAF4] p-6 flex items-center justify-center"
      role="status"
    >
      <p className="font-serif text-xl italic text-[#005A1F]/55 text-center py-12 max-w-sm">
        {message}
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-6 py-2 bg-[#005A1F] text-white rounded-xl text-xs font-bold hover:bg-[#07614C] transition min-h-[44px]"
        >
          {actionLabel || "Come\u00e7ar"}
        </button>
      )}
    </div>
  );
}
