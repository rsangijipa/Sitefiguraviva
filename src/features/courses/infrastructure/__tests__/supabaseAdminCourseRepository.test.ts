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

const mediator = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Ana",
  role: "Psicóloga",
  image: "/ana.jpg",
  bio: "Formação clínica.\n\nExperiência docente.",
};
it("persists mediator references without copying profiles or changing course permissions", async () => {
  await createAdminCourse({
    title: "Curso",
    mediators: [mediator],
    details: { syllabus: ["Tema"] },
  });
  expect(query.insert).toHaveBeenCalledWith(
    expect.objectContaining({
      details: { syllabus: ["Tema"], mediatorIds: [mediator.id] },
      team: {},
    }),
  );
  expect(
    query.insert.mock.calls[0][0].legacy_payload.mediators,
  ).toBeUndefined();
});
it("updates mediator references and preserves unrelated course details", async () => {
  await updateAdminCourse("course", { mediators: [mediator] });
  expect(query.update).toHaveBeenCalledWith(
    expect.objectContaining({
      details: { syllabus: ["Tema"], mediatorIds: [mediator.id] },
    }),
  );
  expect(query.update.mock.calls[0][0]).not.toHaveProperty("team");
});
it("allows removing all mediators and rejects unregistered profiles", async () => {
  await updateAdminCourse("course", { mediators: [] });
  expect(query.update).toHaveBeenCalledWith(
    expect.objectContaining({
      details: { syllabus: ["Tema"], mediatorIds: [] },
    }),
  );
  await expect(
    createAdminCourse({
      mediators: [{ name: "Ana", role: "", image: "", bio: "" }],
    }),
  ).rejects.toThrow();
});
it("restores legacy mediator curricula and photos into the course editor", async () => {
  query.maybeSingle.mockResolvedValue({
    data: {
      id: "course",
      title: "Curso",
      details: {},
      team: { tutor: { role: "tutor" } },
      legacy_payload: { mediators: [mediator] },
    },
    error: null,
  });
  expect(await getAdminCourse("course")).toMatchObject({
    mediators: [mediator],
    team: { tutor: { role: "tutor" } },
  });
});

it("rejects saving an embedded profile without a registry ID", async () => {
  await expect(
    updateAdminCourse("course", {
      mediators: [{ name: "Ana", role: "", image: "/new.webp", bio: "" }],
    }),
  ).rejects.toThrow("Selecione mediadores cadastrados");
  expect(query.update).not.toHaveBeenCalled();
});

it("persists commercial schedule and restores canonical frequency over legacy data", async () => {
  await createAdminCourse({
    frequency: "Quinzenal",
    date: "A confirmar",
    location: "Online",
    workload: 120,
    syllabus: ["Tema"],
  });
  expect(query.insert).toHaveBeenCalledWith(
    expect.objectContaining({
      workload_minutes: 120,
      details: expect.objectContaining({
        frequency: "Quinzenal",
        date: "A confirmar",
        location: "Online",
        syllabus: ["Tema"],
      }),
    }),
  );
  query.maybeSingle.mockResolvedValue({
    data: {
      id: "course",
      details: { frequency: "Atual" },
      legacy_payload: { frequency: "Antiga" },
    },
    error: null,
  });
  expect(await getAdminCourse("course")).toMatchObject({ frequency: "Atual" });
});
it("preserves existing details when updating only frequency or syllabus", async () => {
  query.maybeSingle.mockResolvedValue({
    data: {
      id: "course",
      details: { date: "Data existente", mediators: [mediator] },
    },
    error: null,
  });
  await updateAdminCourse("course", {
    frequency: "Mensal",
    syllabus: ["Novo"],
  });
  expect(query.update).toHaveBeenCalledWith(
    expect.objectContaining({
      details: expect.objectContaining({
        date: "Data existente",
        mediators: [mediator],
        frequency: "Mensal",
        syllabus: ["Novo"],
      }),
    }),
  );
});
it("rejects nonintegral workloads", async () => {
  await expect(createAdminCourse({ workload: 1.5 })).rejects.toThrow(
    "carga horária",
  );
  expect(query.insert).not.toHaveBeenCalled();
});
