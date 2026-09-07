import { fireEvent, render, screen } from "@testing-library/react";

import { GalleryImage } from "../GalleryImage";
import { normalizeGalleryMedia } from "../gallery-media";

describe("gallery media", () => {
  it("uses the valid src before the fallback", () => {
    expect(
      normalizeGalleryMedia({
        src: "https://example.com/a.jpg",
        title: "A",
      }).src,
    ).toBe("https://example.com/a.jpg");
  });

  it("rejects unsupported media protocols", () => {
    expect(
      normalizeGalleryMedia({ src: "javascript:alert(1)", title: "A" }).src,
    ).toBe("/assets/fv/placeholders/gallery.webp");
  });

  it("replaces a failed image with a named placeholder", () => {
    render(
      <GalleryImage src="https://example.com/missing.jpg" alt="Encontro" />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Encontro" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Imagem indisponível: Encontro",
    );
  });
});
