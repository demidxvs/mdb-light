"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, PencilLine, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import {
  getLocalizedAttributeOptionLabel,
  normalizeAttributeOptionValues,
  type RawAttributeOptionValue,
} from "@/lib/attribute-options";
import { localizePathname } from "@/i18n/config";
import { slugify } from "@/lib/product-utils";

type LocaleKey = "ru" | "en" | "lv" | "el";
type AttributeRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  name_lv: string;
  name_el: string;
  value_type: "text" | "boolean" | "multi_select";
  option_values: RawAttributeOptionValue[] | null;
  created_at: string;
};

type AttributeOptionFormRow = {
  slug: string;
  labelRu: string;
  labelEn: string;
  labelLv: string;
  labelEl: string;
};

type FormState = {
  slug: string;
  nameRu: string;
  nameEn: string;
  nameLv: string;
  nameEl: string;
  valueType: "text" | "boolean" | "multi_select";
  options: AttributeOptionFormRow[];
};

const initialForm: FormState = {
  slug: "",
  nameRu: "",
  nameEn: "",
  nameLv: "",
  nameEl: "",
  valueType: "text",
  options: [],
};

const labels: Record<LocaleKey, string> = {
  ru: "Русский",
  en: "English",
  lv: "Latviešu",
  el: "Ελληνικά",
};

const fieldMap = {
  ru: "nameRu",
  en: "nameEn",
  lv: "nameLv",
  el: "nameEl",
} as const;

