import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { QuizCard } from "../components/QuizCard";
import { CATEGORIES } from "../data/categories";
import { QUIZZES } from "../data/quizzes";
import { SCREENINGS } from "../data/screenings";
import { VALIDATED_INSTRUMENTS } from "../data/instruments";
import { Quiz, Screening, ValidatedInstrument } from "../types";
import "./Home.css";

interface HomeProps {
  onSelectQuestionnaire: (questionnaire: Quiz | Screening) => void;
  onSelectInstrument: (instrument: ValidatedInstrument) => void;
}

export function Home({ onSelectQuestionnaire, onSelectInstrument }: HomeProps) {
  const allQuestionnairies = [...QUIZZES, ...SCREENINGS];

  const groupedByCategory = Object.entries(CATEGORIES).reduce(
    (acc, [key, category]) => {
      const questionnaires = allQuestionnairies.filter(
        (q) => q.category === category.id,
      );
      const instruments = VALIDATED_INSTRUMENTS.filter(
        (i) => i.category === category.id,
      );

      const allItems = [...questionnaires, ...instruments];

      if (allItems.length > 0) {
        acc[key] = { category, questionnaires, instruments };
      }
      return acc;
    },
    {} as Record<
      string,
      {
        category: (typeof CATEGORIES)[keyof typeof CATEGORIES];
        questionnaires: (Quiz | Screening)[];
        instruments: ValidatedInstrument[];
      }
    >,
  );

  return (
    <div className="home">
      <main className="qz-app-container home__main">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="home__hero"
        >
          <div className="home__hero-content">
            <div className="home__hero-label">
              AUTOCONHECIMENTO EM MOVIMENTO
            </div>
            <h1 className="home__hero-title">
              Conheça um pouco mais
              <br />
              sobre você
            </h1>
            <p className="home__hero-text">
              Quizzes, reflexões e questionários sobre saúde mental,
              comportamento e vida profissional.
            </p>
            <div className="home__hero-divider"></div>
          </div>
          <div className="home__hero-visual">
            <div className="home__hero-decoration"></div>
          </div>
        </motion.section>

        {/* CATÁLOGO */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="home__catalog"
        >
          {Object.entries(groupedByCategory).map(
            ([key, { category, questionnaires, instruments }], sectionIdx) => (
              <section key={key} className="home__category-section">
                <div className="home__category-header">
                  <h2 className="home__category-title">{category.name}</h2>
                  <a href="#" className="home__category-link">
                    Ver todos →
                  </a>
                </div>

                <div className="home__quiz-grid">
                  {questionnaires.map((questionnaire, idx) => (
                    <QuizCard
                      key={questionnaire.id}
                      questionnaire={questionnaire}
                      onClick={() => onSelectQuestionnaire(questionnaire)}
                      index={idx}
                    />
                  ))}

                  {instruments.map((instrument, idx) => (
                    <QuizCard
                      key={instrument.id}
                      questionnaire={instrument}
                      onClick={() => onSelectInstrument(instrument)}
                      index={idx + questionnaires.length}
                    />
                  ))}
                </div>
              </section>
            ),
          )}
        </motion.section>

        {/* RODAPÉ EDUCATIVO */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="home__footer-notice"
        >
          <div className="home__footer-content">
            <p className="home__footer-text">
              <strong>Sobre estes questionários.</strong> Têm finalidade
              educativa e de autoconhecimento. Resultados não constituem
              diagnóstico psicológico ou psiquiátrico.
            </p>
            <Link href="/" className="home__footer-link">
              Voltar ao site
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
