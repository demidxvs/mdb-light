"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  FolderTree,
  LoaderCircle,
  PencilLine,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import { uploadAdminImage } from "@/lib/storage";
import { localizePathname } from "@/i18n/config";

type LocaleKey = "en" | "ru" | "el" | "lv";
type TranslationFields = {
  name: string;
  description: string;
};
type CategoryFormState = {
  slug: string;
  sortOrder: string;
  coverImageUrl: string;
  isActive: boolean;
  translations: Record<LocaleKey, TranslationFields>;
};
type CategoryRow = {
  id: string;
  slug: string;
  sort_order: number;
  cover_image_url: string | null;
  is_active: boolean;
  category_translations?: Array<{
    locale: LocaleKey;
    name: string;
    description: string | null;
  }>;
};

const locales: LocaleKey[] = ["en", "ru", "el", "lv"];
const labels = {
  en: "English",
  ru: "Русский",
  el: "Ελληνικά",
  lv: "Latviešu",
} as const;

const copy = {
  en: {
    top: "Protected categories management area",
    support: "Contact",
    title: "Categories",
    description: "Create, edit, delete, and reorder categories that appear on the storefront.",
    loading: "Loading categories...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    create: "Create category",
    update: "Update category",
    creating: "Saving category...",
    successCreate: "Category created successfully.",
    successUpdate: "Category updated successfully.",
    deleteSuccess: "Category deleted.",
    genericError: "Could not save category.",
    deleteError: "Could not delete category.",
    slugRequired: "Enter category slug.",
    namesRequired: "Fill category name for all 4 languages.",
    formEyebrow: "Category form",
    formTitle: "Manage storefront directions",
    slug: "Slug",
    sortOrder: "Sort order",
    coverImage: "Category image",
    uploadImage: "Upload image",
    uploading: "Uploading image...",
    active: "Visible on storefront",
    translations: "Translations",
    categoryName: "Category name",
    categoryDescription: "Description",
    existingEyebrow: "Existing categories",
    existingTitle: "Current storefront order",
    empty: "No categories yet. Create the first one to replace the static homepage cards.",
    order: "Order",
    edit: "Edit",
    remove: "Delete",
    moveUp: "Up",
    moveDown: "Down",
    reset: "Clear form",
    activeBadge: "Active",
    hiddenBadge: "Hidden",
  },
  ru: {
    top: "Защищенная зона управления категориями",
    support: "Контакты",
    title: "Категории",
    description: "Создавайте, редактируйте, удаляйте и меняйте порядок категорий, которые показываются на витрине.",
    loading: "Загружаю категории...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    create: "Создать категорию",
    update: "Обновить категорию",
    creating: "Сохраняю категорию...",
    successCreate: "Категория успешно создана.",
    successUpdate: "Категория успешно обновлена.",
    deleteSuccess: "Категория удалена.",
    genericError: "Не удалось сохранить категорию.",
    deleteError: "Не удалось удалить категорию.",
    slugRequired: "Введите slug категории.",
    namesRequired: "Заполните название категории для всех 4 языков.",
    formEyebrow: "Форма категории",
    formTitle: "Управление направлениями витрины",
    slug: "Slug",
    sortOrder: "Порядок",
    coverImage: "Изображение категории",
    uploadImage: "Загрузить изображение",
    uploading: "Загружаю изображение...",
    active: "Показывать на витрине",
    translations: "Переводы",
    categoryName: "Название категории",
    categoryDescription: "Описание",
    existingEyebrow: "Существующие категории",
    existingTitle: "Текущий порядок на витрине",
    empty: "Категорий пока нет. Создайте первую, чтобы заменить статичные карточки на главной.",
    order: "Порядок",
    edit: "Редактировать",
    remove: "Удалить",
    moveUp: "Вверх",
    moveDown: "Вниз",
    reset: "Очистить форму",
    activeBadge: "Активна",
    hiddenBadge: "Скрыта",
  },
  el: {
    top: "Προστατευμένη διαχείριση κατηγοριών",
    support: "Επικοινωνία",
    title: "Κατηγορίες",
    description: "Δημιουργήστε, επεξεργαστείτε, διαγράψτε και αλλάξτε τη σειρά των κατηγοριών που εμφανίζονται στη βιτρίνα.",
    loading: "Φόρτωση κατηγοριών...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στο dashboard",
    create: "Δημιουργία κατηγορίας",
    update: "Ενημέρωση κατηγορίας",
    creating: "Αποθήκευση κατηγορίας...",
    successCreate: "Η κατηγορία δημιουργήθηκε με επιτυχία.",
    successUpdate: "Η κατηγορία ενημερώθηκε με επιτυχία.",
    deleteSuccess: "Η κατηγορία διαγράφηκε.",
    genericError: "Δεν ήταν δυνατή η αποθήκευση της κατηγορίας.",
    deleteError: "Δεν ήταν δυνατή η διαγραφή της κατηγορίας.",
    slugRequired: "Συμπληρώστε το slug της κατηγορίας.",
    namesRequired: "Συμπληρώστε το όνομα κατηγορίας και στις 4 γλώσσες.",
    formEyebrow: "Φόρμα κατηγορίας",
    formTitle: "Διαχείριση κατευθύνσεων βιτρίνας",
    slug: "Slug",
    sortOrder: "Σειρά",
    coverImage: "Εικόνα κατηγορίας",
    uploadImage: "Μεταφόρτωση εικόνας",
    uploading: "Μεταφόρτωση εικόνας...",
    active: "Ορατό στη βιτρίνα",
    translations: "Μεταφράσεις",
    categoryName: "Όνομα κατηγορίας",
    categoryDescription: "Περιγραφή",
    existingEyebrow: "Υπάρχουσες κατηγορίες",
    existingTitle: "Τρέχουσα σειρά στη βιτρίνα",
    empty: "Δεν υπάρχουν ακόμη κατηγορίες. Δημιουργήστε την πρώτη για να αντικαταστήσετε τις στατικές κάρτες στην αρχική.",
    order: "Σειρά",
    edit: "Επεξεργασία",
    remove: "Διαγραφή",
    moveUp: "Πάνω",
    moveDown: "Κάτω",
    reset: "Καθαρισμός φόρμας",
    activeBadge: "Ενεργή",
    hiddenBadge: "Κρυφή",
  },
  lv: {
    top: "Aizsargāta kategoriju pārvaldība",
    support: "Kontakti",
    title: "Kategorijas",
    description: "Veidojiet, rediģējiet, dzēsiet un mainiet kategoriju secību, kas parādās vitrīnā.",
    loading: "Ielādē kategorijas...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    create: "Izveidot kategoriju",
    update: "Atjaunināt kategoriju",
    creating: "Saglabā kategoriju...",
    successCreate: "Kategorija veiksmīgi izveidota.",
    successUpdate: "Kategorija veiksmīgi atjaunināta.",
    deleteSuccess: "Kategorija izdzēsta.",
    genericError: "Neizdevās saglabāt kategoriju.",
    deleteError: "Neizdevās izdzēst kategoriju.",
    slugRequired: "Ievadiet kategorijas slug.",
    namesRequired: "Aizpildiet kategorijas nosaukumu visās 4 valodās.",
    formEyebrow: "Kategorijas forma",
    formTitle: "Vitrīnas virzienu pārvaldība",
    slug: "Slug",
    sortOrder: "Secība",
    coverImage: "Kategorijas attēls",
    uploadImage: "Augšupielādēt attēlu",
    uploading: "Augšupielādē attēlu...",
    active: "Rādīt vitrīnā",
    translations: "Tulkojumi",
    categoryName: "Kategorijas nosaukums",
    categoryDescription: "Apraksts",
    existingEyebrow: "Esošās kategorijas",
    existingTitle: "Pašreizējā secība vitrīnā",
    empty: "Kategoriju vēl nav. Izveidojiet pirmo, lai aizstātu statiskās kartītes sākumlapā.",
    order: "Secība",
    edit: "Rediģēt",
    remove: "Dzēst",
    moveUp: "Uz augšu",
    moveDown: "Uz leju",
    reset: "Notīrīt formu",
    activeBadge: "Aktīva",
    hiddenBadge: "Paslēpta",
  },
} as const;

