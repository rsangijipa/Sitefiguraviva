import { fireEvent, render, screen, waitFor } from "@testing-library/react";
const approve = jest.fn(),
  update = jest.fn(),
  revoke = jest.fn(),
  toast = jest.fn();
jest.mock("@/app/actions/admin/enrollment", () => ({
  approveEnrollment: (...a: unknown[]) => approve(...a),
  updateEnrollmentStatus: (...a: unknown[]) => update(...a),
  revokeAccess: (...a: unknown[]) => revoke(...a),
}));
jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({ addToast: toast }),
}));
jest.mock("@/components/admin/PixReviewPanel", () => ({
  __esModule: true,
  default: () => null,
}));
import { EnrollmentCard } from "../EnrollmentCard";
beforeEach(() => {
  jest.clearAllMocks();
  approve.mockResolvedValue({ success: true });
  update.mockResolvedValue({ success: true });
  revoke.mockResolvedValue({ success: true });
  jest.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => jest.restoreAllMocks());
const props = {
  userId: "student",
  course: { title: "Curso" },
  enrollment: {
    id: "real-id",
    courseId: "course",
    status: "active",
    paymentMethod: "manual",
  },
};
it("refreshes after completing existing access", async () => {
  const refreshed = jest.fn();
  render(<EnrollmentCard {...props} onReviewed={refreshed} />);
  fireEvent.click(screen.getByTitle("Marcar como Concluído"));
  await waitFor(() => expect(refreshed).toHaveBeenCalledTimes(1));
});
it("shows rejection instead of claiming completion", async () => {
  update.mockResolvedValue({ success: false, error: "Bloqueado" });
  const refreshed = jest.fn();
  render(<EnrollmentCard {...props} onReviewed={refreshed} />);
  fireEvent.click(screen.getByTitle("Marcar como Concluído"));
  await waitFor(() => expect(toast).toHaveBeenCalledWith("Bloqueado", "error"));
  expect(refreshed).not.toHaveBeenCalled();
});
it("refreshes after manual approval", async () => {
  const refreshed = jest.fn();
  render(
    <EnrollmentCard
      {...props}
      enrollment={{ ...props.enrollment, status: "pending_approval" }}
      onReviewed={refreshed}
    />,
  );
  fireEvent.click(screen.getByTitle("Aprovar Matrícula"));
  await waitFor(() => expect(refreshed).toHaveBeenCalledTimes(1));
});
it("refreshes after revocation", async () => {
  const refreshed = jest.fn();
  render(<EnrollmentCard {...props} onReviewed={refreshed} />);
  fireEvent.click(screen.getByTitle("Revogar Acesso"));
  await waitFor(() => expect(refreshed).toHaveBeenCalledTimes(1));
});
it("handles thrown action errors", async () => {
  update.mockRejectedValue(new Error("network"));
  render(<EnrollmentCard {...props} />);
  fireEvent.click(screen.getByTitle("Marcar como Concluído"));
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith(
      "Não foi possível alterar a matrícula.",
      "error",
    ),
  );
});

it.each(["pix", "stripe", null, "unknown"])(
  "does not offer ordinary approval for %s",
  (method) => {
    render(
      <EnrollmentCard
        {...props}
        enrollment={{
          ...props.enrollment,
          status: "pending_approval",
          paymentMethod: method,
        }}
      />,
    );
    expect(screen.queryByTitle("Aprovar Matrícula")).not.toBeInTheDocument();
  },
);
