import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CourseCommunity from "@/components/community/CourseCommunity";
import { useCommunityRealtime } from "@/hooks/useCommunityRealtime";
import { communityService } from "@/services/communityService";
import { CommunityThreadDoc } from "@/types/lms";

jest.mock("@/hooks/useCommunityRealtime", () => ({
  useCommunityRealtime: jest.fn(),
}));

jest.mock("@/services/communityService", () => ({
  communityService: {
    createThread: jest.fn(),
  },
}));

jest.mock("@/components/community/ThreadView", () => {
  return function MockThreadView() {
    return <div data-testid="thread-view">thread-view</div>;
  };
});

const asTimestamp = (iso: string) => ({
  toDate: () => new Date(iso),
});

const makeThread = (
  id: string,
  title: string,
  overrides: Partial<CommunityThreadDoc> = {},
): CommunityThreadDoc =>
  ({
    id,
    courseId: "course-1",
    title,
    content: `content-${id}`,
    authorId: `author-${id}`,
    authorName: `Author ${id}`,
    authorAvatar: "",
    replyCount: 0,
    likeCount: 0,
    viewCount: 0,
    isPinned: false,
    isLocked: false,
    lastReplyAt: asTimestamp("2026-03-01T00:00:00.000Z") as any,
    createdAt: asTimestamp("2026-02-01T00:00:00.000Z") as any,
    updatedAt: asTimestamp("2026-03-01T00:00:00.000Z") as any,
    ...overrides,
  }) as CommunityThreadDoc;

describe("CourseCommunity", () => {
  const mockUseCommunityRealtime = useCommunityRealtime as jest.Mock;
  const mockCreateThread = communityService.createThread as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    mockUseCommunityRealtime.mockReturnValue({
      threads: [],
      loading: true,
    });

    render(
      <CourseCommunity
        courseId="course-1"
        user={{ uid: "u1", displayName: "User 1" }}
      />,
    );

    expect(screen.getByText("Carregando discussoes...")).toBeInTheDocument();
  });

  it("filters threads by search and pinned flag, then clears filters", () => {
    mockUseCommunityRealtime.mockReturnValue({
      loading: false,
      threads: [
        makeThread("1", "Duvida sobre modulo 1", { isPinned: true }),
        makeThread("2", "Projeto final"),
        makeThread("3", "Checklist semanal"),
      ],
    });

    render(
      <CourseCommunity
        courseId="course-1"
        user={{ uid: "u1", displayName: "User 1" }}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Buscar por titulo, conteudo ou autor"),
      { target: { value: "projeto" } },
    );

    expect(screen.getByText("Projeto final")).toBeInTheDocument();
    expect(screen.queryByText("Checklist semanal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Apenas Fixados"));

    expect(screen.getByText("Nenhum topico encontrado")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Limpar filtros"));

    expect(screen.getByText("Projeto final")).toBeInTheDocument();
    expect(screen.getByText("Checklist semanal")).toBeInTheDocument();
  });

  it("sorts threads by reply count when selecting 'Mais Respondidos'", () => {
    mockUseCommunityRealtime.mockReturnValue({
      loading: false,
      threads: [
        makeThread("1", "Topico A", { replyCount: 1 }),
        makeThread("2", "Topico B", { replyCount: 8 }),
        makeThread("3", "Topico C", { replyCount: 3 }),
      ],
    });

    const { container } = render(
      <CourseCommunity
        courseId="course-1"
        user={{ uid: "u1", displayName: "User 1" }}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Mais Recentes"), {
      target: { value: "most_replied" },
    });

    const orderedTitles = Array.from(container.querySelectorAll("h4")).map(
      (el) => el.textContent,
    );

    expect(orderedTitles).toEqual(["Topico B", "Topico C", "Topico A"]);
  });

  it("creates a new thread from create form", async () => {
    mockUseCommunityRealtime.mockReturnValue({
      loading: false,
      threads: [],
    });
    mockCreateThread.mockResolvedValue("new-thread-id");

    const user = { uid: "u1", displayName: "User 1", photoURL: "avatar.jpg" };

    render(<CourseCommunity courseId="course-1" user={user} />);

    fireEvent.click(screen.getByText("Nova Pergunta"));
    fireEvent.change(screen.getByLabelText("Titulo"), {
      target: { value: "Minha pergunta" },
    });
    fireEvent.change(screen.getByLabelText("Conteudo"), {
      target: { value: "Descricao detalhada" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Publicar Topico" }));

    await waitFor(() => {
      expect(mockCreateThread).toHaveBeenCalledWith(
        "course-1",
        user,
        "Minha pergunta",
        "Descricao detalhada",
      );
    });
  });
});
