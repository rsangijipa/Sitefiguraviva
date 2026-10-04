import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createSupabaseChainMock } from "@/test-utils/supabaseMock";

const from = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ from }),
}));

import {
  getCertificate,
  getUserCertificates,
} from "../supabaseCertificateRepository.server";

describe("supabaseCertificateRepository", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("loads a certificate for a course", async () => {
    const chain = createSupabaseChainMock({
      data: [
        {
          id: "cert-1",
          user_id: "user-1",
          legacy_firebase_uid: null,
          course_id: "co-visar",
          code: "FV-2026-0001",
          issued_at: "2026-09-06T10:00:00.000Z",
          metadata: {},
          legacy_payload: {},
        },
      ],
    });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(getCertificate("user-1", "co-visar", client)).resolves.toEqual(
      expect.objectContaining({ id: "cert-1", courseId: "co-visar" }),
    );
  });

  it("lists all certificates for a user", async () => {
    const chain = createSupabaseChainMock({
      data: [
        {
          id: "cert-1",
          user_id: "user-1",
          legacy_firebase_uid: null,
          course_id: "co-visar",
          code: "FV-2026-0001",
          issued_at: "2026-09-06T10:00:00.000Z",
          metadata: {},
          legacy_payload: {},
        },
      ],
    });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(getUserCertificates("user-1", client)).resolves.toEqual([
      expect.objectContaining({ id: "cert-1", userId: "user-1" }),
    ]);
  });
});
