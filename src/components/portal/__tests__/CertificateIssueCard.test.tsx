import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { issueCertificate } from "@/actions/certificate";
import { CertificateIssueCard } from "../CertificateIssueCard";

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));
jest.mock("@/actions/certificate", () => ({ issueCertificate: jest.fn() }));

const completedCourse = {
  courseId: "course-a",
  courseTitle: "Curso A",
  progressPercent: 100,
  isCompleted: true,
};

beforeEach(() => jest.clearAllMocks());

it("shows a certificate fetched after the card first rendered", () => {
  const { rerender } = render(
    <CertificateIssueCard {...completedCourse} existingCertificate={null} />,
  );
  expect(screen.getByTestId("issue-certificate-button")).toBeVisible();
  rerender(
    <CertificateIssueCard
      {...completedCourse}
      existingCertificate={{ id: "cert-a", code: "code-a" }}
    />,
  );
  expect(screen.getByTestId("certificate-issued")).toBeVisible();
  expect(
    screen.queryByTestId("issue-certificate-button"),
  ).not.toBeInTheDocument();
  expect(issueCertificate).not.toHaveBeenCalled();
});

it("keeps a newly issued certificate visible without carrying it into another course", async () => {
  jest
    .mocked(issueCertificate)
    .mockResolvedValue({
      success: true,
      certificateId: "cert-a",
      certificateNumber: "code-a",
    });
  const { rerender } = render(<CertificateIssueCard {...completedCourse} />);
  fireEvent.click(screen.getByTestId("issue-certificate-button"));
  await waitFor(() =>
    expect(screen.getByTestId("certificate-issued")).toBeVisible(),
  );
  expect(issueCertificate).toHaveBeenCalledWith("course-a");
  expect(mockRefresh).toHaveBeenCalledTimes(1);
  rerender(
    <CertificateIssueCard
      {...completedCourse}
      courseId="course-b"
      courseTitle="Curso B"
    />,
  );
  expect(screen.getByTestId("issue-certificate-button")).toBeVisible();
  expect(screen.queryByTestId("certificate-issued")).not.toBeInTheDocument();
});

it("keeps certificate issuance unavailable before course completion", () => {
  render(
    <CertificateIssueCard
      {...completedCourse}
      progressPercent={50}
      isCompleted={false}
    />,
  );
  expect(screen.getByText("Certificado Indisponível")).toBeVisible();
  expect(
    screen.queryByTestId("issue-certificate-button"),
  ).not.toBeInTheDocument();
});
