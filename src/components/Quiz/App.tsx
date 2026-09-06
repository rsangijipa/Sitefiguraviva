import { useState } from "react";
import { Quiz, Screening, QuizResult, ValidatedInstrument } from "./types";
import { Home } from "./pages/Home";
import { QuizPage } from "./pages/QuizPage";
import { ResultPage } from "./pages/ResultPage";
import { AssessmentPage } from "./pages/AssessmentPage";
import { getResults } from "./utils/storage";
import "./index.css";

type Screen = "home" | "quiz" | "result" | "assessment";

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<
    Quiz | Screening | null
  >(null);
  const [selectedInstrument, setSelectedInstrument] =
    useState<ValidatedInstrument | null>(null);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);

  const handleSelectQuestionnaire = (questionnaire: Quiz | Screening) => {
    setSelectedQuestionnaire(questionnaire);
    setScreen("quiz");
  };

  const handleSelectInstrument = (instrument: ValidatedInstrument) => {
    setSelectedInstrument(instrument);
    setScreen("assessment");
  };

  const handleQuizComplete = (resultId: string) => {
    const result = getResults().find((r) => r.id === resultId);
    if (result) {
      setCurrentResult(result);
      setScreen("result");
    }
  };

  const handleRestartQuiz = () => {
    setCurrentResult(null);
    setScreen("quiz");
  };

  const handleBackToHome = () => {
    setScreen("home");
    setSelectedQuestionnaire(null);
    setSelectedInstrument(null);
    setCurrentResult(null);
  };

  return (
    <div className="quiz-bank min-h-screen">
      {screen === "home" && (
        <Home
          onSelectQuestionnaire={handleSelectQuestionnaire}
          onSelectInstrument={handleSelectInstrument}
        />
      )}

      {screen === "quiz" && selectedQuestionnaire && (
        <QuizPage
          questionnaire={selectedQuestionnaire}
          onBack={handleBackToHome}
          onResult={handleQuizComplete}
        />
      )}

      {screen === "result" && selectedQuestionnaire && currentResult && (
        <ResultPage
          questionnaire={selectedQuestionnaire}
          result={currentResult}
          onRestart={handleRestartQuiz}
          onHome={handleBackToHome}
        />
      )}

      {screen === "assessment" && selectedInstrument && (
        <AssessmentPage
          instrument={selectedInstrument}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;
