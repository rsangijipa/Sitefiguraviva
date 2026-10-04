import {
  getCourseMediators,
  getMediatorDetails,
  getMediatorParagraphs,
} from "../mediators";
describe("mediator compatibility", () => {
  it("normalizes old photo and curriculum fields", () => {
    expect(
      getMediatorDetails({
        name: " Ana ",
        photoURL: "/ana.jpg",
        curriculum: "Currículo",
        title: "Psicóloga",
      }),
    ).toEqual({
      name: "Ana",
      role: "Psicóloga",
      image: "/ana.jpg",
      bio: "Currículo",
    });
  });
  it("prefers updated profiles over legacy data, including explicit removal", () => {
    expect(
      getCourseMediators({ mediators: [] }, { mediators: ["Antiga"] }, [
        "Outra",
      ]),
    ).toEqual([]);
    expect(
      getCourseMediators(
        { mediators: ["Atual"] },
        { mediators: ["Antiga"] },
        {},
      ),
    ).toEqual([{ name: "Atual", role: "Mediadora", image: "", bio: "" }]);
  });
  it("does not interpret course permissions as public mediators", () => {
    expect(getCourseMediators({}, {}, { user: { role: "admin" } })).toEqual([]);
    expect(
      getCourseMediators({}, { mediators: [null, "Ana", {}] }, {}),
    ).toHaveLength(1);
  });
});

it("formats long legacy curricula without changing their content", () => {
  const bio = Array.from(
    { length: 20 },
    (_, i) =>
      "Experiência profissional número " + i + " na formação e na clínica.",
  ).join(" ");
  const paragraphs = getMediatorParagraphs(bio);
  expect(paragraphs.length).toBeGreaterThan(1);
  expect(paragraphs.join(" ")).toBe(bio);
  expect(getMediatorParagraphs("Formação.\n\nDocência.")).toEqual([
    "Formação.",
    "Docência.",
  ]);
});
it("prefers shared profiles over stale embedded copies and preserves registry IDs", () => {
  const current = {
    id: "registered",
    name: "Ana",
    role: "Psicóloga",
    image: "/current.jpg",
    bio: "Atual",
  };
  expect(
    getCourseMediators({ mediators: [{ ...current, bio: "Antigo" }] }, {}, {}, [
      { mediator: current },
    ]),
  ).toEqual([current]);
  expect(getCourseMediators({ mediators: [current] }, {}, {}, [])).toEqual([]);
});
