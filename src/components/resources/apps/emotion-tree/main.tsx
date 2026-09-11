import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EmotionTreeApp } from "./EmotionTreeApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EmotionTreeApp />
  </StrictMode>,
);
