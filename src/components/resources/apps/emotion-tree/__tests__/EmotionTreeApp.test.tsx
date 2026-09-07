import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { EmotionTreeApp } from "../EmotionTreeApp";

// jsdom has no WebGL. Keep the app, store, panels and loading flow real.
jest.mock("next/dynamic", () => () => {
  const React = require("react");
  return function TreeScene({ onSceneReady }: { onSceneReady: () => void }) {
    React.useEffect(() => { onSceneReady(); }, []);
    return null;
  };
});

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ quotes: [], favorites: [] }),
  });
});

it("offers the message action in the integrated emotion tree without the old XP interface", async () => {
  render(<EmotionTreeApp />);

  expect(screen.getByRole("region", { name: "Árvore das Emoções" })).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText("Carregando frases...")).not.toBeInTheDocument());
  expect(screen.getByRole("button", { name: "Receber mensagem" })).toBeInTheDocument();
  expect(screen.queryByText(/\bXP\b|nível\s*\d/i)).not.toBeInTheDocument();
});
