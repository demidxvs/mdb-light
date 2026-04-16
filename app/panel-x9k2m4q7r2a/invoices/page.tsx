"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCopy,
  Download,
  FileText,
  LoaderCircle,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import {
  buildNextInvoiceNumber,
  centsToDecimalString,
  decimalStringToCents,
  formatInvoiceMoney,
  sanitizeInvoiceFilename,
  type InvoiceFormState,
  type InvoiceLineDraft,
  type InvoiceStatus,
} from "@/lib/invoices";
import { deleteAdminInvoicePdf, getAdminInvoicePdfUrl, uploadAdminInvoicePdf } from "@/lib/storage";

type InvoiceRow = {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: InvoiceStatus;
  client_name: string;
  pdf_path: string | null;
  pdf_generated_at: string | null;
};

type ProductOption = {
  id: string;
  sku: string;
  currency: string;
  priceCents: number;
  name: string;
};

const copy = {
  en: {
    top: "Protected invoice builder area",
    title: "Invoice Builder",
    description: "Assemble a client invoice from products, edit prices, save drafts, and generate a PDF file.",
    loading: "Loading invoice builder...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    search: "Search products",
    noProducts: "No products found.",
    add: "Add",
    lines: "Invoice lines",
    customer: "Customer",
    invoice: "Invoice",
    totals: "Totals",
    empty: "Add products from the list to start the invoice.",
    clientName: "Client name",
    clientRegistrationNumber: "Registration number",
    clientAddress: "Address",
    clientEmail: "Email",
    clientPhone: "Phone",
    invoiceNumber: "Invoice number",
    issueDate: "Issue date",
    status: "Status",
    advance: "Advance payment",
    amountInWords: "Amount in words",
    note: "Additional text / note",
    save: "Save draft",
    saving: "Saving...",
    generate: "Generate PDF",
    generating: "Generating PDF...",
    reset: "New invoice",
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    product: "Product",
    unit: "Unit",
    quantity: "Qty",
    price: "Price",
    lineTotal: "Total",
    remove: "Remove",
    subtotal: "Subtotal",
    payable: "Payable",
    saveSuccess: "Invoice saved.",
    validation: "Fill in client name, address, and add at least one line.",
    pdfError: "Could not generate PDF.",
    recent: "Recent invoices",
    searchRecent: "Search recent invoices",
    pdfReady: "PDF saved",
    openPdf: "Open PDF",
    deletePdf: "Delete PDF",
    deletingPdf: "Deleting PDF...",
    pdfSaved: "PDF saved.",
    pdfDeleted: "PDF deleted.",
    copyCartLink: "Copy cart link",
    copyingCartLink: "Preparing cart link...",
    cartLinkCopied: "Cart link copied.",
    cartLinkError: "Could not create cart link.",
  },
  ru: {
    top: "Защищенная зона создания счетов",
    title: "Создание счета",
    description: "Собирайте счет для клиента из товаров, меняйте цены, сохраняйте черновики и генерируйте PDF.",
    loading: "Загружаю конструктор счета...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    search: "Поиск товаров",
    noProducts: "Товары не найдены.",
    add: "Добавить",
    lines: "Строки счета",
    customer: "Клиент",
    invoice: "Счет",
    totals: "Итоги",
    empty: "Добавьте товары из списка, чтобы собрать счет.",
    clientName: "Название клиента",
    clientRegistrationNumber: "Рег. номер",
    clientAddress: "Адрес",
    clientEmail: "Email",
    clientPhone: "Телефон",
    invoiceNumber: "Номер счета",
    issueDate: "Дата",
    status: "Статус",
    advance: "Аванс",
    amountInWords: "Сумма прописью",
    note: "Дополнительный текст / примечание",
    save: "Сохранить черновик",
    saving: "Сохраняю...",
    generate: "Сгенерировать PDF",
    generating: "Генерирую PDF...",
    reset: "Новый счет",
    draft: "Черновик",
    sent: "Отправлен",
    paid: "Оплачен",
    product: "Товар",
    unit: "Ед.",
    quantity: "Кол-во",
    price: "Цена",
    lineTotal: "Сумма",
    remove: "Удалить",
    subtotal: "Сумма",
    payable: "К оплате",
    saveSuccess: "Счет сохранен.",
    validation: "Заполните клиента, адрес и добавьте хотя бы одну строку.",
    pdfError: "Не удалось сгенерировать PDF.",
    recent: "Последние счета",
    searchRecent: "Поиск по последним счетам",
    pdfReady: "PDF сохранен",
    openPdf: "Открыть PDF",
    deletePdf: "Удалить PDF",
    deletingPdf: "Удаляю PDF...",
    pdfSaved: "PDF сохранен.",
    pdfDeleted: "PDF удален.",
    copyCartLink: "Скопировать ссылку на корзину",
    copyingCartLink: "Готовлю ссылку на корзину...",
    cartLinkCopied: "Ссылка на корзину скопирована.",
    cartLinkError: "Не удалось создать ссылку на корзину.",
  },
  el: {
    top: "Protected invoice builder area",
    title: "Invoice Builder",
    description: "Assemble a client invoice from products, edit prices, save drafts, and generate a PDF file.",
    loading: "Loading invoice builder...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    search: "Search products",
    noProducts: "No products found.",
    add: "Add",
    lines: "Invoice lines",
    customer: "Customer",
    invoice: "Invoice",
    totals: "Totals",
    empty: "Add products from the list to start the invoice.",
    clientName: "Client name",
    clientRegistrationNumber: "Registration number",
    clientAddress: "Address",
    clientEmail: "Email",
    clientPhone: "Phone",
    invoiceNumber: "Invoice number",
    issueDate: "Issue date",
    status: "Status",
    advance: "Advance payment",
    amountInWords: "Amount in words",
    note: "Additional text / note",
    save: "Save draft",
    saving: "Saving...",
    generate: "Generate PDF",
    generating: "Generating PDF...",
    reset: "New invoice",
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    product: "Product",
    unit: "Unit",
    quantity: "Qty",
    price: "Price",
    lineTotal: "Total",
    remove: "Remove",
    subtotal: "Subtotal",
    payable: "Payable",
    saveSuccess: "Invoice saved.",
    validation: "Fill in client name, address, and add at least one line.",
    pdfError: "Could not generate PDF.",
    recent: "Recent invoices",
    searchRecent: "Search recent invoices",
    pdfReady: "PDF saved",
    openPdf: "Open PDF",
    deletePdf: "Delete PDF",
    deletingPdf: "Deleting PDF...",
    pdfSaved: "PDF saved.",
    pdfDeleted: "PDF deleted.",
    copyCartLink: "Copy cart link",
    copyingCartLink: "Preparing cart link...",
    cartLinkCopied: "Cart link copied.",
    cartLinkError: "Could not create cart link.",
  },
  lv: {
    top: "Aizsargāta rēķinu veidošanas zona",
    title: "Rēķinu veidošana",
    description: "Salieciet klienta rēķinu no produktiem, koriģējiet cenas, saglabājiet melnrakstus un ģenerējiet PDF.",
    loading: "Ielādē rēķinu veidotāju...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    search: "Produktu meklēšana",
    noProducts: "Produkti nav atrasti.",
    add: "Pievienot",
    lines: "Rēķina rindas",
    customer: "Saņēmējs",
    invoice: "Rēķins",
    totals: "Kopsavilkums",
    empty: "Pievienojiet produktus no saraksta, lai izveidotu rēķinu.",
    clientName: "Klienta nosaukums",
    clientRegistrationNumber: "Reģ. numurs",
    clientAddress: "Adrese",
    clientEmail: "Epasts",
    clientPhone: "Tālrunis",
    invoiceNumber: "Rēķina numurs",
    issueDate: "Datums",
    status: "Statuss",
    advance: "Avansa maksājums",
    amountInWords: "Summa vārdiem",
    note: "Papildu teksts / piezīme",
    save: "Saglabāt melnrakstu",
    saving: "Saglabā...",
    generate: "Ģenerēt PDF",
    generating: "Ģenerē PDF...",
    reset: "Jauns rēķins",
    draft: "Melnraksts",
    sent: "Nosūtīts",
    paid: "Apmaksāts",
    product: "Nosaukums",
    unit: "Mērv.",
    quantity: "Daudz.",
    price: "Cena",
    lineTotal: "Kopā",
    remove: "Dzēst",
    subtotal: "Kopā",
    payable: "Kopā apmaksai",
    saveSuccess: "Rēķins saglabāts.",
    validation: "Aizpildiet klientu, adresi un pievienojiet vismaz vienu rindu.",
    pdfError: "Neizdevās ģenerēt PDF.",
    recent: "Pēdējie rēķini",
    searchRecent: "Meklēt pēdējos rēķinus",
    pdfReady: "PDF saglabāts",
    openPdf: "Atvērt PDF",
    deletePdf: "Dzēst PDF",
    deletingPdf: "Dzēš PDF...",
    pdfSaved: "PDF saglabāts.",
    pdfDeleted: "PDF izdzēsts.",
    copyCartLink: "Kopēt groza saiti",
    copyingCartLink: "Sagatavo groza saiti...",
    cartLinkCopied: "Groza saite nokopēta.",
    cartLinkError: "Neizdevās izveidot groza saiti.",
  },
} as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function makeEmptyForm(invoiceNumber: string): InvoiceFormState {
  return {
    invoiceNumber,
    issueDate: todayIso(),
    status: "draft",
    clientName: "",
    clientRegistrationNumber: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    amountInWords: "",
    advancePaymentCents: 0,
    note: "",
  };
}

