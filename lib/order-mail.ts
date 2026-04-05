import type { Locale } from "@/i18n/config";
import { getMailSender, sendResendEmail } from "@/lib/resend-mail";
import {
  formatOrderMoney,
  getBankDetails,
  getDeliveryCopy,
  getPaymentMethodLabel,
  type OrderPaymentMethod,
} from "@/lib/order-utils";

type OrderEmailItem = {
  name: string;
  quantity: number;
  totalCents: number;
  currency: string;
  variantLines: string[];
};

type SendOrderEmailsPayload = {
  locale: Locale;
  orderCode: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  totalCents: number;
  currency: string;
  paymentMethod: OrderPaymentMethod;
  items: OrderEmailItem[];
  invoiceAttachment?: {
    filename: string;
    content: string;
    contentType?: string;
  } | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildItemsHtml(items: OrderEmailItem[]) {
  return items
    .map((item) => {
      const variantHtml = item.variantLines.length
        ? `<div style="margin-top:6px;color:#5f6f8f;font-size:13px;">${item.variantLines
            .map((line) => escapeHtml(line))
            .join("<br />")}</div>`
        : "";

      return `
        <div style="padding:14px 0;border-bottom:1px solid #ece3d9;">
          <div style="display:flex;justify-content:space-between;gap:16px;">
            <div>
              <div style="font-weight:600;color:#203153;">${escapeHtml(item.name)}</div>
              <div style="margin-top:4px;color:#5f6f8f;font-size:13px;">Qty: ${item.quantity}</div>
              ${variantHtml}
            </div>
            <div style="font-weight:600;color:#203153;white-space:nowrap;">${escapeHtml(
              formatOrderMoney(item.totalCents, item.currency),
            )}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function getCopy(locale: Locale) {
  if (locale === "ru") {
    return {
      createdSubject: "Заказ создан",
      createdTitle: "Спасибо за заказ",
      createdIntro: "Мы получили ваш заказ и начали его обработку.",
      paidSubject: "Оплата получена",
      paidTitle: "Оплата получена",
      paidIntro: "Мы получили ваш платёж и начали обработку заказа.",
      total: "Сумма заказа",
      orderNumber: "Номер заказа",
      phone: "Телефон",
      paymentMethod: "Способ оплаты",
      ownerCreated: "Новый заказ",
      ownerPaid: "Оплата получена по заказу",
      bankDetails: "Реквизиты для оплаты",
      reference: "Назначение платежа",
    };
  }

  if (locale === "el") {
    return {
      createdSubject: "Η παραγγελία δημιουργήθηκε",
      createdTitle: "Ευχαριστούμε για την παραγγελία σας",
      createdIntro: "Λάβαμε την παραγγελία σας και ξεκινήσαμε την επεξεργασία της.",
      paidSubject: "Η πληρωμή λήφθηκε",
      paidTitle: "Η πληρωμή λήφθηκε",
      paidIntro: "Λάβαμε την πληρωμή σας και ξεκινήσαμε την επεξεργασία της παραγγελίας.",
      total: "Σύνολο παραγγελίας",
      orderNumber: "Αριθμός παραγγελίας",
      phone: "Τηλέφωνο",
      paymentMethod: "Τρόπος πληρωμής",
      ownerCreated: "Νέα παραγγελία",
      ownerPaid: "Η πληρωμή λήφθηκε για την παραγγελία",
      bankDetails: "Στοιχεία τραπεζικής πληρωμής",
      reference: "Αιτιολογία πληρωμής",
    };
  }

  if (locale === "lv") {
    return {
      createdSubject: "Pasūtījums izveidots",
      createdTitle: "Paldies par pasūtījumu",
      createdIntro: "Mēs saņēmām jūsu pasūtījumu un sākām tā apstrādi.",
      paidSubject: "Maksājums saņemts",
      paidTitle: "Maksājums saņemts",
      paidIntro: "Mēs saņēmām jūsu maksājumu un sākām pasūtījuma apstrādi.",
      total: "Pasūtījuma summa",
      orderNumber: "Pasūtījuma numurs",
      phone: "Tālrunis",
      paymentMethod: "Apmaksas veids",
      ownerCreated: "Jauns pasūtījums",
      ownerPaid: "Saņemts maksājums par pasūtījumu",
      bankDetails: "Bankas rekvizīti",
      reference: "Maksājuma mērķis",
    };
  }

  return {
    createdSubject: "Order created",
    createdTitle: "Thank you for your order",
    createdIntro: "We received your order and started processing it.",
    paidSubject: "Payment received",
    paidTitle: "Payment received",
    paidIntro: "We received your payment and started processing the order.",
    total: "Order total",
    orderNumber: "Order number",
    phone: "Phone",
    paymentMethod: "Payment method",
    ownerCreated: "New order",
    ownerPaid: "Payment received for order",
    bankDetails: "Bank details",
    reference: "Reference",
  };
}

async function sendEmails(
  payload: SendOrderEmailsPayload,
  mode: "created" | "paid",
) {
  const from = getMailSender();
  const ownerEmail =
    process.env.ORDER_NOTIFICATIONS_TO_EMAIL ||
    process.env.CONTACT_FORM_TO_EMAIL;

  if (!ownerEmail) {
    throw new Error("Missing ORDER_NOTIFICATIONS_TO_EMAIL or CONTACT_FORM_TO_EMAIL.");
  }

  const copy = getCopy(payload.locale);
  const deliveryCopy = getDeliveryCopy(payload.locale);
  const bankDetails = getBankDetails();
  const totalFormatted = formatOrderMoney(payload.totalCents, payload.currency);
  const escapedCustomerName = escapeHtml(
    payload.customerName || payload.customerEmail || "MDB Light customer",
  );
  const escapedCustomerPhone = escapeHtml(payload.customerPhone || "—");
  const itemsHtml = buildItemsHtml(payload.items);
  const paymentMethodLabel = getPaymentMethodLabel(payload.locale, payload.paymentMethod);
  const buyerSubject = mode === "paid" ? copy.paidSubject : copy.createdSubject;
  const buyerTitle = mode === "paid" ? copy.paidTitle : copy.createdTitle;
  const buyerIntro = mode === "paid" ? copy.paidIntro : copy.createdIntro;
  const ownerTitle = mode === "paid" ? copy.ownerPaid : copy.ownerCreated;
  const bankTransferText =
    payload.paymentMethod === "bank_transfer"
      ? [
          "",
          `${copy.bankDetails}:`,
          `${bankDetails.company}`,
          `IBAN: ${bankDetails.iban}`,
          `Bank: ${bankDetails.bank}`,
          `SWIFT: ${bankDetails.swift}`,
          `${copy.reference}: ${payload.orderCode}`,
        ].join("\n")
      : "";
  const bankTransferHtml =
    payload.paymentMethod === "bank_transfer"
      ? `
        <div style="margin-top:18px;padding:18px;border:1px solid #ece3d9;border-radius:18px;background:#fff7e8;">
          <div style="font-weight:700;color:#203153;margin-bottom:8px;">${escapeHtml(copy.bankDetails)}</div>
          <div>${escapeHtml(bankDetails.company)}</div>
          <div>IBAN: ${escapeHtml(bankDetails.iban)}</div>
          <div>Bank: ${escapeHtml(bankDetails.bank)}</div>
          <div>SWIFT: ${escapeHtml(bankDetails.swift)}</div>
          <div>${escapeHtml(copy.reference)}: ${escapeHtml(payload.orderCode)}</div>
        </div>
      `
      : "";

  const emails = [
    sendResendEmail({
      from,
      to: ownerEmail,
      replyTo: payload.customerEmail || undefined,
      subject: `${ownerTitle} ${payload.orderCode}`,
      text: [
        ownerTitle,
        "",
        `${copy.orderNumber}: ${payload.orderCode}`,
        `Customer: ${payload.customerName || payload.customerEmail || "MDB Light customer"}`,
        `Email: ${payload.customerEmail || "—"}`,
        `${copy.phone}: ${payload.customerPhone || "—"}`,
        `${copy.paymentMethod}: ${paymentMethodLabel}`,
        `Total: ${totalFormatted}`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#203153;">
          <h2 style="margin:0 0 12px;">${escapeHtml(ownerTitle)}</h2>
          <p style="margin:0 0 8px;"><strong>${escapeHtml(copy.orderNumber)}:</strong> ${escapeHtml(payload.orderCode)}</p>
          <p style="margin:0 0 8px;"><strong>Customer:</strong> ${escapedCustomerName}</p>
          <p style="margin:0 0 20px;"><strong>Email:</strong> ${escapeHtml(payload.customerEmail || "—")}</p>
          <p style="margin:0 0 20px;"><strong>${escapeHtml(copy.phone)}:</strong> ${escapedCustomerPhone}</p>
          <p style="margin:0 0 20px;"><strong>${escapeHtml(copy.paymentMethod)}:</strong> ${escapeHtml(paymentMethodLabel)}</p>
          <p style="margin:0 0 20px;"><strong>Total:</strong> ${escapeHtml(totalFormatted)}</p>
          <div style="padding:18px;border:1px solid #ece3d9;border-radius:18px;background:#fffcf7;">
            ${itemsHtml}
          </div>
        </div>
      `,
      attachments: payload.invoiceAttachment ? [payload.invoiceAttachment] : undefined,
    }),
  ];

  if (payload.customerEmail) {
    emails.push(
      sendResendEmail({
        from,
        to: payload.customerEmail,
        subject: `${buyerSubject} · ${payload.orderCode}`,
        text: [
          buyerTitle,
          "",
          buyerIntro,
          `${copy.orderNumber}: ${payload.orderCode}`,
          `${copy.phone}: ${payload.customerPhone || "—"}`,
          `${copy.paymentMethod}: ${paymentMethodLabel}`,
          `${copy.total}: ${totalFormatted}`,
          "",
          deliveryCopy.email,
          bankTransferText,
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#203153;">
            <h2 style="margin:0 0 12px;">${escapeHtml(buyerTitle)}</h2>
            <p style="margin:0 0 8px;">${escapeHtml(buyerIntro)}</p>
            <p style="margin:0 0 8px;"><strong>${escapeHtml(copy.orderNumber)}:</strong> ${escapeHtml(payload.orderCode)}</p>
            <p style="margin:0 0 8px;"><strong>${escapeHtml(copy.phone)}:</strong> ${escapedCustomerPhone}</p>
            <p style="margin:0 0 8px;"><strong>${escapeHtml(copy.paymentMethod)}:</strong> ${escapeHtml(paymentMethodLabel)}</p>
            <p style="margin:0 0 20px;"><strong>${escapeHtml(copy.total)}:</strong> ${escapeHtml(totalFormatted)}</p>
            <div style="padding:18px;border:1px solid #ece3d9;border-radius:18px;background:#fffcf7;">
              ${itemsHtml}
            </div>
            ${bankTransferHtml}
            <p style="margin:18px 0 0;">${escapeHtml(deliveryCopy.email)}</p>
          </div>
        `,
        attachments: payload.invoiceAttachment ? [payload.invoiceAttachment] : undefined,
      }),
    );
  }

  await Promise.all(emails);
}

export async function sendOrderCreatedEmails(payload: SendOrderEmailsPayload) {
  await sendEmails(payload, "created");
}

export async function sendOrderPaidEmails(payload: SendOrderEmailsPayload) {
  await sendEmails(payload, "paid");
}
