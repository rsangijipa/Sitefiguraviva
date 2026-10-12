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
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
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

  it("pre-fills form data from userProfile and displays connected account banner in Step 2", () => {
    render(
      <EnrollmentStepper
        courseId="course-a"
        initialData={{
          uid: "student-123",
          course: { title: "Curso A" },
          application: null,
          enrollment: null,
          pixOrder: null,
          userProfile: {
            display_name: "Mariana Aluna",
            phone_number: "11999998888",
            profession: "Psicóloga Clínica",
            email: "mariana@example.com",
            is_active: true,
          },
        }}
      />,
    );

    expect(screen.getByText("Identificado na plataforma")).toBeInTheDocument();
    expect(screen.getByText("Conta Conectada")).toBeInTheDocument();
    expect(screen.getByText("mariana@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mariana Aluna")).toBeInTheDocument();
    expect(screen.getByDisplayValue("11999998888")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Psicóloga Clínica")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders Step 1 for unauthenticated visitors", () => {
    render(
      <EnrollmentStepper
        courseId="course-a"
        initialData={{
          uid: null,
          course: { title: "Curso A" },
          application: null,
          enrollment: null,
          pixOrder: null,
          userProfile: null,
        }}
      />,
    );

    expect(screen.getByText("Primeiro, identifique-se")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Já possuo conta/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criar nova conta/ })).toBeInTheDocument();
  });
});
