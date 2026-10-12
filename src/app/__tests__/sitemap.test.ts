import { resourceCatalog } from "@/components/resources/resourceCatalog";
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAnonServerClient: jest.fn(),
}));
import { createSupabaseAnonServerClient } from "@/infrastructure/supabase/server";
import sitemap from "../sitemap";
import robots from "../robots";
const staticCount =
  13 +
  resourceCatalog.filter((resource) => resource.status === "available").length;
const client = jest.mocked(createSupabaseAnonServerClient);
describe("public discovery", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://www.institutofiguraviva.com.br";
  });
  it("retains institutional routes when client configuration fails", async () => {
    client.mockImplementation(() => {
      throw new Error("offline");
    });
    const entries = await sitemap();
    expect(entries).toHaveLength(staticCount);
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: process.env.NEXT_PUBLIC_BASE_URL + "/termos",
      }),
    );
    expect(entries.some((e) => /admin|portal|api/.test(e.url))).toBe(false);
  });
  it("filters public commercial courses and aligns slug URLs", async () => {
    const queries: any[] = [];
    client.mockReturnValue({
      from: (table: string) => {
        const q = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          abortSignal: jest.fn().mockResolvedValue({
            data: [
              {
                id: table,
                slug: table === "courses" ? "gestalt clínica" : null,
                updated_at: "invalid",
              },
            ],
            error: null,
          }),
        };
        queries.push(q);
        return q;
      },
    } as any);
    const entries = await sitemap();
    expect(queries[0].eq).toHaveBeenCalledWith("is_published", true);
    expect(queries[0].in).toHaveBeenCalledWith("status", ["open", "closed"]);
    expect(queries[1].eq).toHaveBeenCalledWith("is_published", true);
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: process.env.NEXT_PUBLIC_BASE_URL + "/curso/gestalt%20cl%C3%ADnica",
      }),
    );
    expect(entries[staticCount]).not.toHaveProperty("lastModified");
  });
  it("ignores rows returned alongside a database error", async () => {
    const q: any = {
      select: () => q,
      eq: () => q,
      in: () => q,
      abortSignal: async () => ({
        data: [{ id: "private" }],
        error: new Error("denied"),
      }),
    };
    client.mockReturnValue({ from: () => q } as any);
    expect(await sitemap()).toHaveLength(staticCount);
    expect(robots().sitemap).toBe(
      process.env.NEXT_PUBLIC_BASE_URL + "/sitemap.xml",
    );
  });
});
