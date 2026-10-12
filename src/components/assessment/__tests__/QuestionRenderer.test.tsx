import { fireEvent, render, screen } from "@testing-library/react";
import { QuestionRenderer } from "../QuestionRenderer";
import type { Question } from "@/types/assessment";
const choice: Question = { id: "q", title: "Escolha uma opção", type: "multiple_choice", points: 1, allowMultiple: false, options: [{ id: "a", text: "Opção A", isCorrect: false }] };
it("exposes selected answers as native keyboard-operable buttons", () => {
  const onChange = jest.fn();
  render(<QuestionRenderer question={choice} value="a" onChange={onChange} />);
  const option = screen.getByRole("button", { name: "Opção A", pressed: true });
  expect(option).toHaveAttribute("type", "button");
  fireEvent.click(option);
  expect(onChange).toHaveBeenCalledWith("a");
});
it("disables answer controls when displaying a submitted attempt", () => {
  render(<QuestionRenderer question={choice} value="a" onChange={jest.fn()} readOnly />);
  expect(screen.getByRole("button", { name: "Opção A" })).toBeDisabled();
});
it("renders a labeled response field for practical questions", () => {
  const question: Question = {id:"practice", title:"Observação da prática", type:"practical", points:5, instructions:"Descreva sua observação"};
  const onChange = jest.fn();
  render(<QuestionRenderer question={question} onChange={onChange} />);
  fireEvent.change(screen.getByRole("textbox", {name:"Observação da prática"}), {target:{value:"Minha observação"}});
  expect(onChange).toHaveBeenCalledWith("Minha observação");
});
