import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
jest.mock(
  "@/features/content/infrastructure/supabaseContentRepository",
  () => ({
    listContent: jest.fn(),
    listPublishedContent: jest.fn(),
    getPublicPageContent: jest.fn(),
  }),
);
import { listPublishedContent } from "@/features/content/infrastructure/supabaseContentRepository";
import { useCourses, useBlogPosts } from "../useContent";
it.each(["courses", "posts"] as const)(
  "home preview does not truncate the complete %s cache",
  async (kind) => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const full = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      title: "Item",
      isPublished: true,
    }));
    jest.mocked(listPublishedContent).mockResolvedValue(full);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const hook = kind === "courses" ? useCourses : useBlogPosts;
    const preview = renderHook(
      () => hook(false, { scope: "preview", initialData: full.slice(0, 3) }),
      { wrapper },
    );
    expect(preview.result.current.data).toHaveLength(3);
    const list = renderHook(() => hook(false), { wrapper });
    await waitFor(() => expect(list.result.current.data).toHaveLength(5));
    expect(preview.result.current.data).toHaveLength(3);
    list.unmount();
    preview.unmount();
    client.clear();
  },
);
