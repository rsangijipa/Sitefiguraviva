import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import type { ViewMode } from "./types";

function StandaloneApp() {
  const [activeSection, setActiveSection] = useState<ViewMode>("home");
  return (
    <App activeSection={activeSection} onSectionChange={setActiveSection} />
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");

createRoot(root).render(
  <StrictMode>
    <StandaloneApp />
  </StrictMode>,
);
