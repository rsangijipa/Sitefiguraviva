import { buildEnrollmentEmail } from "../templates";

const site = "https://www.institutofiguraviva.com.br";

it("writes the application-received message in Portuguese with a portal link", () => {
  const email = buildEnrollmentEmail("application_received", {
    name: "Ana",
    courseTitle: "III Formação Clínica",
    siteOrigin: site,
  });
  expect(email.subject).toBe("Recebemos sua inscrição: III Formação Clínica");
  expect(email.text).toContain("Olá, Ana.");
  expect(email.text).toContain(`${site}/portal`);
  expect(email.html).toContain('lang="pt-BR"');
});

it("escapes names and titles in the HTML version", () => {
  const email = buildEnrollmentEmail("enrollment_confirmed", {
    name: '<img src=x onerror="alert(1)">',
    courseTitle: "Curso <b>A</b> & B",
    siteOrigin: site,
  });
  expect(email.html).not.toContain("<img src=x");
  expect(email.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  expect(email.html).toContain("Curso &lt;b&gt;A&lt;/b&gt; &amp; B");
});

it("greets without a name when the profile has none", () => {
  const email = buildEnrollmentEmail("enrollment_confirmed", {
    name: "  ",
    courseTitle: "X",
    siteOrigin: site,
  });
  expect(email.text.startsWith("Olá.")).toBe(true);
});
