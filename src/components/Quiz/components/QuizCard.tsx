import { motion } from "framer-motion";
import { ChevronRight, Clock } from "lucide-react";
import { Quiz, Screening, ValidatedInstrument } from "../types";
import "./QuizCard.css";

interface QuizCardProps {
  questionnaire: Quiz | Screening | ValidatedInstrument;
  onClick: () => void;
  index: number;
}

export function QuizCard({ questionnaire, onClick, index }: QuizCardProps) {
  const isScreening =
    "type" in questionnaire && questionnaire.type === "screening";
  const isValidatedInstrument = questionnaire.type === "validated_instrument";

  const getTitle = () => {
    if ("title" in questionnaire) return questionnaire.title;
    if ("publicTitle" in questionnaire) return questionnaire.publicTitle;
    return "Instrumento";
  };

  const getDescription = () => {
    if ("description" in questionnaire) return questionnaire.description;
    if ("purpose" in questionnaire) return questionnaire.purpose;
    return "";
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="quiz-card"
    >
      <div className="quiz-card__content">
        <h3 className="quiz-card__title">{getTitle()}</h3>
        {"subtitle" in questionnaire && questionnaire.subtitle && (
          <p className="quiz-card__subtitle">{questionnaire.subtitle}</p>
        )}
        <p className="quiz-card__description">{getDescription()}</p>
      </div>

      <div className="quiz-card__footer">
        <div className="quiz-card__metadata">
          <span className="quiz-card__meta-item">
            {questionnaire.questions.length} perguntas
          </span>
          {"estimatedTime" in questionnaire && questionnaire.estimatedTime && (
            <span className="quiz-card__meta-item">
              <Clock size={12} strokeWidth={2} />
              {Math.ceil(questionnaire.estimatedTime / 60)} min
            </span>
          )}
          {isScreening && <span className="quiz-card__badge">RASTREIO</span>}
          {isValidatedInstrument && (
            <span className="quiz-card__badge quiz-card__badge--validated">
              VALIDADO
            </span>
          )}
        </div>
        <ChevronRight size={16} strokeWidth={2} className="quiz-card__arrow" />
      </div>
    </motion.button>
  );
}
