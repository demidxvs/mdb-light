type ResendEmailPayload = {
  from: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
};

function readRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getMailSender() {
  const fromEmail = readRequiredEnv("SMTP_FROM_EMAIL");
  const fromName = process.env.SMTP_FROM_NAME || "MDB Light";

  return `"${fromName}" <${fromEmail}>`;
}

export async function sendResendEmail(payload: ResendEmailPayload) {
  const apiKey = readRequiredEnv("RESEND_API_KEY");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      attachments: payload.attachments,
    }),
  });

  if (response.ok) {
    return;
  }

  const errorText = await response.text().catch(() => "");
  throw new Error(
    `Resend email request failed with ${response.status}${errorText ? `: ${errorText}` : ""}`,
  );
}
