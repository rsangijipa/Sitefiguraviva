jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import {
  getPublicPageContent,
  getPublishedCourseByField,
  listContent,
  listPublishedContent,
  listPublishedCourses,
  mapPublicCourse,
  mapPublicPost,
} from "../supabaseContentRepository";

const mockedCreateSupabaseBrowserClient = jest.mocked(
  createSupabaseBrowserClient,
);

function queryResult(data: unknown) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    in: jest.fn(),
    order: jest.fn(),
    maybeSingle: jest.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.order.mockResolvedValue({ data, error: null });
  query.maybeSingle.mockResolvedValue({ data, error: null });

  return query;
}

describe("Supabase public content repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns published open and closed courses mapped to the public shape", async () => {
    const coursesQuery = queryResult([
      {
        id: "co-visar",
        title: "Supervisão Clínica: CO-VISAR",
        subtitle: null,
        slug: "co-visar",
        description: "Supervisão clínica",
        cover_image_url: null,
        image_url: null,
        thumbnail_url: null,
        instructor_name: null,
        instructor_title: null,
        workload_minutes: null,
        duration_label: null,
        level: null,
        category: "Curso",
        is_published: true,
        status: "open",
        content_revision: 1,
        billing_type: "free",
        stripe_price_id: null,
        stripe_product_id: null,
        tags: [],
        details: {},
        team: {},
        stats: {},
        community_enabled: false,
        certificate_rules: {},
        legacy_payload: { image: "/legacy-course.jpg" },
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);
    const from = jest.fn().mockReturnValue(coursesQuery);
    mockedCreateSupabaseBrowserClient.mockReturnValue({
      from,
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    expect(await listPublishedCourses()).toEqual([
      expect.objectContaining({
        id: "co-visar",
        image: "/legacy-course.jpg",
        isPublished: true,
      }),
    ]);
    expect(from).toHaveBeenCalledWith("courses");
    expect(coursesQuery.eq).toHaveBeenNthCalledWith(1, "is_published", true);
    expect(coursesQuery.in).toHaveBeenCalledWith("status", ["open", "closed"]);
  });

  it("puts the normalized cover first and de-duplicates legacy gallery images", async () => {
    const normalizedCover =
      "https://project.supabase.co/storage/v1/object/public/course-assets/courses/co-visar/capa.jpeg";
    const coursesQuery = queryResult([
      {
        id: "co-visar",
        title: "Supervisão Clínica: CO-VISAR",
        subtitle: null,
        slug: "co-visar",
        description: "Supervisão clínica",
        cover_image_url: normalizedCover,
        image_url: normalizedCover,
        thumbnail_url: normalizedCover,
        instructor_name: null,
        instructor_title: null,
        workload_minutes: null,
        duration_label: null,
        level: null,
        category: "Curso",
        is_published: true,
        status: "open",
        content_revision: 1,
        billing_type: "free",
        stripe_price_id: null,
        stripe_product_id: null,
        tags: [],
        details: {},
        team: {},
        stats: {},
        community_enabled: false,
        certificate_rules: {},
        legacy_payload: {
          images: ["/legacy-gallery.jpg", normalizedCover],
        },
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mockedCreateSupabaseBrowserClient.mockReturnValue({
      from: jest.fn().mockReturnValue(coursesQuery),
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    await expect(listPublishedCourses()).resolves.toEqual([
      expect.objectContaining({
        image: normalizedCover,
        images: [normalizedCover, "/legacy-gallery.jpg"],
      }),
    ]);
  });

  it("returns the published page payload without CMS metadata", async () => {
    const pageQuery = queryResult({
      content: { heroTitle: "Figura Viva" },
    });
    const from = jest.fn().mockReturnValue(pageQuery);
    mockedCreateSupabaseBrowserClient.mockReturnValue({
      from,
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    expect(await getPublicPageContent("home")).toEqual({
      heroTitle: "Figura Viva",
    });
    expect(from).toHaveBeenCalledWith("public_pages");
    expect(pageQuery.eq).toHaveBeenNthCalledWith(1, "key", "home");
    expect(pageQuery.eq).toHaveBeenNthCalledWith(2, "is_published", true);
  });

  it("maps published posts and keeps the legacy image field stable", async () => {
    const postsQuery = queryResult([
      {
        id: "reflection-1",
        title: "Presença",
        slug: "presenca",
        subtitle: null,
        excerpt: "Uma reflexão",
        content: "Texto",
        type: "article",
        image_url: "/presenca.jpg",
        external_url: null,
        pdf_url: null,
        tags: ["Gestalt"],
        is_published: true,
        published_at: "2026-01-02T00:00:00.000Z",
        legacy_payload: {},
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mockedCreateSupabaseBrowserClient.mockReturnValue({
      from: jest.fn().mockReturnValue(postsQuery),
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    expect(await listPublishedContent("posts")).toEqual([
      expect.objectContaining({
        id: "reflection-1",
        image: "/presenca.jpg",
        isPublished: true,
      }),
    ]);
    expect(postsQuery.eq).toHaveBeenCalledWith("is_published", true);
  });

  it("lets authenticated admin callers request drafts through RLS", async () => {
    const coursesQuery = queryResult([]);
    mockedCreateSupabaseBrowserClient.mockReturnValue({
      from: jest.fn().mockReturnValue(coursesQuery),
    } as unknown as ReturnType<typeof createSupabaseBrowserClient>);

    await expect(
      listContent("courses", { publishedOnly: false }),
    ).resolves.toEqual([]);
    expect(coursesQuery.eq).not.toHaveBeenCalled();
  });
});

it("queries published closed details directly without loading the catalogue", async () => {
  const query = queryResult({
    id: "closed",
    title: "Closed offer",
    is_published: true,
    status: "closed",
    details: {},
    legacy_payload: {},
    total_price_cents: 100000,
    pix_price_cents: 25000,
    installment_count: 4,
  });
  mockedCreateSupabaseBrowserClient.mockReturnValue({
    from: jest.fn().mockReturnValue(query),
  } as any);
  const course = await getPublishedCourseByField("slug", "closed-offer");
  expect(course).toMatchObject({
    id: "closed",
    enrollmentOpen: false,
    totalPriceCents: 100000,
    pixPriceCents: 25000,
    installments: 4,
  });
  expect(query.eq).toHaveBeenCalledWith("slug", "closed-offer");
  expect(query.eq).toHaveBeenCalledWith("is_published", true);
  expect(query.in).toHaveBeenCalledWith("status", ["open", "closed"]);
  expect(query.order).not.toHaveBeenCalled();
});
it("does not replace a direct lookup SDK error with an empty course", async () => {
  const query = queryResult(null);
  query.maybeSingle.mockResolvedValue({
    data: null,
    error: { message: "connection failure" },
  });
  mockedCreateSupabaseBrowserClient.mockReturnValue({
    from: jest.fn().mockReturnValue(query),
  } as any);
  await expect(getPublishedCourseByField("id", "offer")).rejects.toEqual({
    message: "connection failure",
  });
});

it("does not serialize arbitrary legacy keys or permission-bearing course teams", () => {
  const mapped = mapPublicCourse({
    id: "course",
    title: "Curso",
    legacy_payload: {
      internalSecret: "SECRET",
      image: "/fallback.jpg",
      images: ["/fallback.jpg"],
      modality: "Online",
      mediators: [{ name: "Ana", role: "Mediadora", internalSecret: "SECRET" }],
    },
    details: {
      intro: "Introdução",
      internalSecret: "SECRET",
      schedule: ["Segunda", { internalSecret: "SECRET" }],
    },
    team: { "private-uid": { role: "admin" } },
  } as never);
  expect(mapped).not.toHaveProperty("internalSecret");
  expect(mapped).not.toHaveProperty("team");
  expect(mapped).toEqual(
    expect.objectContaining({
      image: "/fallback.jpg",
      modality: "Online",
      details: { intro: "Introdução", schedule: ["Segunda"] },
      mediators: [expect.objectContaining({ name: "Ana" })],
    }),
  );
  expect(JSON.stringify(mapped)).not.toContain("SECRET");
  expect(JSON.stringify(mapped)).not.toContain("private-uid");
});
it("allows only textual editorial metadata on public posts", () => {
  const mapped = mapPublicPost({
    id: "post",
    title: "Texto",
    legacy_payload: {
      internalSecret: "SECRET",
      author: "Autora",
      authorImage: { internalSecret: "SECRET" },
      category: "Gestalt",
      date: "Outubro",
    },
  } as never);
  expect(mapped).toEqual(
    expect.objectContaining({
      author: "Autora",
      category: "Gestalt",
      date: "Outubro",
    }),
  );
  expect(mapped).not.toHaveProperty("authorImage");
  expect(JSON.stringify(mapped)).not.toContain("SECRET");
});
it.each(["publicGallery", "team"] as const)(
  "does not hydrate arbitrary legacy metadata for %s",
  async (kind) => {
    const query = queryResult([
      {
        id: "record",
        name: "Pessoa",
        title: "Imagem",
        legacy_payload: { internalSecret: "SECRET" },
      },
    ]);
    mockedCreateSupabaseBrowserClient.mockReturnValue({
      from: () => query,
    } as never);
    const records = await listPublishedContent(kind);
    expect(records).toHaveLength(1);
    expect(JSON.stringify(records)).not.toContain("SECRET");
  },
);
