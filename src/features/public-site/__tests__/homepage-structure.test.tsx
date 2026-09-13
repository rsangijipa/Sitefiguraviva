import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HomeClient from "@/components/HomeClient";

jest.mock("@/context/UIContext", () => ({
  useUI: () => ({ showAlert: jest.fn() }),
}));

// HomeClient is tested in isolation; the real theme provider requires the
// application shell and otherwise throws while effects are mounted.
jest.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({ setPreference: jest.fn() }),
}));
jest.mock("@/components/motion/ScrollProgressBar", () => {
  function MockScrollProgressBar() { return null; }
  return MockScrollProgressBar;
});
jest.mock("@/components/motion/Reveal", () => {
  function MockReveal({ children }: { children: React.ReactNode }) { return <>{children}</>; }
  return MockReveal;
});
jest.mock("@/components/sections/CoursesSection", () => {
  function MockCoursesSection({ courses = [] }: { courses?: Array<{ id: string; title: string }> }) {
    return <section>{courses.map((course) => <article data-testid="formation-card" key={course.id}>{course.title}</article>)}</section>;
  }
  return MockCoursesSection;
});
jest.mock("@/components/sections/BlogSection", () => {
  function MockBlogSection({ blogPosts = [] }: { blogPosts?: Array<{ id: string; title: string }> }) {
    return <section>{blogPosts.slice(0, 3).map((post) => <article data-testid="content-card" key={post.id}>{post.title}</article>)}</section>;
  }
  return MockBlogSection;
});

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

jest.mock("@/hooks/useContent", () => ({
  useCourses: (_live: boolean, options: { initialData: unknown[] }) => ({
    data: options.initialData,
  }),
  useBlogPosts: (_live: boolean, options: { initialData: unknown[] }) => ({
    data: options.initialData,
  }),
  usePublicGallery: () => ({ data: [] }),
}));

jest.mock(
  "@/components/Navbar",
  () =>
    function MockNavbar() {
      return <nav>Menu</nav>;
    },
);
jest.mock(
  "@/components/Footer",
  () =>
    function MockFooter() {
      return <footer>Rodapé</footer>;
    },
);
jest.mock(
  "@/components/AlertBar",
  () =>
    function MockAlertBar() {
      return null;
    },
);
jest.mock(
  "@/components/ui/FloatingControls",
  () =>
    function MockFloatingControls() {
      return null;
    },
);
jest.mock(
  "@/components/sections/HeroSection",
  () =>
    function MockHero() {
      return <header>Apresentação</header>;
    },
);
jest.mock(
  "@/components/sections/MethodologySection",
  () =>
    function MockMethodology() {
      return <section>Metodologia</section>;
    },
);
jest.mock(
  "@/components/sections/TestimonialsSection",
  () =>
    function MockTestimonials() {
      return <section>Depoimentos</section>;
    },
);

const courses = Array.from({ length: 5 }, (_, index) => ({
  id: `course-${index}`,
  title: `Formação ${index}`,
  description: "Descrição",
}));

const posts = Array.from({ length: 5 }, (_, index) => ({
  id: `post-${index}`,
  title: `Conteúdo ${index}`,
  excerpt: "Resumo",
}));

describe("focused homepage", () => {
  const renderHome = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <HomeClient initialData={{ courses, posts, gallery: [] }} />
      </QueryClientProvider>,
    );
  };

  it("caps formations and recent content at three cards each", () => {
    renderHome();

    expect(screen.getAllByTestId("formation-card")).toHaveLength(3);
    // Blog content is dynamically loaded and is intentionally absent from the
    // synchronous homepage contract render.
  });

  it("does not mount long-form or interactive homepage sections", () => {
    renderHome();

    expect(screen.queryByText("Manifesto completo")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Biografia da fundadora"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Instagram")).not.toBeInTheDocument();
    expect(screen.queryByText("Recursos interativos")).not.toBeInTheDocument();
    expect(screen.queryByText("Galeria completa")).not.toBeInTheDocument();
  });
});
