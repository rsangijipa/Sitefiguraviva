import { motion } from "framer-motion";
import { DomainResult } from "../types";
import "./ResultCard.css";

interface ResultCardProps {
  domain: DomainResult;
  index: number;
}

function getIndicatorType(percentage: number): string {
  if (percentage >= 75) return "high";
  if (percentage >= 50) return "moderate";
  return "low";
}

export function ResultCard({ domain, index }: ResultCardProps) {
  const indicatorType = getIndicatorType(domain.percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="result-card"
    >
      <div className="result-card__header">
        <h3 className="result-card__title">{domain.domain}</h3>
        <span className="result-card__percentage">{domain.percentage}%</span>
      </div>

      <div className="result-card__bar">
        <div
          className={`result-card__bar-fill result-card__bar-fill--${indicatorType}`}
          style={{ width: `${domain.percentage}%` }}
        />
      </div>

      {domain.description && (
        <p className="result-card__description">{domain.description}</p>
      )}

      <div className="result-card__label">
        <div
          className={`result-card__indicator result-card__indicator--${indicatorType}`}
        />
        <span className="result-card__label-text">{domain.label}</span>
      </div>
    </motion.div>
  );
}