function createLine(product: ProductOption): InvoiceLineDraft {
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    sku: product.sku,
    name: product.name,
    unit: "gab",
    quantity: 1,
    unitPriceCents: product.priceCents,
    note: "",
  };
}

export default function AdminInvoicesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceRow[]>([]);
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<InvoiceLineDraft[]>([]);
  const [form, setForm] = useState<InvoiceFormState>(() => makeEmptyForm(`1_${new Date().getFullYear()}`));
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingPdfId, setDeletingPdfId] = useState<string | null>(null);
  const [copyingCartLinkId, setCopyingCartLinkId] = useState<string | null>(null);
  const [recentQuery, setRecentQuery] = useState("");

  const loadBuilderData = useCallback(async () => {
    const response = await fetch(`/api/admin/invoices?locale=${locale}`, {
      credentials: "include",
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      products?: ProductOption[];
      recentInvoices?: InvoiceRow[];
    };

    if (response.status === 401) {
      setError(t.signIn);
      setIsAdmin(false);
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return [];
    }

    if (response.status === 403) {
      setError(t.noAccess);
      setIsAdmin(false);
      return [];
    }

    if (!response.ok) {
      setError(payload.error || t.pdfError);
      return [];
    }

    const nextInvoices = payload.recentInvoices ?? [];
    setProducts(payload.products ?? []);
    setRecentInvoices(nextInvoices);
    setIsAdmin(true);
    return nextInvoices;
  }, [locale, router, t.noAccess, t.pdfError, t.signIn]);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const loadedInvoices = await loadBuilderData();
      if (!mounted) return;
      const nextInvoiceNumber = buildNextInvoiceNumber(
        (loadedInvoices ?? []).map((item) => item.invoice_number),
        todayIso(),
      );
      setForm(makeEmptyForm(nextInvoiceNumber));
      if (mounted) {
        setLoading(false);
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [loadBuilderData]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products.slice(0, 12);
    return products
      .filter((product) => product.name.toLowerCase().includes(normalized) || product.sku.toLowerCase().includes(normalized))
      .slice(0, 12);
  }, [products, query]);

  const subtotalCents = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0),
    [lines],
  );
  const payableCents = Math.max(subtotalCents - form.advancePaymentCents, 0);

  const addProduct = (product: ProductOption) => {
    setLines((current) => [...current, createLine(product)]);
  };

  const updateLine = (lineId: string, patch: Partial<InvoiceLineDraft>) => {
    setLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    );
  };

  const resetBuilder = () => {
    const nextNumber = buildNextInvoiceNumber(recentInvoices.map((item) => item.invoice_number), todayIso());
    setCurrentInvoiceId(null);
    setLines([]);
    setSuccess("");
    setError("");
    setForm(makeEmptyForm(nextNumber));
  };

  const currentInvoice = useMemo(
    () => recentInvoices.find((invoice) => invoice.id === currentInvoiceId) ?? null,
    [currentInvoiceId, recentInvoices],
  );

  const filteredRecentInvoices = useMemo(() => {
    const normalized = recentQuery.trim().toLowerCase();
    if (!normalized) return recentInvoices;

    return recentInvoices.filter((invoice) =>
      [invoice.invoice_number, invoice.client_name, invoice.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [recentInvoices, recentQuery]);

  const persistInvoice = async () => {
    if (!form.clientName.trim() || !form.clientAddress.trim() || lines.length === 0) {
      throw new Error(t.validation);
    }

    const response = await fetch("/api/admin/invoices", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentInvoiceId,
        form,
        lines,
        locale,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      invoiceId?: string;
    };

    if (!response.ok || !payload.invoiceId) {
      throw new Error(payload.error || t.validation);
    }

    const invoiceId = payload.invoiceId;
    setCurrentInvoiceId(invoiceId);
    await loadBuilderData();
    setSuccess(t.saveSuccess);
    return invoiceId;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await persistInvoice();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    setError("");
    setSuccess("");
    setGenerating(true);

    try {
      const invoiceId = await persistInvoice();

      const payload = {
        invoiceNumber: form.invoiceNumber.trim(),
        issueDate: form.issueDate,
        clientName: form.clientName.trim(),
        clientRegistrationNumber: form.clientRegistrationNumber.trim(),
        clientAddress: form.clientAddress.trim(),
        clientEmail: form.clientEmail.trim(),
        clientPhone: form.clientPhone.trim(),
        amountInWords: form.amountInWords.trim(),
        advancePaymentCents: form.advancePaymentCents,
        subtotalCents,
        totalCents: payableCents,
        note: form.note.trim(),
        items: lines.map((line) => ({
          name: line.name,
          unit: line.unit,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
          totalPriceCents: line.quantity * line.unitPriceCents,
          note: line.note,
        })),
      };

      const response = await fetch("/api/admin/invoices/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message: string = t.pdfError;
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) {
            message = data.error;
          }
        } catch {}
        throw new Error(message);
      }

      const blob = await response.blob();
      const { path } = await uploadAdminInvoicePdf({
        invoiceId,
        file: blob,
      });

      const updateResponse = await fetch("/api/admin/invoices", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoiceId,
          pdfPath: path,
          pdfGeneratedAt: new Date().toISOString(),
        }),
      });
      const updatePayload = (await updateResponse.json().catch(() => ({}))) as { error?: string };

      if (!updateResponse.ok) {
        throw new Error(updatePayload.error || t.pdfError);
      }

      await loadBuilderData();
      setSuccess(t.pdfSaved);

      const blobUrl = URL.createObjectURL(blob);
      const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");

      if (!opened) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${sanitizeInvoiceFilename(form.invoiceNumber)}.pdf`;
        link.click();
      }

      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    } catch (pdfError) {
      setError(pdfError instanceof Error ? pdfError.message : t.pdfError);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenPdf = async (invoice: InvoiceRow) => {
    if (!invoice.pdf_path) return;
    setError("");
    setSuccess("");

    try {
      const signedUrl = await getAdminInvoicePdfUrl(invoice.pdf_path);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (pdfOpenError) {
      setError(pdfOpenError instanceof Error ? pdfOpenError.message : t.pdfError);
    }
  };

  const handleDeletePdf = async (invoice: InvoiceRow) => {
    if (!invoice.pdf_path) return;
    setError("");
    setSuccess("");
    setDeletingPdfId(invoice.id);

    try {
      await deleteAdminInvoicePdf(invoice.pdf_path);
      const response = await fetch("/api/admin/invoices", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoice.id,
          pdfPath: null,
          pdfGeneratedAt: null,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || t.pdfError);
      }

      await loadBuilderData();
      setSuccess(t.pdfDeleted);
    } catch (pdfDeleteError) {
      setError(pdfDeleteError instanceof Error ? pdfDeleteError.message : t.pdfError);
    } finally {
      setDeletingPdfId(null);
    }
  };

  const handleCopyCartLink = async (invoiceId?: string | null) => {
    setError("");
    setSuccess("");
    setCopyingCartLinkId(invoiceId || currentInvoiceId || "draft");

    try {
      const nextInvoiceId = invoiceId || (await persistInvoice());
      const response = await fetch("/api/admin/invoices/cart-link", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: nextInvoiceId,
          locale,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        cartUrl?: string;
      };

      if (!response.ok || !payload.cartUrl) {
        throw new Error(payload.error || t.cartLinkError);
      }

      await navigator.clipboard.writeText(payload.cartUrl);
      setSuccess(t.cartLinkCopied);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : t.cartLinkError);
    } finally {
      setCopyingCartLinkId(null);
    }
  };

  return (
    <AdminShell topLabel={t.top} title={t.title} description={t.description}>
      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[1.75rem] border border-[#ece3d9] bg-white shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
          <div className="flex items-center gap-3 text-sm font-medium text-[color:var(--muted)]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[color:var(--headline)]" />
            {t.loading}
          </div>
        </div>
      ) : !isAdmin ? (
        <div className="rounded-[1.75rem] border border-[#f1d7ca] bg-[#fff7f2] p-8 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffe2d8] text-[#af4b2b]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.denied}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={localizePathname("/panel-x9k2m4q7r2a", locale)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Link>
            <button type="button" onClick={resetBuilder} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
              <FileText className="h-4 w-4" />
              {t.reset}
            </button>
          </div>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
            <div className="space-y-6">
              <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
                <div className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3">
                  <Search className="h-4 w-4 text-[color:var(--muted)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t.search}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--muted)]"
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#ece3d9] px-4 py-5 text-sm text-[color:var(--muted)]">
                      {t.noProducts}
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-4 text-left transition hover:border-[color:var(--accent)]/35"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[color:var(--headline)]">{product.name}</p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">{product.sku}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-medium text-[color:var(--headline)]">{formatInvoiceMoney(product.priceCents, product.currency)}</span>
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--accent)] text-[#203153]">
                            <Plus className="h-4 w-4" />
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.lines}</h2>
                {lines.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#ece3d9] px-4 py-8 text-sm text-[color:var(--muted)]">
                    {t.empty}
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {lines.map((line) => (
                      <article key={line.id} className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-4">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_120px_100px_140px_120px_44px]">
                          <div>
                            <label className="text-xs font-medium text-[color:var(--muted)]">{t.product}</label>
                            <input
                              value={line.name}
                              onChange={(event) => updateLine(line.id, { name: event.target.value })}
                              className="mt-2 h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 text-sm outline-none focus:border-[color:var(--accent)]"
                            />
                            <input
                              value={line.note}
                              onChange={(event) => updateLine(line.id, { note: event.target.value })}
                              placeholder="Garantija / note"
                              className="mt-2 h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 text-sm outline-none focus:border-[color:var(--accent)]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[color:var(--muted)]">{t.unit}</label>
                            <input
                              value={line.unit}
                              onChange={(event) => updateLine(line.id, { unit: event.target.value })}
                              className="mt-2 h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 text-sm outline-none focus:border-[color:var(--accent)]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[color:var(--muted)]">{t.quantity}</label>
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(event) => updateLine(line.id, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                              className="mt-2 h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 text-sm outline-none focus:border-[color:var(--accent)]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[color:var(--muted)]">{t.price}</label>
                            <input
                              value={centsToDecimalString(line.unitPriceCents)}
                              onChange={(event) => updateLine(line.id, { unitPriceCents: decimalStringToCents(event.target.value) })}
                              className="mt-2 h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 text-sm outline-none focus:border-[color:var(--accent)]"
                            />
                            <p className="mt-2 text-xs text-[color:var(--muted)]">{line.sku}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-[color:var(--muted)]">{t.lineTotal}</label>
                            <div className="mt-2 flex h-11 items-center rounded-xl border border-[#ece3d9] bg-white px-4 text-sm font-semibold text-[color:var(--headline)]">
                              {formatInvoiceMoney(line.quantity * line.unitPriceCents)}
                            </div>
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.customer}</h2>
                <div className="mt-4 space-y-3">
                  <input value={form.clientName} onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))} placeholder={t.clientName} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <input value={form.clientRegistrationNumber} onChange={(event) => setForm((current) => ({ ...current, clientRegistrationNumber: event.target.value }))} placeholder={t.clientRegistrationNumber} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <textarea value={form.clientAddress} onChange={(event) => setForm((current) => ({ ...current, clientAddress: event.target.value }))} placeholder={t.clientAddress} className="min-h-[88px] w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <input value={form.clientEmail} onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))} placeholder={t.clientEmail} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <input value={form.clientPhone} onChange={(event) => setForm((current) => ({ ...current, clientPhone: event.target.value }))} placeholder={t.clientPhone} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]" />
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.invoice}</h2>
                <div className="mt-4 space-y-3">
                  <input value={form.invoiceNumber} onChange={(event) => setForm((current) => ({ ...current, invoiceNumber: event.target.value }))} placeholder={t.invoiceNumber} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <input type="date" value={form.issueDate} onChange={(event) => setForm((current) => ({ ...current, issueDate: event.target.value, invoiceNumber: buildNextInvoiceNumber(recentInvoices.map((item) => item.invoice_number), event.target.value) }))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as InvoiceStatus }))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]">
                    <option value="draft">{t.draft}</option>
                    <option value="sent">{t.sent}</option>
                    <option value="paid">{t.paid}</option>
                  </select>
                  <input value={centsToDecimalString(form.advancePaymentCents)} onChange={(event) => setForm((current) => ({ ...current, advancePaymentCents: decimalStringToCents(event.target.value) }))} placeholder={t.advance} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <textarea value={form.amountInWords} onChange={(event) => setForm((current) => ({ ...current, amountInWords: event.target.value }))} placeholder={t.amountInWords} className="min-h-[76px] w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" />
                  <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder={t.note} className="min-h-[96px] w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]" />
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.totals}</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[color:var(--muted)]">
                    <span>{t.subtotal}</span>
                    <span>{formatInvoiceMoney(subtotalCents)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[color:var(--muted)]">
                    <span>{t.advance}</span>
                    <span>-{formatInvoiceMoney(form.advancePaymentCents)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#ece3d9] pt-3 text-base font-semibold text-[color:var(--headline)]">
                    <span>{t.payable}</span>
                    <span>{formatInvoiceMoney(payableCents)}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <button type="button" onClick={() => void handleGeneratePdf()} disabled={saving || generating} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] disabled:cursor-not-allowed disabled:opacity-70">
                    {generating ? t.generating : t.generate}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyCartLink()}
                    disabled={saving || generating || copyingCartLinkId !== null}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-5 text-sm font-medium text-[color:var(--headline)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    {copyingCartLinkId ? t.copyingCartLink : t.copyCartLink}
                  </button>
                  {currentInvoice?.pdf_path ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button type="button" onClick={() => void handleOpenPdf(currentInvoice)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)]">
                        <Download className="h-4 w-4" />
                        {t.openPdf}
                      </button>
                      <button type="button" onClick={() => void handleDeletePdf(currentInvoice)} disabled={deletingPdfId === currentInvoice.id} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-70">
                        {deletingPdfId === currentInvoice.id ? t.deletingPdf : t.deletePdf}
                      </button>
                    </div>
                  ) : null}
                  <button type="button" onClick={() => void handleSave()} disabled={saving || generating} className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] disabled:cursor-not-allowed disabled:opacity-70">
                    {saving ? t.saving : t.save}
                  </button>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-5 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.recent}</h2>
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3">
                  <Search className="h-4 w-4 text-[color:var(--muted)]" />
                  <input
                    value={recentQuery}
                    onChange={(event) => setRecentQuery(event.target.value)}
                    placeholder={t.searchRecent}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--muted)]"
                  />
                </div>
                <div className="mt-4 space-y-3">
                  {filteredRecentInvoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[color:var(--headline)]">{invoice.invoice_number}</p>
                          <p className="mt-1 truncate text-xs text-[color:var(--muted)]">{invoice.client_name}</p>
                        {invoice.pdf_path ? <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-600">{t.pdfReady}</p> : null}
                      </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCopyCartLink(invoice.id)}
                            disabled={copyingCartLinkId === invoice.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ece3d9] bg-white text-[color:var(--headline)] disabled:cursor-not-allowed disabled:opacity-70"
                            title={t.copyCartLink}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </button>
                          {invoice.pdf_path ? (
                            <>
                              <button type="button" onClick={() => void handleOpenPdf(invoice)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ece3d9] bg-white text-[color:var(--headline)]">
                                <Download className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => void handleDeletePdf(invoice)} disabled={deletingPdfId === invoice.id} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 disabled:cursor-not-allowed disabled:opacity-70">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
