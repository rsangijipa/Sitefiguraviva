import { createPost } from "@/actions/community";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/auth/server", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));

describe("community server actions", () => {
  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockMaybeSingle = jest.fn();

  const mockSupabase = {
    from: jest.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        };
      }
      if (table === "community_threads") {
        return {
          insert: mockInsert,
        };
      }
      return {};
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServiceClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("returns Unauthorized when user has no session", async () => {
    (verifySession as jest.Mock).mockResolvedValue(null);

    const res = await createPost({
      title: "Test Title",
      content: "Test Content",
      channel: "questions",
    });

    expect(res).toEqual({ error: "Unauthorized" });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("successfully creates a post when user is authenticated", async () => {
    (verifySession as jest.Mock).mockResolvedValue({
      uid: "user-abc",
      email: "test@example.com",
      role: "student",
      isAdmin: false,
    });

    mockMaybeSingle.mockResolvedValue({
      data: { display_name: "John Doe", photo_url: "https://avatar.png", role: "student" },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });

    const res = await createPost({
      title: "How to draw gestures?",
      content: "Looking for tips...",
      channel: "questions",
    });

    expect(res).toEqual(expect.objectContaining({ success: true }));
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        course_id: "questions",
        author_id: "user-abc",
        title: "How to draw gestures?",
        content: "Looking for tips...",
        author_name: "John Doe",
        author_avatar_url: "https://avatar.png",
      }),
    );
  });
});
