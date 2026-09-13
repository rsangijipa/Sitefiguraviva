import { PUBLIC_NAV_ITEMS } from "../content/navigation";

describe("public navigation", () => {
  it("points every primary item to a canonical page", () => {
    expect(
      PUBLIC_NAV_ITEMS.map(({ label, href }) => ({ label, href })),
    ).toEqual([
      { label: "Instituto", href: "/instituto" },
      { label: "Fundadora", href: "/instituto/fundadora" },
      { label: "Laura Perls", href: "/instituto/laura-perls" },
      { label: "Formações", href: "/formacoes" },
      { label: "Biblioteca", href: "/public-library" },
      { label: "Galeria", href: "/public-gallery" },
      { label: "Blog", href: "/blog" },
      { label: "Recursos", href: "/recursos" },
    ]);
  });
});
