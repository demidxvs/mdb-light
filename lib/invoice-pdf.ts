import { PDFDocument, type PDFFont, StandardFonts, rgb } from "pdf-lib";
import { formatInvoiceDate, sanitizeInvoiceFilename } from "@/lib/invoices";

export type InvoicePdfItem = {
  name: string;
  unit: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  note?: string;
};

export type InvoicePdfPayload = {
  invoiceNumber: string;
  issueDate: string;
  clientName: string;
  clientRegistrationNumber?: string;
  clientAddress: string;
  clientEmail?: string;
  clientPhone?: string;
  amountInWords?: string;
  advancePaymentCents: number;
  subtotalCents: number;
  totalCents: number;
  note?: string;
  items: InvoicePdfItem[];
};

function eur(value: number) {
  return (value / 100).toFixed(2);
}

function asciiSafe(value: string) {
  const map: Record<string, string> = {
    А: "A", а: "a", Б: "B", б: "b", В: "V", в: "v", Г: "G", г: "g",
    Д: "D", д: "d", Е: "E", е: "e", Ё: "E", ё: "e", Ж: "Zh", ж: "zh",
    З: "Z", з: "z", И: "I", и: "i", Й: "J", й: "j", К: "K", к: "k",
    Л: "L", л: "l", М: "M", м: "m", Н: "N", н: "n", О: "O", о: "o",
    П: "P", п: "p", Р: "R", р: "r", С: "S", с: "s", Т: "T", т: "t",
    У: "U", у: "u", Ф: "F", ф: "f", Х: "H", х: "h", Ц: "C", ц: "c",
    Ч: "Ch", ч: "ch", Ш: "Sh", ш: "sh", Щ: "Shch", щ: "shch", Ъ: "",
    ъ: "", Ы: "Y", ы: "y", Ь: "", ь: "", Э: "E", э: "e", Ю: "Yu",
    ю: "yu", Я: "Ya", я: "ya",
    Ā: "A", ā: "a", Č: "C", č: "c", Ē: "E", ē: "e", Ģ: "G", ģ: "g",
    Ī: "I", ī: "i", Ķ: "K", ķ: "k", Ļ: "L", ļ: "l", Ņ: "N", ņ: "n",
    Š: "S", š: "s", Ū: "U", ū: "u", Ž: "Z", ž: "z",
    É: "E", é: "e", È: "E", è: "e", Á: "A", á: "a", Ó: "O", ó: "o",
    Ú: "U", ú: "u", Í: "I", í: "i", Ñ: "N", ñ: "n",
    "€": "EUR",
    "–": "-", "—": "-", "−": "-", "“": "\"", "”": "\"", "„": "\"",
    "’": "'", "‘": "'", "№": "Nr.",
  };

  return Array.from(value)
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number) {
  const normalized = asciiSafe(text);
  const words = normalized.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function fitTextSize(text: string, maxWidth: number, font: PDFFont, initialSize: number, minSize: number) {
  let size = initialSize;
  const normalized = asciiSafe(text);

  while (size > minSize && font.widthOfTextAtSize(normalized, size) > maxWidth) {
    size -= 0.5;
  }

  return size;
}

export async function generateInvoicePdf(payload: InvoicePdfPayload) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const gold = rgb(0.84, 0.67, 0.32);
  const green = rgb(0.24, 0.74, 0.49);
  const dark = rgb(0.12, 0.12, 0.12);
  const muted = rgb(0.42, 0.42, 0.42);
  const light = rgb(0.83, 0.83, 0.83);

  const margin = 48;
  let y = 780;

  page.drawText("MDB GROUP", {
    x: margin,
    y: y - 10,
    size: 22,
    font: fontBold,
    color: gold,
  });

  const rightLabelX = 330;
  const rightValueX = 547;
  const rightColumnWidth = 170;
  const invoiceNumberLabel = "Rekina numurs";
  page.drawText(invoiceNumberLabel, {
    x: rightLabelX,
    y,
    size: 12,
    font: fontBold,
    color: dark,
  });
  const invoiceNumber = asciiSafe(payload.invoiceNumber);
  const invoiceNumberSize = fitTextSize(invoiceNumber, rightColumnWidth, fontBold, 17, 13);
  page.drawText(invoiceNumber, {
    x: rightValueX - fontBold.widthOfTextAtSize(invoiceNumber, invoiceNumberSize),
    y: y - 2,
    size: invoiceNumberSize,
    font: fontBold,
    color: dark,
  });

  const issueDateLabel = "Izrakstisanas datums";
  page.drawText(issueDateLabel, {
    x: rightLabelX,
    y: y - 28,
    size: 12,
    font: fontRegular,
    color: muted,
  });
  const dateLabel = asciiSafe(formatInvoiceDate(payload.issueDate));
  page.drawText(dateLabel, {
    x: rightValueX - fontRegular.widthOfTextAtSize(dateLabel, 12),
    y: y - 28,
    size: 12,
    font: fontRegular,
    color: dark,
  });

  y -= 110;

  const leftX = margin;
  const rightX = 330;
  page.drawText("Piegadatajs", { x: leftX, y, size: 18, font: fontRegular, color: dark });
  page.drawText("Sanemejs", { x: rightX, y, size: 18, font: fontRegular, color: dark });
  page.drawLine({ start: { x: leftX, y: y - 12 }, end: { x: 315, y: y - 12 }, thickness: 1.2, color: green });
  page.drawLine({ start: { x: rightX, y: y - 12 }, end: { x: 547, y: y - 12 }, thickness: 1.2, color: green });

  y -= 44;
  page.drawText("MDB Group, SIA", { x: leftX, y, size: 16, font: fontBold, color: dark });
  const customerNameLines = wrapText(payload.clientName, 220, fontBold, 16);
  customerNameLines.forEach((line, index) => {
    page.drawText(line, {
      x: rightX,
      y: y - index * 18,
      size: 16,
      font: fontBold,
      color: dark,
    });
  });

  const supplierLines = [
    ["Reg. Nr.:", "40203701967"],
    ["Adrese:", "Jurmala, Skolas iela 30 - 107, LV-2016"],
    ["Talr. Nr.:", "+371 24443333"],
    ["Epasts:", "info@mdbgroup.lv"],
    ["Majaslapa:", "mdbgroup.lv"],
    ["IBAN:", "LV12HABA0551063522870"],
    ["Banka:", 'AS "Swedbank", Kods: HABALV22'],
  ] as const;

  const customerLines = [
    ["Reg. Nr.:", payload.clientRegistrationNumber || "-"],
    ["Adrese:", payload.clientAddress],
    ["Epasts:", payload.clientEmail || "-"],
    ["Talr. Nr.:", payload.clientPhone || "-"],
  ] as const;

  let supplierY = y - 26;
  supplierLines.forEach(([label, value], index) => {
    if (index === 5) {
      page.drawLine({ start: { x: leftX, y: supplierY + 10 }, end: { x: 315, y: supplierY + 10 }, thickness: 1, color: light });
    }
    page.drawText(label, { x: leftX, y: supplierY, size: 10, font: index === 5 ? fontBold : fontRegular, color: muted });
    page.drawText(asciiSafe(value), { x: leftX + 86, y: supplierY, size: 10, font: index === 5 ? fontBold : fontRegular, color: dark });
    supplierY -= 18;
  });

  let customerY = y - 26 - Math.max(0, (customerNameLines.length - 1) * 18);
  customerLines.forEach(([label, value]) => {
    page.drawText(label, { x: rightX, y: customerY, size: 10, font: fontRegular, color: muted });
    const wrapped = wrapText(value, 180, fontRegular, 10);
    wrapped.forEach((line, lineIndex) => {
      page.drawText(line, { x: rightX + 70, y: customerY - lineIndex * 14, size: 10, font: fontRegular, color: dark });
    });
    customerY -= Math.max(18, wrapped.length * 14);
  });

  y = Math.min(supplierY, customerY) - 26;

  page.drawRectangle({
    x: margin,
    y: y - 26,
    width: 499,
    height: 32,
    color: green,
  });

  const headers = [
    { text: "#", x: 58 },
    { text: "Nosaukums", x: 92 },
    { text: "Merv.", x: 390 },
    { text: "Daudz.", x: 435 },
    { text: "Cena", x: 485 },
    { text: "Kopa EUR", x: 525 },
  ];

  headers.forEach((header) => {
    page.drawText(header.text, {
      x: header.x,
      y: y - 15,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  });

  let rowY = y - 52;
  payload.items.forEach((item, index) => {
    page.drawText(`${index + 1}.`, { x: 58, y: rowY, size: 10, font: fontRegular, color: dark });
    page.drawText(asciiSafe(item.name), { x: 92, y: rowY, size: 10, font: fontRegular, color: dark });
    if (item.note) {
      const noteLines = wrapText(item.note, 250, fontRegular, 8);
      noteLines.forEach((line, noteIndex) => {
        page.drawText(line, {
          x: 92,
          y: rowY - 18 - noteIndex * 11,
          size: 8,
          font: fontRegular,
          color: muted,
        });
      });
    }
    page.drawText(asciiSafe(item.unit), { x: 398, y: rowY, size: 10, font: fontRegular, color: dark });
    page.drawText(String(item.quantity), { x: 446, y: rowY, size: 10, font: fontRegular, color: dark });
    page.drawText(eur(item.unitPriceCents), {
      x: 490 - fontRegular.widthOfTextAtSize(eur(item.unitPriceCents), 10),
      y: rowY,
      size: 10,
      font: fontRegular,
      color: dark,
    });
    page.drawText(eur(item.totalPriceCents), {
      x: 540 - fontRegular.widthOfTextAtSize(eur(item.totalPriceCents), 10),
      y: rowY,
      size: 10,
      font: fontRegular,
      color: dark,
    });

    rowY -= item.note ? 44 : 24;
  });

  page.drawLine({ start: { x: margin, y: rowY + 6 }, end: { x: 547, y: rowY + 6 }, thickness: 1, color: light });

  const summaryXLabel = 350;
  const summaryXValue = 545;
  let summaryY = rowY - 28;

  page.drawText("Kopa:", { x: summaryXLabel, y: summaryY, size: 12, font: fontRegular, color: dark });
  const subtotalLabel = `EUR ${eur(payload.subtotalCents)}`;
  page.drawText(subtotalLabel, {
    x: summaryXValue - fontRegular.widthOfTextAtSize(subtotalLabel, 12),
    y: summaryY,
    size: 12,
    font: fontRegular,
    color: dark,
  });

  summaryY -= 22;
  page.drawText("Avansa maksajums:", { x: summaryXLabel, y: summaryY, size: 12, font: fontRegular, color: dark });
  const advanceLabel = `EUR ${eur(payload.advancePaymentCents)}`;
  page.drawText(advanceLabel, {
    x: summaryXValue - fontRegular.widthOfTextAtSize(advanceLabel, 12),
    y: summaryY,
    size: 12,
    font: fontRegular,
    color: dark,
  });

  summaryY -= 28;
  page.drawText("Kopa apmaksai:", { x: summaryXLabel, y: summaryY, size: 14, font: fontBold, color: dark });
  const totalLabel = `EUR ${eur(payload.totalCents)}`;
  page.drawText(totalLabel, {
    x: summaryXValue - fontBold.widthOfTextAtSize(totalLabel, 14),
    y: summaryY,
    size: 14,
    font: fontBold,
    color: dark,
  });
  page.drawLine({ start: { x: summaryXLabel - 2, y: summaryY - 8 }, end: { x: 547, y: summaryY - 8 }, thickness: 1.2, color: green });

  if (payload.amountInWords) {
    summaryY -= 24;
    const amountLines = wrapText(payload.amountInWords, 210, fontRegular, 9);
    amountLines.forEach((line, index) => {
      page.drawText(line, {
        x: summaryXLabel,
        y: summaryY - index * 12,
        size: 9,
        font: fontRegular,
        color: dark,
      });
    });
    summaryY -= amountLines.length * 12;
  }

  if (payload.note) {
    const noteLines = wrapText(payload.note, 220, fontRegular, 8);
    noteLines.forEach((line, index) => {
      page.drawText(line, {
        x: summaryXLabel,
        y: summaryY - 22 - index * 10,
        size: 8,
        font: fontRegular,
        color: muted,
      });
    });
  }

  page.drawLine({ start: { x: margin, y: 92 }, end: { x: 547, y: 92 }, thickness: 1.2, color: green });
  const footer = "Dokuments ir elektroniski sastadits un derigs bez paraksta atbilstosi Gramatvedibas likuma 11.panta 7.dalas 1.punktam";
  const footerLines = wrapText(footer, 420, fontRegular, 8);
  footerLines.forEach((line, index) => {
    page.drawText(line, {
      x: 297.5 - fontRegular.widthOfTextAtSize(line, 8) / 2,
      y: 62 - index * 12,
      size: 8,
      font: fontRegular,
      color: muted,
    });
  });

  const bytes = await pdfDoc.save();
  return {
    bytes,
    fileName: sanitizeInvoiceFilename(payload.invoiceNumber || "invoice"),
  };
}
