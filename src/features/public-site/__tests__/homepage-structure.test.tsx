import { render, screen } from "@testing-library/react";

import HomeClient from "@/components/HomeClient";

jest.mock("@/context/UIContext", () => ({
  useUI: () => ({ showAlert: jest.fn() }),
}));

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
  it("caps formations and recent content at three cards each", () => {
    render(<HomeClient initialData={{ courses, posts, gallery: [] }} />);

    expect(screen.getAllByTestId("formation-card")).toHaveLength(3);
    expect(screen.getAllByTestId("content-card")).toHaveLength(3);
  });

  it("does not mount long-form or interactive homepage sections", () => {
    render(<HomeClient initialData={{ courses, posts, gallery: [] }} />);

    expect(screen.queryByText("Manifesto completo")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Biografia da fundadora"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Instagram")).not.toBeInTheDocument();
    expect(screen.queryByText("Recursos interativos")).not.toBeInTheDocument();
    expect(screen.queryByText("Galeria completa")).not.toBeInTheDocument();
  });
});
