jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import {
  getPublicPageContent,
  listContent,
  listPublishedContent,
  listPublishedCourses,
} from "../supabaseContentRepository";

const mockedCreateSupabaseBrowserClient = jest.mocked(
  createSupabaseBrowserClient,
);

function queryResult(data: unknown) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    maybeSingle: jest.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockResolvedValue({ data, error: null });
  query.maybeSingle.mockResolvedValue({ data, error: null });

  return query;
}

describe("Supabase public content repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns only published open courses mapped to the public shape", async () => {
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
    expect(coursesQuery.eq).toHaveBeenNthCalledWith(2, "status", "open");
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
