import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EnrollmentStepper from "../EnrollmentStepper";
const generate = jest.fn(),
  toast = jest.fn(),
  refresh = jest.fn(),
  push = jest.fn();
const router = { refresh, push };
jest.mock("next/navigation", () => ({ useRouter: () => router }));
jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({ addToast: toast }),
}));
jest.mock("@/app/actions/enrollment-pix", () => ({
  generatePixPayload: (id: string) => generate(id),
}));
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: "verified-token" } },
      }),
    },
  }),
}));
jest.mock("qrcode", () => ({
  __esModule: true,
  default: { toDataURL: async () => "data:image/png;base64,fixture" },
}));
const initial = {
  uid: "student",
  course: { title: "Curso A" },
  application: { status: "submitted" },
  enrollment: { status: "pending_approval" },
  pixOrder: {
    id: "order",
    status: "pending",
    payload: "persisted-code",
    txid: "ORDER123",
    merchant_name: "Instituto",
    amount_cents: 25000,
    declared_at: null,
  },
};
describe("student Pix state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  });
  it("restores the saved code and initial amount without making a new order", async () => {
    render(<EnrollmentStepper courseId="course-a" initialData={initial} />);
    expect(await screen.findByLabelText("Pix Copia e Cola")).toHaveValue(
      "persisted-code",
    );
    expect(
      screen.getByText(/Matrícula ou primeira parcela:/),
    ).toHaveTextContent("250,00");
    expect(generate).not.toHaveBeenCalled();
    expect(screen.queryByText(/Pagamento confirmado!/)).not.toBeInTheDocument();
  });
  it("sends the receipt for review without claiming funds were received", async () => {
    render(<EnrollmentStepper courseId="course-a" initialData={initial} />);
    fireEvent.change(await screen.findByLabelText(/Após pagar, envie/), {
      target: {
        files: [
          new File(["%PDF-fixture"], "receipt.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar para conferência" }),
    );
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(await screen.findByText("Inscrição em Análise")).toBeInTheDocument();
    expect(
      screen.getByText(
        /O pagamento ainda não está confirmado e o acesso aguarda/,
      ),
    ).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });
  it("shows active access after approval rather than retaining the old pending QR status", () => {
    render(
      <EnrollmentStepper
        courseId="course-a"
        initialData={{
          ...initial,
          enrollment: { status: "active" },
          pixOrder: { ...initial.pixOrder, status: "paid" },
        }}
      />,
    );
    expect(screen.getByText("Inscrição Confirmada!")).toBeInTheDocument();
    expect(screen.queryByText("Inscrição em Análise")).not.toBeInTheDocument();
  });
});
