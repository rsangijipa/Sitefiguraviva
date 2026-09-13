import { fireEvent, render, screen } from "@testing-library/react";
import { PauseCompletion } from "./PauseCompletion";
import type { PausePracticeConfig } from "../types";

const practice: PausePracticeConfig = {
  id: "breathing",
  title: "Acompanhar a respiração",
  description: "Perceba o ar entrando e saindo.",
  iconComponent: () => null,
  durations: [1, 2],
  defaultDuration: 120,
  capabilities: { audio: false, motion: true, static: true },
};

describe("PauseCompletion", () => {
  it("requires an explicit local-storage choice before saving", () => {
    const onSave = jest.fn();
    const onLocalPersistenceChange = jest.fn();

    render(
      <PauseCompletion
        practice={practice}
        duration={2}
        activeDuration={120}
        endedBy="timer"
        reflection=""
        onReflectionChange={jest.fn()}
        localPersistenceEnabled={false}
        onLocalPersistenceChange={onLocalPersistenceChange}
        onSave={onSave}
        onReturn={jest.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", {
      name: "Guardar neste dispositivo",
    });
    expect(saveButton).toBeDisabled();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Guardar esta pausa neste dispositivo",
      }),
    );
    expect(onLocalPersistenceChange).toHaveBeenCalledWith(true);
    expect(onSave).not.toHaveBeenCalled();
  });
});
