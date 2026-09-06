import { motion } from "framer-motion";
import { AnswerValue } from "../types";
import "./AnswerOption.css";

interface AnswerOptionProps {
  label: string;
  value: AnswerValue;
  selected: boolean;
  onClick: (value: AnswerValue) => void;
  index: number;
}

export function AnswerOption({
  label,
  value,
  selected,
  onClick,
  index,
}: AnswerOptionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(value)}
      className={`answer-option ${selected ? "answer-option--selected" : ""}`}
    >
      <div className="answer-option__radio">
        {selected && <div className="answer-option__radio-check"></div>}
      </div>
      <span className="answer-option__label">{label}</span>
    </motion.button>
  );
}
