jest.mock("@/lib/auth/server", () => ({ requireAdmin: jest.fn() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  listMediatorsAction,
  saveMediatorAction,
  deleteMediatorAction,
} from "../mediators";

const id = "00000000-0000-4000-8000-000000000001";
const profile = {
  name: "Ana",
  role: "Psicóloga",
  image: "/ana.jpg",
  bio: "Currículo",
};
const query = {
  select: jest.fn(),
  order: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(requireAdmin).mockResolvedValue({ uid: "admin" } as never);
  for (const key of ["select", "insert", "update", "delete", "eq"] as const)
    query[key].mockReturnValue(query);
  query.single.mockResolvedValue({ data: { id }, error: null });
  query.maybeSingle.mockResolvedValue({ data: { id }, error: null });
  jest
    .mocked(createSupabaseServiceClient)
    .mockReturnValue({ from: jest.fn().mockReturnValue(query) } as never);
});
it("requires an admin before any read or write", async () => {
  jest.mocked(requireAdmin).mockRejectedValue(new Error("Forbidden"));
  await expect(listMediatorsAction()).rejects.toThrow("Forbidden");
  await expect(saveMediatorAction(profile)).rejects.toThrow("Forbidden");
  await expect(deleteMediatorAction(id)).rejects.toThrow("Forbidden");
  expect(createSupabaseServiceClient).not.toHaveBeenCalled();
});
it("validates names and URLs and persists only profile fields", async () => {
  await expect(saveMediatorAction({ ...profile, name: " " })).rejects.toThrow();
  await expect(
    saveMediatorAction({ ...profile, image: "javascript:alert(1)" }),
  ).rejects.toThrow();
  expect(query.insert).not.toHaveBeenCalled();
  await saveMediatorAction({ ...profile, id });
  expect(query.update).toHaveBeenCalledWith(profile);
  expect(query.eq).toHaveBeenCalledWith("id", id);
});
it("shows a safe duplicate-name error and preserves linked profiles", async () => {
  query.single.mockResolvedValueOnce({ data: null, error: { code: "23505" } });
  await expect(saveMediatorAction(profile)).rejects.toThrow(
    "já está cadastrado",
  );
  query.maybeSingle.mockResolvedValueOnce({
    data: null,
    error: { code: "23503" },
  });
  await expect(deleteMediatorAction(id)).rejects.toThrow("Desvincule");
});
it("orders names using Portuguese collation", async () => {
  query.order.mockResolvedValue({
    data: [
      { ...profile, name: "Zélia" },
      { ...profile, name: "Ána" },
    ],
    error: null,
  });
  expect((await listMediatorsAction()).map((member) => member.name)).toEqual([
    "Ána",
    "Zélia",
  ]);
});
