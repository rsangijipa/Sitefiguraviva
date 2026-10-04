import { renderToStaticMarkup } from "react-dom/server";
import JsonLd from "../JsonLd";

describe("JSON-LD embedded in HTML", () => {
  it("keeps hostile content inside the data script without creating executable elements", () => {
    const data = {
      "@type": "Course",
      name: '</script><img src=x onerror="alert(1)"><script>alert(2)</script>',
      description: "Formação, cuidado & reflexão <com segurança>",
    };
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(<JsonLd data={data} />);

    expect(container.querySelectorAll("script")).toHaveLength(1);
    expect(container.querySelector("img")).toBeNull();
    const script = container.querySelector("script")!;
    expect(script.type).toBe("application/ld+json");
    expect(JSON.parse(script.textContent!)).toEqual(data);
  });

  it("does not emit a data script for an undefined value", () => {
    expect(renderToStaticMarkup(<JsonLd data={undefined} />)).toBe("");
  });
});
