import { fireEvent, render, screen, within } from "@testing-library/react";
import BookshelfSection, { type Livro } from "../../BookshelfSection";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    onError,
  }: {
    src: string;
    alt: string;
    onError?: () => void;
  }) => <img src={src} alt={alt} onError={onError} />,
}));
const books: Livro[] = [
  {
    id: "dc3c1120-03b5-4513-8ed8-f69f5575b761",
    title: "Gestalt-terapia",
    author: "Perls, Hefferline e Goodman",
    description: "Referência para a clínica.",
    coverImageUrl: null,
    purchaseUrl: null,
    category: "Gestalt",
  },
  {
    id: "50dd29fa-8270-47da-b13d-08386b69cdb0",
    title:
      "Conceito de mundo e de pessoa em gestalt-terapia: revisitando um caminho 25 anos depois",
    author: "Jorge Ponciano Ribeiro",
    description: "Gestalt no texto não determina a categoria.",
    coverImageUrl: "https://example.com/authorized-test-cover.jpg",
    purchaseUrl: "https://example.com/catalog-test",
    publicationYear: 2011,
    category: "Fenomenologia",
  },
];
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  document.body.style.overflow = "";
});
it("searches all books including the featured book, by title and author without accents", () => {
  render(<BookshelfSection livros={books} />);
  const input = screen.getByRole("searchbox", {
    name: "Buscar por título ou autor",
  });
  const shelf = screen.getByRole("list", { name: "Livros da estante" });
  fireEvent.change(input, { target: { value: "PERLS" } });
  expect(within(shelf).getAllByRole("listitem")).toHaveLength(1);
  expect(
    within(shelf).getByRole("heading", { name: "Gestalt-terapia" }),
  ).toBeInTheDocument();
  fireEvent.change(input, { target: { value: "ponciano" } });
  expect(within(shelf).getAllByRole("listitem")).toHaveLength(1);
  expect(within(shelf).getByText(books[1].title)).toBeInTheDocument();
});
it("filters only by stored categories and combines the search", () => {
  render(<BookshelfSection livros={books} />);
  fireEvent.click(screen.getByRole("button", { name: "Gestalt", exact: true }));
  const shelf = screen.getByRole("list", { name: "Livros da estante" });
  expect(within(shelf).getAllByRole("listitem")).toHaveLength(1);
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "Ribeiro" },
  });
  expect(
    screen.getByText("Ainda não encontramos essa leitura."),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Limpar busca/ }));
  expect(screen.getByRole("status")).toHaveTextContent("2 leituras na estante");
});
it("does not invent categories for unclassified books", () => {
  render(
    <BookshelfSection
      livros={books.map((book) => ({ ...book, category: null }))}
    />,
  );
  expect(
    within(
      screen.getByRole("group", { name: "Filtrar por categoria" }),
    ).getAllByRole("button"),
  ).toHaveLength(1);
});
it("shows accessible details, traps focus, closes on Escape cancellation and restores the opener", () => {
  render(<BookshelfSection livros={books} />);
  const opener = within(screen.getByRole("list")).getAllByRole("button")[1];
  opener.focus();
  fireEvent.click(opener);
  const dialog = screen.getByRole("dialog", { name: books[1].title });
  const close = within(dialog).getByRole("button", {
    name: "Fechar detalhes do livro",
  });
  const link = within(dialog).getByRole("link", { name: /Onde encontrar/ });
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(document.body.style.overflow).toBe("hidden");
  link.focus();
  fireEvent.keyDown(dialog, { key: "Tab" });
  expect(close).toHaveFocus();
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
  expect(link).toHaveFocus();
  fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(opener).toHaveFocus();
  expect(document.body.style.overflow).toBe("");
});
it("handles missing covers and unsafe or missing external links", () => {
  render(
    <BookshelfSection
      livros={[{ ...books[0], purchaseUrl: "javascript:alert(1)" }]}
    />,
  );
  const opener = within(screen.getByRole("list")).getByRole("button");
  fireEvent.click(opener);
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).getByRole("img", { name: /Capa indisponível/ }),
  ).toBeInTheDocument();
  expect(within(dialog).queryByRole("link")).not.toBeInTheDocument();
  expect(
    within(dialog).getByText("Link externo indisponível no momento."),
  ).toBeInTheDocument();
});
it("replaces a failed image with a readable fallback", () => {
  render(<BookshelfSection livros={[books[1]]} />);
  const shelf = screen.getByRole("list");
  fireEvent.error(within(shelf).getByRole("img"));
  expect(
    within(shelf).getByRole("img", { name: /Capa indisponível/ }),
  ).toBeInTheDocument();
});
it("distinguishes unavailable data from an empty catalog", () => {
  render(<BookshelfSection livros={[]} loadError />);
  expect(
    screen.getByText("A estante está temporariamente indisponível."),
  ).toBeInTheDocument();
});
