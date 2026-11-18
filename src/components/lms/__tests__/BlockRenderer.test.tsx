import { render, screen } from "@testing-library/react";
import type { Block } from "@/types/lms";
import { BlockRenderer } from "../BlockRenderer";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));
jest.mock("../VideoPlayer", () => ({
  VideoPlayer: ({ videoId }: { videoId: string }) => (
    <div data-testid="video-player">{videoId}</div>
  ),
}));

const block = (type: Block["type"], content: Block["content"], title?: string) =>
  ({ id: "b1", type, order: 1, title, content, isPublished: true }) as Block;

it("tracks video blocks with a parsed YouTube id, ignoring timestamp params", () => {
  render(
    <BlockRenderer
      block={block("video", {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s",
      })}
      courseId="c1"
      moduleId="m1"
      lessonId="l1"
    />,
  );
  expect(screen.getByTestId("video-player")).toHaveTextContent("dQw4w9WgXcQ");
});

it("shows a Portuguese notice instead of the raw link for an unsupported video", () => {
  render(<BlockRenderer block={block("video", { url: "https://vimeo.com/1" })} />);
  expect(screen.getByRole("note")).toHaveTextContent(
    "Este vídeo não pôde ser exibido",
  );
  expect(screen.queryByText(/vimeo/)).not.toBeInTheDocument();
});

it("renders safe file and link blocks with a new-tab hint", () => {
  render(
    <>
      <BlockRenderer
        block={block("pdf", { url: "https://example.com/apostila.pdf" }, "Apostila")}
      />
      <BlockRenderer
        block={block("link", { url: "https://example.com/" }, "Leitura")}
      />
    </>,
  );
  expect(screen.getByRole("link", { name: /Apostila/ })).toHaveAttribute(
    "href",
    "https://example.com/apostila.pdf",
  );
  expect(screen.getByRole("link", { name: /Leitura \(abre em nova aba\)/ }))
    .toHaveAttribute("href", "https://example.com/");
});

it.each([["pdf"], ["file"], ["link"]] as const)(
  "drops %s blocks whose URL is not http(s)",
  (type) => {
    const { container } = render(
      <BlockRenderer block={block(type, { url: "javascript:alert(1)" }, "X")} />,
    );
    expect(container).toBeEmptyDOMElement();
  },
);

it("does not load images from unsafe URLs", () => {
  render(
    <BlockRenderer
      block={block("image", { url: "javascript:alert(1)" }, "Imagem")}
    />,
  );
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
