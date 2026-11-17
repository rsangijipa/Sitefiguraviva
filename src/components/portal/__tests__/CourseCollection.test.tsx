import { fireEvent, render, screen } from "@testing-library/react";
import { CourseCollection } from "../CourseCollection";

it("combines accent-insensitive search, completion filtering and sorting without losing courses", () => {
  render(<CourseCollection items={[
    { id: "a", title: "Introdução à clínica", completed: false, lastAccess: "2026-11-01", card: <article>Introdução à clínica</article> },
    { id: "b", title: "Clínica e presença", completed: true, lastAccess: "2026-11-15", card: <article>Clínica e presença</article> },
  ]} />);
  expect(screen.getAllByRole("article")[0]).toHaveTextContent("Clínica e presença");
  fireEvent.change(screen.getByLabelText("Buscar meus cursos"), { target: { value: "clinica" } });
  expect(screen.getByRole("status")).toHaveTextContent("2 cursos encontrados");
  fireEvent.change(screen.getByLabelText("Situação"), { target: { value: "progress" } });
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("article")).toHaveTextContent("Introdução");
  fireEvent.change(screen.getByLabelText("Buscar meus cursos"), { target: { value: "ausente" } });
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  fireEvent.change(screen.getByLabelText("Ordenar por"), { target: { value: "title" } });
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getAllByRole("article")[0]).toHaveTextContent("Clínica e presença");
});
