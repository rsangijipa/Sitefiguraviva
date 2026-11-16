import { getCourseOfferIssues, listCourseOfferAlerts } from "../course-alerts";

const today = "2026-11-15";

describe("course offer alerts", () => {
  it("flags the current Formação: free billing, no price and past dates", () => {
    const issues = getCourseOfferIssues(
      {
        id: "formacao",
        title: "III Formação Clínica em Gestalt-Terapia",
        status: "open",
        isPublished: true,
        billing: { type: "free" },
        totalPriceCents: null,
        pixPriceCents: null,
        details: { date: "Início das aulas: 25 e 26 de abril 2026" },
      },
      today,
    );
    expect(issues.map((issue) => issue.kind)).toEqual([
      "marked_free",
      "missing_price",
      "past_date",
    ]);
  });

  it("flags CO-VISAR for price only (no date informed)", () => {
    const issues = getCourseOfferIssues(
      {
        id: "covisar",
        title: "Supervisão Clínica: CO-VISAR",
        status: "open",
        billingType: "free",
        details: { date: null },
      },
      today,
    );
    expect(issues.map((issue) => issue.kind)).toEqual(["marked_free", "missing_price"]);
  });

  it("asks only for the full price when the Pix entry is set", () => {
    const [issue] = getCourseOfferIssues(
      { id: "x", title: "X", status: "open", billing: { type: "one_time" }, pixPriceCents: 50000 },
      today,
    );
    expect(issue).toEqual({ kind: "missing_price", message: "Falta o valor integral do curso." });
  });

  it("is quiet for a priced, current course and for drafts or closed ones", () => {
    const priced = {
      id: "ok",
      title: "OK",
      status: "open",
      billing: { type: "one_time" },
      totalPriceCents: 1200000,
      details: { date: "6 de março de 2027" },
    };
    expect(getCourseOfferIssues(priced, today)).toEqual([]);
    expect(getCourseOfferIssues({ id: "d", title: "D", status: "draft", billing: { type: "free" } }, today)).toEqual([]);
    expect(getCourseOfferIssues({ id: "c", title: "C", status: "closed", isPublished: true }, today)).toEqual([]);
    expect(
      listCourseOfferAlerts([priced, { id: "n", title: "N", status: "open" }], today).map(
        (entry) => entry.course.id,
      ),
    ).toEqual(["n"]);
  });
});
