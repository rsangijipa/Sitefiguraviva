import "./ProgressBar.css";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-bar">
      <div className="progress-bar__info">
        <span className="progress-bar__label">
          Pergunta {current} de {total}
        </span>
        <span className="progress-bar__percent">{Math.round(percentage)}%</span>
      </div>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
