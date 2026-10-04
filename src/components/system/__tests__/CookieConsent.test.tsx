import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import CookieConsent from "../CookieConsent";

describe("CookieConsent", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-cookie-consent");
  });

  it("coordinates unresolved consent with floating controls", async () => {
    const secondaryControl = document.createElement("button");
    secondaryControl.dataset.secondaryFloatingControl = "true";
    document.body.appendChild(secondaryControl);

    render(<CookieConsent />);

    await waitFor(() =>
      expect(document.documentElement).toHaveAttribute(
        "data-cookie-consent",
        "pending",
      ),
    );
    expect(secondaryControl).toHaveAttribute("hidden");
    expect(screen.getByRole("button", { name: "Recusar" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Aceitar" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Recusar" }));

    await waitFor(() =>
      expect(document.documentElement).toHaveAttribute(
        "data-cookie-consent",
        "resolved",
      ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(secondaryControl).not.toHaveAttribute("hidden");
  });

  it("resolves after consent is accepted", async () => {
    render(<CookieConsent />);

    const accept = await screen.findByRole("button", { name: "Aceitar" });
    fireEvent.click(accept);

    await waitFor(() =>
      expect(document.documentElement).toHaveAttribute(
        "data-cookie-consent",
        "resolved",
      ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
