jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
jest.mock("@/infrastructure/supabase/storage.server", () => ({
  deleteStorageObject: jest.fn(),
}));
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  createAdminCourse,
  getAdminCourse,
  updateAdminCourse,
} from "../supabaseAdminCourseRepository.server";
const query = {
  insert: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  update: jest.fn(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
};
beforeEach(() => {
  jest.clearAllMocks();
  for (const name of ["insert", "select", "eq", "update"] as const)
    query[name].mockReturnValue(query);
  query.single.mockResolvedValue({ data: { id: "course" }, error: null });
  query.maybeSingle.mockResolvedValue({
    data: {
      id: "course",
      title: "Oferta",
      pix_price_cents: 25000,
      total_price_cents: 100000,
      installment_count: 4,
      details: { syllabus: ["Tema"] },
    },
    error: null,
  });
  jest
    .mocked(createSupabaseServiceClient)
    .mockReturnValue({ from: jest.fn().mockReturnValue(query) } as any);
});
it("persists commercial values and restores them for the editor", async () => {
  await createAdminCourse({
    title: "Oferta",
    totalPriceCents: 100000,
    installments: 4,
    pixPriceCents: 25000,
  });
  expect(query.insert).toHaveBeenCalledWith(
    expect.objectContaining({
      total_price_cents: 100000,
      installment_count: 4,
      pix_price_cents: 25000,
    }),
  );
  expect(await getAdminCourse("course")).toMatchObject({
    totalPriceCents: 100000,
    installments: 4,
    pixPriceCents: 25000,
    syllabus: ["Tema"],
  });
});
it("allows clearing total price without clearing the initial charge accidentally", async () => {
  await updateAdminCourse("course", { totalPriceCents: null });
  expect(query.update).toHaveBeenCalledWith(
    expect.objectContaining({ total_price_cents: null }),
  );
  expect(query.update.mock.calls[0][0]).not.toHaveProperty("pix_price_cents");
});
it("rejects invalid fields and missing course updates", async () => {
  await expect(createAdminCourse({ installments: 1.5 })).rejects.toThrow();
  expect(query.insert).not.toHaveBeenCalled();
  query.maybeSingle.mockResolvedValue({ data: null, error: null });
  await expect(
    updateAdminCourse("missing", { totalPriceCents: 100 }),
  ).rejects.toThrow("Curso não encontrado");
});

it("preserves a historical syllabus when normalized details are not yet filled", async () => {
  query.maybeSingle.mockResolvedValue({
    data: {
      id: "course",
      title: "Oferta",
      details: {},
      legacy_payload: { syllabus: ["Tema histórico"] },
    },
    error: null,
  });
  expect(await getAdminCourse("course")).toMatchObject({
    syllabus: ["Tema histórico"],
  });
});
