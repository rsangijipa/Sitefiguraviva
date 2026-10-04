import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createSupabaseChainMock } from "@/test-utils/supabaseMock";

const from = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ from }),
}));

import {
  getUnreadCount,
  markAllAsRead,
} from "../supabaseNotificationRepository.server";

describe("supabaseNotificationRepository", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("counts unread notifications", async () => {
    const chain = createSupabaseChainMock({ count: 2 });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(getUnreadCount("user-1", client)).resolves.toBe(2);
    expect(from).toHaveBeenCalledWith("notifications");
  });

  it("marks all unread notifications as read", async () => {
    const chain = createSupabaseChainMock({ data: [] });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(markAllAsRead("user-1", client)).resolves.toBeUndefined();
    expect(chain.update).toHaveBeenCalled();
  });
});