function createInitialForm(): CategoryFormState {
  return {
    slug: "",
    sortOrder: "0",
    coverImageUrl: "",
    isActive: true,
    translations: {
      en: { name: "", description: "" },
      ru: { name: "", description: "" },
      el: { name: "", description: "" },
      lv: { name: "", description: "" },
    },
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(supabaseReady ? "" : "Admin Supabase is not configured.");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [form, setForm] = useState<CategoryFormState>(createInitialForm());
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadCategories = async () => {
    const response = await fetch("/api/admin/categories", {
      credentials: "include",
    });

    if (response.status === 401) {
      setError(t.signIn);
      setIsAdmin(false);
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    const payload = (await response.json()) as {
      categories?: CategoryRow[];
      error?: string;
    };

    if (!response.ok) {
      setError(payload.error || t.genericError);
      return;
    }

    setCategories(payload.categories ?? []);
  };

  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    const hydrate = async () => {
      const response = await fetch("/api/admin/categories", {
        credentials: "include",
      });
      if (!mounted) return;

      if (response.status === 401) {
        setError(t.signIn);
        setLoading(false);
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      const payload = (await response.json()) as {
        categories?: CategoryRow[];
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error || t.noAccess);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setCategories(payload.categories ?? []);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, router, supabaseReady, t.noAccess, t.signIn]);

  const resetForm = () => {
    setEditingId(null);
    setForm(createInitialForm());
  };

  const handleTranslationChange = (
    localeKey: LocaleKey,
    field: keyof TranslationFields,
    value: string,
  ) => {
    setForm((current) => {
      const next = {
        ...current,
        translations: {
          ...current.translations,
          [localeKey]: {
            ...current.translations[localeKey],
            [field]: value,
          },
        },
      };
      if (localeKey === "en" && field === "name" && !current.slug.trim()) {
        next.slug = slugify(value);
      }
      return next;
    });
  };


  const handleCategoryImageChange = async (file: File | null) => {
    if (!file) return;
    setError("");
    setSuccess("");
    setUploadingImage(true);

    try {
      const upload = await uploadAdminImage({
        file,
        folder: "categories",
        slug: form.slug || form.translations.en.name || "category",
      });
      setForm((current) => ({ ...current, coverImageUrl: upload.publicUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t.genericError);
    } finally {
      setUploadingImage(false);
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const finalSlug = form.slug.trim() || slugify(form.translations.en.name);
    if (!finalSlug) {
      setError(t.slugRequired);
      return;
    }

    if (locales.some((localeKey) => !form.translations[localeKey].name.trim())) {
      setError(t.namesRequired);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          slug: finalSlug,
          sortOrder: Number.parseInt(form.sortOrder || "0", 10) || 0,
          coverImageUrl: form.coverImageUrl.trim() || null,
          isActive: form.isActive,
          translations: locales.map((localeKey) => ({
            locale: localeKey,
            name: form.translations[localeKey].name.trim(),
            description: form.translations[localeKey].description.trim() || null,
          })),
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || t.genericError);
        setSubmitting(false);
        return;
      }

      setSuccess(editingId ? t.successUpdate : t.successCreate);
      await loadCategories();
      resetForm();
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category: CategoryRow) => {
    const nextForm = createInitialForm();
    nextForm.slug = category.slug;
    nextForm.sortOrder = String(category.sort_order);
    nextForm.coverImageUrl = category.cover_image_url || "";
    nextForm.isActive = category.is_active;

    for (const localeKey of locales) {
      const translation = category.category_translations?.find((item) => item.locale === localeKey);
      nextForm.translations[localeKey] = {
        name: translation?.name || "",
        description: translation?.description || "",
      };
    }

    setEditingId(category.id);
    setForm(nextForm);
    setError("");
    setSuccess("");
  };

  const deleteCategory = async (id: string) => {
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || t.deleteError);
        return;
      }
      if (editingId === id) resetForm();
      setSuccess(t.deleteSuccess);
      await loadCategories();
    } catch {
      setError(t.deleteError);
    }
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const current = categories[index];
    const target = categories[targetIndex];
    const response = await fetch("/api/admin/categories", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstId: current.id,
        firstSortOrder: target.sort_order,
        secondId: target.id,
        secondSortOrder: current.sort_order,
      }),
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || t.genericError);
      return;
    }
    await loadCategories();
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
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.formEyebrow}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.formTitle}</h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <FolderTree className="h-6 w-6" />
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                <span>{t.slug}</span>
                <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
              </label>
              <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                <span>{t.sortOrder}</span>
                <input type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
              </label>
            </div>

            <div className="space-y-3 text-sm font-medium text-[color:var(--headline)]">
              <span>{t.coverImage}</span>
              <div className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-4">
                <input type="file" accept="image/*" onChange={(event) => void handleCategoryImageChange(event.target.files?.[0] ?? null)} className="block w-full text-sm text-[color:var(--muted)] file:mr-4 file:rounded-xl file:border-0 file:bg-[color:var(--accent)] file:px-4 file:py-2 file:font-medium file:text-[#203153]" />
                {uploadingImage ? <p className="mt-3 text-sm text-[color:var(--muted)]">{t.uploading}</p> : null}
                {form.coverImageUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#ece3d9] bg-white">
                    <Image
                      src={form.coverImageUrl}
                      alt="Category preview"
                      width={1200}
                      height={640}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="accent-[color:var(--accent)]" />
              <span>{t.active}</span>
            </label>

            <section className="space-y-4">
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.translations}</div>
              <div className="grid gap-4 xl:grid-cols-2">
                {locales.map((localeKey) => (
                  <div key={localeKey} className="space-y-3 rounded-[1.4rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <p className="text-sm font-semibold text-[color:var(--headline)]">{labels[localeKey]}</p>
                    <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                      <span>{t.categoryName}</span>
                      <input value={form.translations[localeKey].name} onChange={(event) => handleTranslationChange(localeKey, "name", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]" />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                      <span>{t.categoryDescription}</span>
                      <textarea value={form.translations[localeKey].description} onChange={(event) => handleTranslationChange(localeKey, "description", event.target.value)} rows={4} className="w-full rounded-xl border border-[#ece3d9] bg-white px-4 py-3 outline-none transition focus:border-[color:var(--accent)]" />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
                <Plus className="h-4 w-4" />
                {submitting ? t.creating : editingId ? t.update : t.create}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex h-12 items-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
                {t.reset}
              </button>
              <Link href="/panel-x9k2m4q7r2a" className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
                <ArrowLeft className="h-4 w-4" />
                {t.back}
              </Link>
            </div>
          </form>

          <section className="rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="border-b border-[#efe6dd] pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.existingEyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">{t.existingTitle}</h2>
            </div>

            <div className="mt-5 space-y-3">
              {categories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-[#fffcf7] px-4 py-5 text-sm text-[color:var(--muted)]">{t.empty}</div>
              ) : (
                categories.map((category, index) => {
                  const translation =
                    category.category_translations?.find((item) => item.locale === locale) ||
                    category.category_translations?.find((item) => item.locale === "en") ||
                    category.category_translations?.[0];

                  return (
                    <div key={category.id} className="rounded-[1.35rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--accent)]/75">{t.order} {String(index + 1).padStart(2, "0")}</p>
                          <h3 className="mt-2 font-display text-xl font-semibold text-[color:var(--headline)]">{translation?.name || category.slug}</h3>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{translation?.description || category.slug}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8c9bb6]">{category.slug}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${category.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {category.is_active ? t.activeBadge : t.hiddenBadge}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => moveCategory(index, -1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-3 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"><ArrowUp className="h-4 w-4" />{t.moveUp}</button>
                        <button type="button" onClick={() => moveCategory(index, 1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-3 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"><ArrowDown className="h-4 w-4" />{t.moveDown}</button>
                        <button type="button" onClick={() => startEdit(category)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-3 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25"><PencilLine className="h-4 w-4" />{t.edit}</button>
                        <button type="button" onClick={() => void deleteCategory(category.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#f3d8cf] bg-[#fff7f2] px-3 text-sm font-medium text-[#af4b2b] transition hover:border-[#e9b8a7]"><Trash2 className="h-4 w-4" />{t.remove}</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
