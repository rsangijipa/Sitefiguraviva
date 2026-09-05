import { render, screen } from "@testing-library/react";

import { AwarenessTreeExperience } from "../components/AwarenessTreeExperience";

describe("AwarenessTreeExperience", () => {
  it("offers the emotional themes when WebGL is unavailable", () => {
    render(<AwarenessTreeExperience supportsWebGL={false} />);

    expect(
      screen.getByRole("heading", { name: /árvore da consciência/i }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /acolhimento/i })).toBeVisible();
    expect(screen.getByText(/experiência visual indisponível/i)).toBeVisible();
  });
});
