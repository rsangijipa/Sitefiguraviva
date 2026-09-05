import { PUBLIC_NAV_ITEMS } from "../content/navigation";

describe("public navigation", () => {
  it("points every primary item to a canonical page", () => {
    expect(PUBLIC_NAV_ITEMS).toEqual([
      { label: "Instituto", href: "/instituto" },
      { label: "Formações", href: "/formacoes" },
      { label: "Recursos", href: "/recursos" },
      { label: "Biblioteca", href: "/public-library" },
      { label: "Galeria", href: "/public-gallery" },
      { label: "Blog", href: "/blog" },
    ]);
  });
});
