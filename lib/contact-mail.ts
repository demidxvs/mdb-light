import { getMailSender, sendResendEmail } from "@/lib/resend-mail";

type ContactEmailPayload = {
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function readRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendContactEmail({ email, phone, subject, message }: ContactEmailPayload) {
  const toEmail = readRequiredEnv("CONTACT_FORM_TO_EMAIL");
  const from = getMailSender();

  const escapedEmail = escapeHtml(email);
  const escapedPhone = escapeHtml(phone || "—");
  const escapedSubject = escapeHtml(subject);
  const escapedMessage = escapeHtml(message).replaceAll("\n", "<br />");

  await sendResendEmail({
    from,
    to: toEmail,
    replyTo: email,
    subject: "Новая заявка с сайта MDB Light",
    text: [
      "Новая заявка с сайта MDB Light",
      "",
      `Email пользователя: ${email}`,
      `Телефон: ${phone || "—"}`,
      `Тема: ${subject}`,
      "",
      "Сообщение:",
      message,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#203153">
        <h2 style="margin:0 0 16px">Новая заявка с сайта MDB Light</h2>
        <p style="margin:0 0 8px"><strong>Email пользователя:</strong> ${escapedEmail}</p>
        <p style="margin:0 0 8px"><strong>Телефон:</strong> ${escapedPhone}</p>
        <p style="margin:0 0 8px"><strong>Тема:</strong> ${escapedSubject}</p>
        <p style="margin:16px 0 8px"><strong>Сообщение:</strong></p>
        <div style="padding:16px;border:1px solid #ece3d9;border-radius:16px;background:#fffcf7">
          ${escapedMessage}
        </div>
      </div>
    `,
  });
}
