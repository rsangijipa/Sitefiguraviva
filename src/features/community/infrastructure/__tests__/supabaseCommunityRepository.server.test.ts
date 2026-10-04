import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createSupabaseChainMock } from "@/test-utils/supabaseMock";

const from = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ from }),
}));

import {
  createReply,
  listCourseThreads,
} from "../supabaseCommunityRepository.server";

describe("supabaseCommunityRepository", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("lists course threads ordered by pin state and recency", async () => {
    const rows = [
      {
        id: "thread-1",
        course_id: "co-visar",
        author_id: "user-1",
        legacy_author_firebase_uid: null,
        title: "First",
        content: "Hello",
        author_name: "Ana",
        author_avatar_url: null,
        reply_count: 3,
        like_count: 4,
        view_count: 5,
        is_pinned: true,
        is_locked: false,
        is_deleted: false,
        last_reply_at: "2026-09-06T10:00:00.000Z",
        created_at: "2026-09-05T10:00:00.000Z",
        updated_at: "2026-09-06T10:00:00.000Z",
      },
    ];
    const chain = createSupabaseChainMock({ data: rows });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(listCourseThreads("co-visar", 10, client)).resolves.toEqual([
      expect.objectContaining({
        id: "thread-1",
        courseId: "co-visar",
        authorId: "user-1",
        createdAt: "2026-09-05T10:00:00.000Z",
      }),
    ]);

    expect(from).toHaveBeenCalledWith("community_threads");
    expect(chain.eq).toHaveBeenCalledWith("course_id", "co-visar");
    expect(chain.order).toHaveBeenCalledWith("is_pinned", { ascending: false });
  });

  it("creates a reply and bumps the thread counters", async () => {
    const replyInsert = createSupabaseChainMock({ data: { id: "reply-1" } });
    const threadUpdate = createSupabaseChainMock({ data: null });
    from.mockImplementation((table) => {
      if (table === "community_replies") return replyInsert;
      if (table === "community_threads") return threadUpdate;
      throw new Error(`unexpected table ${table}`);
    });

    const client = { from } as any;

    await expect(
      createReply(
        "co-visar",
        "thread-1",
        {
          uid: "user-1",
          displayName: "Ana",
        },
        "Nice",
        client,
      ),
    ).resolves.toEqual(expect.any(String));

    expect(from).toHaveBeenCalledWith("community_replies");
    expect(from).toHaveBeenCalledWith("community_threads");
  });
});