const copy = {
  en: {
    top: "Protected attributes management area",
    title: "Attributes",
    description: "Create reusable product attributes and then assign them to catalog items.",
    loading: "Loading attributes...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    formEyebrow: "Attribute form",
    formTitleCreate: "Create attribute",
    formTitleEdit: "Edit attribute",
    save: "Save attribute",
    update: "Update attribute",
    saving: "Saving...",
    cancel: "Cancel edit",
    listEyebrow: "Attribute list",
    listTitle: "Existing attributes",
    empty: "No attributes yet.",
    created: "Attribute created.",
    updated: "Attribute updated.",
    deleted: "Attribute deleted.",
    genericError: "Could not save the attribute.",
    deleteError: "Could not delete the attribute.",
    required: "Fill all 4 names.",
    slug: "Slug",
    slugHint: "Unique technical id used in product logic.",
    duplicateSlug: "This slug already exists. Change it or edit the existing attribute.",
    type: "Value type",
    typeText: "Free text",
    typeBoolean: "Included / not included",
    typeMultiSelect: "Choose from list",
    options: "Options",
    optionsHint: "Add translated option rows. These values will be available for product selection.",
    presetColors: "Use black, white, gray",
    addOption: "Add option",
    optionSlug: "Option slug",
    currentType: "Type",
    actions: "Actions",
    remove: "Delete",
    edit: "Edit",
  },
  ru: {
    top: "Защищенная зона управления характеристиками",
    title: "Характеристики",
    description: "Создавайте универсальные характеристики и затем привязывайте их к товарам каталога.",
    loading: "Загружаю характеристики...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    formEyebrow: "Форма характеристики",
    formTitleCreate: "Создать характеристику",
    formTitleEdit: "Редактировать характеристику",
    save: "Сохранить характеристику",
    update: "Обновить характеристику",
    saving: "Сохраняю...",
    cancel: "Отменить редактирование",
    listEyebrow: "Список характеристик",
    listTitle: "Существующие характеристики",
    empty: "Характеристик пока нет.",
    created: "Характеристика создана.",
    updated: "Характеристика обновлена.",
    deleted: "Характеристика удалена.",
    genericError: "Не удалось сохранить характеристику.",
    deleteError: "Не удалось удалить характеристику.",
    required: "Заполните названия на всех 4 языках.",
    slug: "Slug",
    slugHint: "Уникальный технический идентификатор, который используется в логике товара.",
    duplicateSlug: "Такой slug уже существует. Измените его или отредактируйте существующую характеристику.",
    type: "Тип значения",
    typeText: "Свободный текст",
    typeBoolean: "Идет в комплект / нет",
    typeMultiSelect: "Выбор из списка",
    options: "Варианты",
    optionsHint: "Добавляйте варианты отдельными строками с переводами. Эти значения потом можно будет выбирать у товара.",
    presetColors: "Подставить черный, белый, серый",
    addOption: "Добавить вариант",
    optionSlug: "Slug варианта",
    currentType: "Тип",
    actions: "Действия",
    remove: "Удалить",
    edit: "Редактировать",
  },
  el: {
    top: "Προστατευμένη διαχείριση χαρακτηριστικών",
    title: "Χαρακτηριστικά",
    description: "Δημιουργήστε επαναχρησιμοποιήσιμα χαρακτηριστικά και συνδέστε τα με προϊόντα.",
    loading: "Φόρτωση χαρακτηριστικών...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στο dashboard",
    formEyebrow: "Φόρμα χαρακτηριστικού",
    formTitleCreate: "Δημιουργία χαρακτηριστικού",
    formTitleEdit: "Επεξεργασία χαρακτηριστικού",
    save: "Αποθήκευση χαρακτηριστικού",
    update: "Ενημέρωση χαρακτηριστικού",
    saving: "Αποθήκευση...",
    cancel: "Ακύρωση επεξεργασίας",
    listEyebrow: "Λίστα χαρακτηριστικών",
    listTitle: "Υπάρχοντα χαρακτηριστικά",
    empty: "Δεν υπάρχουν ακόμη χαρακτηριστικά.",
    created: "Το χαρακτηριστικό δημιουργήθηκε.",
    updated: "Το χαρακτηριστικό ενημερώθηκε.",
    deleted: "Το χαρακτηριστικό διαγράφηκε.",
    genericError: "Δεν ήταν δυνατή η αποθήκευση του χαρακτηριστικού.",
    deleteError: "Δεν ήταν δυνατή η διαγραφή του χαρακτηριστικού.",
    required: "Συμπληρώστε και τα 4 ονόματα.",
    slug: "Slug",
    slugHint: "Μοναδικό τεχνικό αναγνωριστικό που χρησιμοποιείται στη λογική προϊόντων.",
    duplicateSlug: "Αυτό το slug υπάρχει ήδη. Αλλάξτε το ή επεξεργαστείτε το υπάρχον χαρακτηριστικό.",
    type: "Τύπος τιμής",
    typeText: "Ελεύθερο κείμενο",
    typeBoolean: "Περιλαμβάνεται / δεν περιλαμβάνεται",
    typeMultiSelect: "Επιλογή από λίστα",
    options: "Επιλογές",
    optionsHint: "Προσθέστε ξεχωριστές γραμμές επιλογών με μεταφράσεις. Αυτές οι τιμές θα χρησιμοποιούνται στα προϊόντα.",
    presetColors: "Μαύρο, λευκό, γκρι",
    addOption: "Προσθήκη επιλογής",
    optionSlug: "Slug επιλογής",
    currentType: "Τύπος",
    actions: "Ενέργειες",
    remove: "Διαγραφή",
    edit: "Επεξεργασία",
  },
  lv: {
    top: "Aizsargāta raksturlielumu pārvaldība",
    title: "Raksturlielumi",
    description: "Izveidojiet atkārtoti izmantojamus raksturlielumus un piesaistiet tos produktiem.",
    loading: "Ielādē raksturlielumus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    formEyebrow: "Raksturlieluma forma",
    formTitleCreate: "Izveidot raksturlielumu",
    formTitleEdit: "Rediģēt raksturlielumu",
    save: "Saglabāt raksturlielumu",
    update: "Atjaunināt raksturlielumu",
    saving: "Saglabā...",
    cancel: "Atcelt rediģēšanu",
    listEyebrow: "Raksturlielumu saraksts",
    listTitle: "Esošie raksturlielumi",
    empty: "Raksturlielumu vēl nav.",
    created: "Raksturlielums izveidots.",
    updated: "Raksturlielums atjaunināts.",
    deleted: "Raksturlielums izdzēsts.",
    genericError: "Neizdevās saglabāt raksturlielumu.",
    deleteError: "Neizdevās dzēst raksturlielumu.",
    required: "Aizpildiet nosaukumus visās 4 valodās.",
    slug: "Slug",
    slugHint: "Unikāls tehniskais identifikators, ko izmanto produktu loģikā.",
    duplicateSlug: "Šāds slug jau pastāv. Mainiet to vai rediģējiet esošo raksturlielumu.",
    type: "Vērtības tips",
    typeText: "Brīvs teksts",
    typeBoolean: "Iekļauts / nav iekļauts",
    typeMultiSelect: "Izvēle no saraksta",
    options: "Varianti",
    optionsHint: "Pievienojiet atsevišķas variantu rindas ar tulkojumiem. Šīs vērtības pēc tam varēs izvēlēties pie produkta.",
    presetColors: "Melns, balts, pelēks",
    addOption: "Pievienot variantu",
    optionSlug: "Varianta slug",
    currentType: "Tips",
    actions: "Darbības",
    remove: "Dzēst",
    edit: "Rediģēt",
  },
} as const;

