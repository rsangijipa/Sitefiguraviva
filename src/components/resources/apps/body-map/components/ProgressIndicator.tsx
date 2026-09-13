interface ProgressIndicatorProps {
  markedCount: number;
  totalCount: number;
}

export function ProgressIndicator({
  markedCount,
  totalCount,
}: ProgressIndicatorProps) {
  const percentage =
    totalCount > 0
      ? Math.min(100, Math.max(0, Math.round((markedCount / totalCount) * 100)))
      : 0;

  return (
    <div
      className="space-y-1"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${markedCount} de ${totalCount} regiões marcadas`}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out-soft"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[11px] text-text/50">
        {markedCount} de {totalCount} regi&otilde;es
      </p>
    </div>
  );
}
