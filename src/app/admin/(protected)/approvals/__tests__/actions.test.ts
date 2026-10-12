const requireAdmin = jest.fn();
const rpc = jest.fn();
const mockGetUserById = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/auth/server", () => ({
  requireAdmin: () => requireAdmin(),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc,
    auth: {
      admin: {
        getUserById: mockGetUserById,
      },
    },
    from: mockFrom,
  }),
}));
jest.mock("@/app/actions/admin/enrollment", () => ({
  approveEnrollment: jest.fn(),
}));
jest.mock("@/app/actions/enrollment-pix", () => ({
  rejectPixEnrollment: jest.fn(),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { reviewRegistration, getPendingEnrollmentsAction } from "../actions";

describe("reviewRegistration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdmin.mockResolvedValue({ uid: "admin-1" });
    rpc.mockResolvedValue({ data: { approved: true }, error: null });
  });

  it("binds the decision to the authenticated administrator", async () => {
    expect(await reviewRegistration("student-1", true)).toEqual({
      success: true,
    });
    expect(rpc).toHaveBeenCalledWith("review_pending_registration", {
      p_actor: "admin-1",
      p_target: "student-1",
      p_approve: true,
    });
  });

  it("refuses approval when email is not confirmed in backend", async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "Email not confirmed (SQLSTATE 22023)" },
    });

    const result = await reviewRegistration("student-1", true);
    expect(result).toEqual({
      success: false,
      error: "Não é possível aprovar um cadastro com e-mail não confirmado.",
    });
  });

  it("rejects invalid decisions and unauthorized callers before mutation", async () => {
    requireAdmin.mockRejectedValueOnce(new Error("denied"));
    expect(await reviewRegistration("student-1", true)).toMatchObject({
      success: false,
    });
    expect(rpc).not.toHaveBeenCalled();

    requireAdmin.mockResolvedValue({ uid: "admin-1" });
    expect(await reviewRegistration("", true)).toMatchObject({
      success: false,
    });
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("getPendingEnrollmentsAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requireAdmin.mockResolvedValue({ uid: "admin-1" });

    mockFrom.mockImplementation((table: string) => {
      if (table === "enrollments") {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [],
                error: null,
              }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "user-unconfirmed",
                      email: "novo@example.com",
                      display_name: "Novo Aluno",
                      phone_number: "11999999999",
                      created_at: "2026-10-12T10:00:00Z",
                    },
                    {
                      id: "user-confirmed",
                      email: "confirmado@example.com",
                      display_name: "Aluno Confirmado",
                      phone_number: "11888888888",
                      created_at: "2026-10-12T11:00:00Z",
                    },
                  ],
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "courses") {
        return {
          select: () =>
            Promise.resolve({
              data: [
                { id: "gestalt-101", title: "Gestalt-terapia Básica" },
              ],
              error: null,
            }),
        };
      }
      return { select: () => Promise.resolve({ data: [], error: null }) };
    });

    mockGetUserById.mockImplementation((id: string) => {
      if (id === "user-confirmed") {
        return Promise.resolve({
          data: {
            user: {
              id: "user-confirmed",
              email_confirmed_at: "2026-10-12T11:05:00Z",
              user_metadata: { course_interest: "gestalt-101" },
            },
          },
          error: null,
        });
      }
      return Promise.resolve({
        data: {
          user: {
            id: "user-unconfirmed",
            email_confirmed_at: null,
            user_metadata: { course_interest: "gestalt-101" },
          },
        },
        error: null,
      });
    });
  });

  it("enriches pending registrations with email_confirmed flag and course interest", async () => {
    const result = await getPendingEnrollmentsAction();
    expect(result.success).toBe(true);
    expect(result.registrations).toHaveLength(2);

    const unconfirmed = result.registrations.find(
      (r: any) => r.id === "user-unconfirmed",
    );
    expect(unconfirmed).toMatchObject({
      email_confirmed: false,
      course_interest: "gestalt-101",
      course_title: "Gestalt-terapia Básica",
    });

    const confirmed = result.registrations.find(
      (r: any) => r.id === "user-confirmed",
    );
    expect(confirmed).toMatchObject({
      email_confirmed: true,
      course_interest: "gestalt-101",
      course_title: "Gestalt-terapia Básica",
    });
  });
});