function createEmptyOption(): AttributeOptionFormRow {
  return {
    slug: "",
    labelRu: "",
    labelEn: "",
    labelLv: "",
    labelEl: "",
  };
}

function toFormOptions(options: RawAttributeOptionValue[] | null | undefined) {
  return normalizeAttributeOptionValues(options).map((option) => ({
    slug: option.slug,
    labelRu: option.label_ru,
    labelEn: option.label_en,
    labelLv: option.label_lv,
    labelEl: option.label_el,
  }));
}

function ensureOptionRows(options: AttributeOptionFormRow[] | null | undefined) {
  return Array.isArray(options) ? options : [];
}

function getTypeLabel(
  type: AttributeRow["value_type"],
  t: (typeof copy)[LocaleKey],
) {
  if (type === "boolean") return t.typeBoolean;
  if (type === "multi_select") return t.typeMultiSelect;
  return t.typeText;
}

export default function AdminAttributesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState(supabaseReady ? "" : "Supabase is not configured.");
  const [success, setSuccess] = useState("");

  const loadAttributes = async () => {
    const response = await fetch("/api/admin/attributes", {
      credentials: "include",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      attributes?: AttributeRow[];
    };

    if (response.status === 401) {
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    if (!response.ok) {
      setError(payload.error || t.noAccess);
      return;
    }

    setAttributes(payload.attributes ?? []);
  };

  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    const hydrate = async () => {
      const response = await fetch("/api/admin/attributes", {
        credentials: "include",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        attributes?: AttributeRow[];
      };

      if (!mounted) return;
      if (response.status === 401) {
        setError(t.signIn);
        setLoading(false);
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        setError(payload.error || t.noAccess);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setAttributes(payload.attributes ?? []);
      if (mounted) {
        setLoading(false);
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, router, supabaseReady, t.noAccess, t.signIn]);

  const setFormField = (field: keyof FormState, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "nameEn" && !current.slug.trim()) {
        next.slug = slugify(value);
      }

      if (field === "nameRu" && !current.slug.trim() && !next.slug.trim()) {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const updateOptionField = (
    index: number,
    field: keyof AttributeOptionFormRow,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      options: ensureOptionRows(current.options).map((option, optionIndex) => {
        if (optionIndex !== index) return option;

        const nextOption = {
          ...option,
          [field]: value,
        };

        if (
          (field === "labelEn" || field === "labelRu") &&
          !option.slug.trim()
        ) {
          nextOption.slug =
            slugify(field === "labelEn" ? value : nextOption.labelEn) ||
            slugify(field === "labelRu" ? value : nextOption.labelRu) ||
            option.slug;
        }

        return nextOption;
      }),
    }));
  };

  const addOptionRow = () => {
    setForm((current) => ({
      ...current,
      options: [...ensureOptionRows(current.options), createEmptyOption()],
    }));
  };

  const removeOptionRow = (index: number) => {
    setForm((current) => ({
      ...current,
      options: ensureOptionRows(current.options).filter((_, optionIndex) => optionIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nameRu.trim() || !form.nameEn.trim() || !form.nameLv.trim() || !form.nameEl.trim()) {
      setError(t.required);
      return;
    }

    const slug =
      slugify(form.slug) ||
      slugify(form.nameEn) ||
      slugify(form.nameRu) ||
      `attribute-${Date.now()}`;
    setSubmitting(true);

    try {
      const payload = {
        id: editingId,
        slug,
        nameRu: form.nameRu.trim(),
        nameEn: form.nameEn.trim(),
        nameLv: form.nameLv.trim(),
        nameEl: form.nameEl.trim(),
        valueType: form.valueType,
        optionValues:
          form.valueType === "multi_select"
            ? form.options.map((option) => ({
                slug:
                  slugify(option.slug) ||
                  slugify(option.labelEn) ||
                  slugify(option.labelRu),
                labelRu: option.labelRu.trim(),
                labelEn: option.labelEn.trim(),
                labelLv: option.labelLv.trim(),
                labelEl: option.labelEl.trim(),
              }))
            : [],
      };

      const response = await fetch("/api/admin/attributes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        if ((result.error || "").includes("attributes_slug_key")) {
          setError(t.duplicateSlug);
        } else {
          setError(result.error || t.genericError);
        }
        return;
      }

      await loadAttributes();
      resetForm();
      setSuccess(editingId ? t.updated : t.created);
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (attribute: AttributeRow) => {
    setEditingId(attribute.id);
    setForm({
      slug: attribute.slug,
      nameRu: attribute.name_ru,
      nameEn: attribute.name_en,
      nameLv: attribute.name_lv,
      nameEl: attribute.name_el,
      valueType: attribute.value_type || "text",
      options: toFormOptions(attribute.option_values),
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string) => {
    setError("");
    setSuccess("");
    const response = await fetch("/api/admin/attributes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (response.status === 401) {
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    if (!response.ok) {
      setError(payload.error || t.deleteError);
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    await loadAttributes();
    setSuccess(t.deleted);
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
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.formEyebrow}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                  {editingId ? t.formTitleEdit : t.formTitleCreate}
                </h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                {editingId ? <PencilLine className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

            <div className="grid gap-4">
              <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                <span>{t.slug}</span>
                <input
                  value={form.slug}
                  onChange={(event) => setFormField("slug", event.target.value)}
                  className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                />
                <p className="text-xs leading-5 text-[color:var(--muted)]">{t.slugHint}</p>
              </label>
              {(["ru", "en", "lv", "el"] as LocaleKey[]).map((localeKey) => (
                <label key={localeKey} className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{labels[localeKey]}</span>
                  <input
                    value={form[fieldMap[localeKey]]}
                    onChange={(event) => setFormField(fieldMap[localeKey], event.target.value)}
                    className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                  />
                </label>
              ))}
              <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                <span>{t.type}</span>
                <select
                  value={form.valueType}
                  onChange={(event) => setForm((current) => ({ ...current, valueType: event.target.value as FormState["valueType"] }))}
                  className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                >
                  <option value="text">{t.typeText}</option>
                  <option value="boolean">{t.typeBoolean}</option>
                  <option value="multi_select">{t.typeMultiSelect}</option>
                </select>
              </label>
                  {form.valueType === "multi_select" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[color:var(--headline)]">{t.options}</span>
                    <button
                      type="button"
                      onClick={addOptionRow}
                      className="inline-flex h-10 items-center rounded-xl border border-[#ece3d9] bg-white px-4 text-sm font-medium text-[color:var(--headline)]"
                    >
                      {t.addOption}
                    </button>
                  </div>
                  <p className="text-xs leading-5 text-[color:var(--muted)]">{t.optionsHint}</p>
                  <div className="space-y-3">
                    {ensureOptionRows(form.options).map((option, index) => (
                      <div key={`${option.slug}-${index}`} className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-4">
                        <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto]">
                          <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                            <span>{t.optionSlug}</span>
                            <input
                              value={option.slug}
                              onChange={(event) => updateOptionField(index, "slug", event.target.value)}
                              className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeOptionRow(index)}
                            className="inline-flex h-11 items-center self-end rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700"
                          >
                            {t.remove}
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {(["ru", "en", "lv", "el"] as LocaleKey[]).map((localeKey) => {
                            const fieldKey =
                              localeKey === "ru"
                                ? "labelRu"
                                : localeKey === "en"
                                  ? "labelEn"
                                  : localeKey === "lv"
                                    ? "labelLv"
                                    : "labelEl";

                            return (
                              <label key={localeKey} className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                                <span>{labels[localeKey]}</span>
                                <input
                                  value={option[fieldKey]}
                                  onChange={(event) => updateOptionField(index, fieldKey, event.target.value)}
                                  className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        options: [
                          {
                            slug: "black",
                            labelRu: "Черный",
                            labelEn: "Black",
                            labelLv: "Melns",
                            labelEl: "Μαύρο",
                          },
                          {
                            slug: "white",
                            labelRu: "Белый",
                            labelEn: "White",
                            labelLv: "Balts",
                            labelEl: "Λευκό",
                          },
                          {
                            slug: "gray",
                            labelRu: "Серый",
                            labelEn: "Gray",
                            labelLv: "Pelēks",
                            labelEl: "Γκρι",
                          },
                        ],
                      }))
                    }
                    className="inline-flex h-10 items-center rounded-xl border border-[#ece3d9] bg-white px-4 text-sm font-medium text-[color:var(--headline)]"
                  >
                    {t.presetColors}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-medium text-[#203153] shadow-[0_12px_28px_rgba(244,198,79,0.28)] disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? t.saving : editingId ? t.update : t.save}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="inline-flex h-11 items-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)]">
                  {t.cancel}
                </button>
              ) : null}
              <Link href={localizePathname("/panel-x9k2m4q7r2a", locale)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)]">
                <ArrowLeft className="h-4 w-4" />
                {t.back}
              </Link>
            </div>
          </form>

          <section className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="border-b border-[#efe6dd] pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.listEyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.listTitle}</h2>
            </div>

            <div className="space-y-3">
              {attributes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-[#fffcf7] px-4 py-5 text-sm text-[color:var(--muted)]">{t.empty}</div>
              ) : (
                attributes.map((attribute) => (
                  <article key={attribute.id} className="rounded-[1.35rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--headline)]">{attribute[`name_${locale}` as keyof AttributeRow] as string || attribute.name_en}</p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">{attribute.slug}</p>
                        <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">{t.currentType}: {getTypeLabel(attribute.value_type, t)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleEdit(attribute)} className="inline-flex h-9 items-center rounded-xl border border-[#ece3d9] bg-white px-3 text-sm font-medium text-[color:var(--headline)]">
                          {t.edit}
                        </button>
                        <button type="button" onClick={() => void handleDelete(attribute.id)} className="inline-flex h-9 items-center rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.remove}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {(["ru", "en", "lv", "el"] as LocaleKey[]).map((localeKey) => (
                        <div key={localeKey} className="rounded-xl border border-[#ece3d9] bg-white px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">{labels[localeKey]}</p>
                          <p className="mt-1 text-sm font-medium text-[color:var(--headline)]">{attribute[`name_${localeKey}` as keyof AttributeRow] as string}</p>
                        </div>
                      ))}
                    </div>
                    {attribute.value_type === "multi_select" && (attribute.option_values?.length ?? 0) > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {normalizeAttributeOptionValues(attribute.option_values).map((option) => (
                          <span key={option.slug} className="inline-flex rounded-full border border-[#ece3d9] bg-white px-3 py-1 text-xs font-medium text-[color:var(--headline)]">
                            {getLocalizedAttributeOptionLabel(option, locale)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
