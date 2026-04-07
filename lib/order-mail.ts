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

type EmailMode = "created_bank_transfer" | "paid";

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
      createdSubject: "Инструкции по оплате заказа",
      createdTitle: "Заказ ожидает банковский перевод",
      createdIntro: "Мы получили ваш заказ. Он будет обработан после подтверждения поступления оплаты.",
      paidSubject: "Оплата получена",
      paidTitle: "Оплата получена",
      paidIntro: "Мы получили ваш платёж. В ближайшее время с вами свяжутся для уточнения деталей заказа.",
      total: "Сумма заказа",
      orderNumber: "Номер заказа",
      phone: "Телефон",
      paymentMethod: "Способ оплаты",
      ownerCreated: "Новый заказ с оплатой банковским переводом",
      ownerPaid: "Оплата получена по заказу",
      bankDetails: "Реквизиты для оплаты",
      reference: "Назначение платежа",
      processingAfterPayment: "Заказ будет обработан после подтверждения оплаты.",
      paymentPending: "Статус оплаты: ожидает банковский перевод",
      paymentPaid: "Статус оплаты: оплачено",
    };
  }

  if (locale === "el") {
    return {
      createdSubject: "Οδηγίες τραπεζικής πληρωμής",
      createdTitle: "Η παραγγελία αναμένει τραπεζική μεταφορά",
      createdIntro: "Λάβαμε την παραγγελία σας. Θα επεξεργαστεί μετά την επιβεβαίωση της πληρωμής.",
      paidSubject: "Η πληρωμή λήφθηκε",
      paidTitle: "Η πληρωμή λήφθηκε",
      paidIntro: "Λάβαμε την πληρωμή σας. Σύντομα θα επικοινωνήσουμε μαζί σας για τις λεπτομέρειες της παραγγελίας.",
      total: "Σύνολο παραγγελίας",
      orderNumber: "Αριθμός παραγγελίας",
      phone: "Τηλέφωνο",
      paymentMethod: "Τρόπος πληρωμής",
      ownerCreated: "Νέα παραγγελία με τραπεζική μεταφορά",
      ownerPaid: "Η πληρωμή λήφθηκε για την παραγγελία",
      bankDetails: "Στοιχεία τραπεζικής πληρωμής",
      reference: "Αιτιολογία πληρωμής",
      processingAfterPayment: "Η παραγγελία θα επεξεργαστεί μετά την επιβεβαίωση της πληρωμής.",
      paymentPending: "Κατάσταση πληρωμής: εκκρεμεί τραπεζική μεταφορά",
      paymentPaid: "Κατάσταση πληρωμής: πληρωμένο",
    };
  }

  if (locale === "lv") {
    return {
      createdSubject: "Bankas pārskaitījuma instrukcija",
      createdTitle: "Pasūtījums gaida bankas pārskaitījumu",
      createdIntro: "Mēs saņēmām jūsu pasūtījumu. Tas tiks apstrādāts pēc maksājuma saņemšanas apstiprinājuma.",
      paidSubject: "Maksājums saņemts",
      paidTitle: "Maksājums saņemts",
      paidIntro: "Mēs saņēmām jūsu maksājumu. Drīzumā ar jums sazināsimies, lai precizētu pasūtījuma detaļas.",
      total: "Pasūtījuma summa",
      orderNumber: "Pasūtījuma numurs",
      phone: "Tālrunis",
      paymentMethod: "Apmaksas veids",
      ownerCreated: "Jauns pasūtījums ar bankas pārskaitījumu",
      ownerPaid: "Saņemts maksājums par pasūtījumu",
      bankDetails: "Bankas rekvizīti",
      reference: "Maksājuma mērķis",
      processingAfterPayment: "Pasūtījums tiks apstrādāts pēc maksājuma apstiprināšanas.",
      paymentPending: "Maksājuma statuss: gaida bankas pārskaitījumu",
      paymentPaid: "Maksājuma statuss: apmaksāts",
    };
  }

  return {
    createdSubject: "Bank transfer instructions",
    createdTitle: "Order awaiting bank transfer",
    createdIntro: "We received your order. It will be processed after payment confirmation.",
    paidSubject: "Payment received",
    paidTitle: "Payment received",
    paidIntro: "We received your payment. We will contact you shortly to confirm the order details.",
    total: "Order total",
    orderNumber: "Order number",
    phone: "Phone",
    paymentMethod: "Payment method",
    ownerCreated: "New bank transfer order",
    ownerPaid: "Payment received for order",
    bankDetails: "Bank details",
    reference: "Reference",
    processingAfterPayment: "The order will be processed after payment confirmation.",
    paymentPending: "Payment status: bank transfer pending",
    paymentPaid: "Payment status: paid",
  };
}

async function sendEmails(
  payload: SendOrderEmailsPayload,
  mode: EmailMode,
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
  const deliveryNote = mode === "paid" ? deliveryCopy.email : copy.processingAfterPayment;
  const bankTransferText =
    mode === "created_bank_transfer" && payload.paymentMethod === "bank_transfer"
      ? [
          "",
          `${copy.bankDetails}:`,
          `${bankDetails.company}`,
          `IBAN: ${bankDetails.iban}`,
          `Bank: ${bankDetails.bank}`,
          `SWIFT: ${bankDetails.swift}`,
          `${copy.reference}: ${payload.orderCode}`,
          "",
          copy.processingAfterPayment,
        ].join("\n")
      : "";
  const bankTransferHtml =
    mode === "created_bank_transfer" && payload.paymentMethod === "bank_transfer"
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
        mode === "created_bank_transfer" ? copy.paymentPending : copy.paymentPaid,
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
          <p style="margin:0 0 20px;"><strong>${escapeHtml(mode === "created_bank_transfer" ? copy.paymentPending : copy.paymentPaid)}</strong></p>
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
          deliveryNote,
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
            <p style="margin:18px 0 0;">${escapeHtml(deliveryNote)}</p>
          </div>
        `,
        attachments: payload.invoiceAttachment ? [payload.invoiceAttachment] : undefined,
      }),
    );
  }

  await Promise.all(emails);
}

export async function sendOrderCreatedEmails(payload: SendOrderEmailsPayload) {
  await sendEmails(payload, "created_bank_transfer");
}

export async function sendOrderPaidEmails(payload: SendOrderEmailsPayload) {
  await sendEmails(payload, "paid");
}
