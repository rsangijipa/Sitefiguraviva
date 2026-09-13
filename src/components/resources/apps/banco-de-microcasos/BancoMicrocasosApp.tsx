"use client";
import { useState } from "react";
import { ViewState } from "./types";
import { cases, themes } from "./data/cases";
import HomeView from "./pages/HomeView";
import PlayerView from "./pages/PlayerView";
import ClosureView from "./pages/ClosureView";
import HistoryView from "./pages/HistoryView";

interface BancoMicrocasosAppProps {
  activeSection: ViewState;
  onSectionChange: (view: ViewState) => void;
}

export default function BancoMicrocasosApp({
  activeSection: view,
  onSectionChange: setView,
}: BancoMicrocasosAppProps) {
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>(["014"]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [filterLevel, setFilterLevel] = useState<string>("Todos");

  const item = cases[current];

  const openCase = (index: number) => {
    setCurrent(index);
    setStep(0);
    setAnswers({});
    setTextAnswers({});
    setView("case");
  };

  const handleToggleOption = (option: string) => {
    setAnswers((prev) => {
      const currentList = prev[step] || [];
      const updated = currentList.includes(option)
        ? currentList.filter((x) => x !== option)
        : [...currentList, option];
      return { ...prev, [step]: updated };
    });
  };

  const handleNextStep = () => {
    if (step < item.steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setView("closure");
    }
  };

  const toggleBookmark = (id: string) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleReview = (id: string) => {
    setReviewed((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  if (view === "closure") {
    return (
      <ClosureView
        item={item}
        isReviewed={reviewed.includes(item.id)}
        isSaved={saved.includes(item.id)}
        onBack={() => setView("home")}
        onToggleReview={() => toggleReview(item.id)}
        onToggleBookmark={() => toggleBookmark(item.id)}
      />
    );
  }

  if (view === "case") {
    return (
      <PlayerView
        item={item}
        step={step}
        answers={answers}
        textAnswers={textAnswers}
        isSaved={saved.includes(item.id)}
        onBookmark={() => toggleBookmark(item.id)}
        onToggleOption={handleToggleOption}
        onTextChange={(txt) => setTextAnswers({ ...textAnswers, [step]: txt })}
        onNext={handleNextStep}
      />
    );
  }

  if (view === "history") {
    return (
      <HistoryView
        cases={cases}
        saved={saved}
        reviewed={reviewed}
        openCase={openCase}
        toggleBookmark={toggleBookmark}
      />
    );
  }

  return (
    <HomeView
      cases={cases}
      themes={themes}
      query={query}
      setQuery={setQuery}
      filterLevel={filterLevel}
      setFilterLevel={setFilterLevel}
      saved={saved}
      openCase={openCase}
      toggleBookmark={toggleBookmark}
      goToHistory={() => setView("history")}
    />
  );
}
