export type EnrollmentEmailKind = "application_received" | "enrollment_confirmed";

export type EnrollmentEmailContent = {
  subject: string;
  html: string;
  text: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function layout(title: string, paragraphs: string[], cta: { label: string; url: string }) {
  const body = paragraphs
    .map((text) => `<p style="margin:0 0 16px;line-height:1.6">${escapeHtml(text)}</p>`)
    .join("");
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#FDFAF4;font-family:Georgia,'Times New Roman',serif;color:#262B22">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #D8CFBE;border-radius:12px">
<tr><td style="padding:32px">
<p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#96551F">Instituto Figura Viva</p>
<h1 style="margin:0 0 24px;font-size:24px;color:#005A1F">${escapeHtml(title)}</h1>
${body}
<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#005A1F;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:14px;padding:12px 20px;border-radius:8px">${escapeHtml(cta.label)}</a></p>
<p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6b6b">Você recebeu esta mensagem porque se inscreveu em um curso do Instituto Figura Viva. Em caso de dúvida, responda a este e-mail.</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function buildEnrollmentEmail(
  kind: EnrollmentEmailKind,
  data: { name?: string | null; courseTitle: string; siteOrigin: string },
): EnrollmentEmailContent {
  const greeting = data.name?.trim() ? `Olá, ${data.name.trim()}.` : "Olá.";
  const portalUrl = `${data.siteOrigin}/portal`;

  if (kind === "application_received") {
    const subject = `Recebemos sua inscrição: ${data.courseTitle}`;
    const paragraphs = [
      greeting,
      `Recebemos sua inscrição em "${data.courseTitle}". A equipe vai analisar os dados e o pagamento informado.`,
      "Você receberá outro e-mail quando a matrícula for confirmada. Enquanto isso, acompanhe a situação pelo portal.",
    ];
    const cta = { label: "Acompanhar minha inscrição", url: portalUrl };
    return {
      subject,
      html: layout("Inscrição recebida", paragraphs, cta),
      text: `${paragraphs.join("\n\n")}\n\n${cta.label}: ${cta.url}`,
    };
  }

  const subject = `Matrícula confirmada: ${data.courseTitle}`;
  const paragraphs = [
    greeting,
    `Sua matrícula em "${data.courseTitle}" está confirmada. O conteúdo do curso já está disponível no portal do aluno.`,
    "Entre com o mesmo e-mail usado na inscrição.",
  ];
  const cta = { label: "Acessar o portal", url: portalUrl };
  return {
    subject,
    html: layout("Matrícula confirmada", paragraphs, cta),
    text: `${paragraphs.join("\n\n")}\n\n${cta.label}: ${cta.url}`,
  };
}
