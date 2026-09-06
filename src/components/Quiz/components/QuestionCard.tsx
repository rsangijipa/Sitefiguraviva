import { motion } from "framer-motion";
import { Question } from "../types";
import "./QuestionCard.css";

interface QuestionCardProps {
  question: Question;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="question-card"
    >
      <h2 className="question-card__text">{question.text}</h2>
      {question.description && (
        <p className="question-card__description">{question.description}</p>
      )}
    </motion.div>
  );
}
