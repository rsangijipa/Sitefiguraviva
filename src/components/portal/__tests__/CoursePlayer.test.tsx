import { fireEvent, render, screen, within } from "@testing-library/react";
import type { Block, Lesson, Module } from "@/types/lms";
import { CoursePlayer } from "../CoursePlayer";

jest.mock("@/actions/analytics", () => ({ trackEvent: jest.fn() }));
jest.mock("../../lms/VideoPlayer", () => ({
  VideoPlayer: ({ videoId }: { videoId: string }) => (
    <div data-testid="video-player">{videoId}</div>
  ),
}));
jest.mock("../../lms/BlockRenderer", () => ({
  BlockRenderer: ({ block }: { block: Block }) => (
    <div data-testid="lesson-block">{block.content.text}</div>
  ),
}));
jest.mock("../../SafeHtml", () => ({
  SafeHtml: ({ html }: { html: string }) => <div>{html}</div>,
}));

function setViewport(desktop: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: desktop,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
}

const block = (id: string, order: number, text: string, isPublished = true) =>
  ({ id, type: "text", order, content: { text }, isPublished }) as Block;

const lesson = (overrides: Partial<Lesson>): Lesson =>
  ({
    id: "l1",
    moduleId: "m1",
    courseId: "c1",
    title: "Aula de texto",
    order: 1,
    isPublished: true,
    type: "text",
    ...overrides,
  }) as Lesson;

function renderPlayer(active: Lesson, extra: Partial<Parameters<typeof CoursePlayer>[0]> = {}) {
  const second = lesson({ id: "l2", title: "Segunda aula", order: 2 });
  const modules = [
    { id: "m1", title: "Módulo 1", lessons: [active, second] },
  ] as unknown as Module[];
  const props = {
    course: { id: "c1", title: "Curso", backLink: "/portal/course/c1" },
    modules,
    activeLesson: active,
    onSelectLesson: jest.fn(),
    onMarkComplete: jest.fn(),
    nextLessonId: "l2",
    ...extra,
  };
  render(<CoursePlayer {...props} />);
  return props;
}

beforeEach(() => setViewport(false));

it("renders published content blocks in order for a text lesson, without a video frame", () => {
  renderPlayer(
    lesson({
      blocks: [
        block("b2", 2, "Segundo bloco"),
        block("b1", 1, "Primeiro bloco"),
        block("b3", 3, "Rascunho", false),
      ],
    }),
  );

  expect(
    screen.getAllByTestId("lesson-block").map((node) => node.textContent),
  ).toEqual(["Primeiro bloco", "Segundo bloco"]);
  expect(screen.queryByText("Vídeo indisponível")).not.toBeInTheDocument();
  expect(screen.queryByText(/12 de Jan/)).not.toBeInTheDocument();
  expect(screen.getByTestId("mark-lesson-complete")).toBeVisible();
});

it("plays a video lesson from any YouTube link shape and explains automatic completion", () => {
  renderPlayer(
    lesson({
      type: "video",
      videoUrl: "https://youtu.be/dQw4w9WgXcQ?t=42",
      duration: 25,
    }),
  );

  expect(screen.getByTestId("video-player")).toHaveTextContent("dQw4w9WgXcQ");
  expect(screen.getByText(/assiste a\s+90% do vídeo/)).toBeVisible();
  expect(
    within(screen.getByRole("article")).getByText("25 min"),
  ).toBeVisible();
  expect(screen.queryByTestId("mark-lesson-complete")).not.toBeInTheDocument();
});

it("keeps the unavailable notice for a video lesson without a link", () => {
  renderPlayer(lesson({ type: "video", videoUrl: "" }));
  expect(screen.getByText("Vídeo indisponível")).toBeVisible();
});

it("tells the student when a quiz lesson has no published assessment", () => {
  renderPlayer(lesson({ type: "quiz" }));
  expect(
    screen.getByText(/avaliação desta aula ainda não está disponível/),
  ).toBeVisible();
  expect(screen.queryByTestId("mark-lesson-complete")).not.toBeInTheDocument();
  expect(screen.queryByText(/ainda não foi publicado/)).not.toBeInTheDocument();
});

it("says when a lesson has no content yet", () => {
  renderPlayer(lesson({ description: "  ", blocks: [] }));
  expect(
    screen.getByText("O conteúdo desta aula ainda não foi publicado."),
  ).toBeVisible();
});

it("shows completion state and promotes the next lesson", () => {
  const props = renderPlayer(lesson({ isCompleted: true, description: "x" }));
  expect(screen.getByRole("status")).toHaveTextContent("Aula concluída");
  const nav = screen.getByRole("navigation", { name: "Navegação entre aulas" });
  fireEvent.click(within(nav).getByRole("button", { name: /Próxima aula/ }));
  expect(props.onSelectLesson).toHaveBeenCalledWith("l2");
});

it("keeps the next lesson closed and explains why when release rules hold it", () => {
  const props = renderPlayer(lesson({ description: "x" }), {
    nextLessonLockReason: "Disponível após concluir a aula anterior",
  });
  const nav = screen.getByRole("navigation", { name: "Navegação entre aulas" });
  const next = within(nav).getByRole("button", { name: /Próxima aula/ });
  expect(next).toBeDisabled();
  expect(next).toHaveAccessibleDescription("Disponível após concluir a aula anterior");
  fireEvent.click(next);
  expect(props.onSelectLesson).not.toHaveBeenCalled();
});

it("starts with the lesson list closed on phones and closes it after picking a lesson", () => {
  const props = renderPlayer(lesson({ description: "x" }));
  const toggle = screen.getByRole("button", { name: "Abrir lista de aulas" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(toggle);
  expect(
    screen.getByRole("button", { name: "Fechar lista de aulas" }),
  ).toHaveAttribute("aria-expanded", "true");

  fireEvent.click(screen.getByRole("button", { name: /Segunda aula/ }));
  expect(props.onSelectLesson).toHaveBeenCalledWith("l2");
  expect(
    screen.getByRole("button", { name: "Abrir lista de aulas" }),
  ).toHaveAttribute("aria-expanded", "false");
});

it("reports the list as open on desktop", () => {
  setViewport(true);
  renderPlayer(lesson({ description: "x" }));
  expect(
    screen.getByRole("button", { name: "Fechar lista de aulas" }),
  ).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.getByRole("button", { name: /Aula de texto, não concluída/ }),
  ).toHaveAttribute("aria-current", "page");
});
