"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Images,
  LoaderCircle,
  PencilLine,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { localizePathname } from "@/i18n/config";
import { uploadAdminImage } from "@/lib/storage";

type ProjectFormState = {
  sortOrder: string;
  coverImageUrl: string;
  isActive: boolean;
  isFeaturedHome: boolean;
};
type ProjectRow = {
  id: string;
  slug: string;
  sort_order: number;
  cover_image_url: string | null;
  is_active: boolean;
  is_featured_home: boolean;
};

const copy = {
  en: {
    top: "Protected projects management area",
    support: "Contact",
    title: "Projects",
    description: "Upload completed lighting works, manage gallery entries, and choose which 4 projects appear on the homepage.",
    loading: "Loading projects...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    back: "Back to dashboard",
    create: "Create project",
    update: "Update project",
    creating: "Saving project...",
    successCreate: "Project created successfully.",
    successUpdate: "Project updated successfully.",
    deleteSuccess: "Project deleted.",
    genericError: "Could not save project.",
    deleteError: "Could not delete project.",
    formEyebrow: "Project form",
    formTitle: "Add project photo",
    sortOrder: "Sort order",
    coverImage: "Project image",
    uploading: "Uploading image...",
    active: "Visible in gallery",
    featured: "Show on homepage",
    existingEyebrow: "Existing projects",
    existingTitle: "Current project gallery",
    empty: "No projects yet. Add the first work to connect the homepage showcase with real data.",
    order: "Order",
    edit: "Edit",
    remove: "Delete",
    reset: "Clear form",
    activeBadge: "Active",
    hiddenBadge: "Hidden",
    featuredBadge: "Featured on home",
  },
  ru: {
    top: "Защищенная зона управления проектами",
    support: "Контакты",
    title: "Проекты",
    description: "Загружайте выполненные работы по освещению, управляйте галереей и выбирайте 4 проекта для главной страницы.",
    loading: "Загружаю проекты...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    back: "Назад к дэшборду",
    create: "Создать проект",
    update: "Обновить проект",
    creating: "Сохраняю проект...",
    successCreate: "Проект успешно создан.",
    successUpdate: "Проект успешно обновлен.",
    deleteSuccess: "Проект удален.",
    genericError: "Не удалось сохранить проект.",
    deleteError: "Не удалось удалить проект.",
    formEyebrow: "Форма проекта",
    formTitle: "Добавление фото проекта",
    sortOrder: "Порядок",
    coverImage: "Изображение проекта",
    uploading: "Загружаю изображение...",
    active: "Показывать в галерее",
    featured: "Показывать на главной",
    existingEyebrow: "Существующие проекты",
    existingTitle: "Текущая галерея проектов",
    empty: "Проектов пока нет. Добавьте первую работу, чтобы связать витрину на главной с реальными данными.",
    order: "Порядок",
    edit: "Редактировать",
    remove: "Удалить",
    reset: "Очистить форму",
    activeBadge: "Активен",
    hiddenBadge: "Скрыт",
    featuredBadge: "На главной",
  },
  el: {
    top: "Προστατευμένη διαχείριση έργων",
    support: "Επικοινωνία",
    title: "Έργα",
    description: "Ανεβάστε ολοκληρωμένα έργα φωτισμού, διαχειριστείτε τη gallery και επιλέξτε τα 4 έργα που εμφανίζονται στην αρχική.",
    loading: "Φόρτωση έργων...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    back: "Πίσω στο dashboard",
    create: "Δημιουργία έργου",
    update: "Ενημέρωση έργου",
    creating: "Αποθήκευση έργου...",
    successCreate: "Το έργο δημιουργήθηκε με επιτυχία.",
    successUpdate: "Το έργο ενημερώθηκε με επιτυχία.",
    deleteSuccess: "Το έργο διαγράφηκε.",
    genericError: "Δεν ήταν δυνατή η αποθήκευση του έργου.",
    deleteError: "Δεν ήταν δυνατή η διαγραφή του έργου.",
    formEyebrow: "Φόρμα έργου",
    formTitle: "Προσθήκη φωτογραφίας έργου",
    sortOrder: "Σειρά",
    coverImage: "Εικόνα έργου",
    uploading: "Μεταφόρτωση εικόνας...",
    active: "Ορατό στη gallery",
    featured: "Εμφάνιση στην αρχική",
    existingEyebrow: "Υπάρχοντα έργα",
    existingTitle: "Τρέχουσα gallery έργων",
    empty: "Δεν υπάρχουν ακόμη έργα. Προσθέστε το πρώτο για να συνδέσετε την αρχική με πραγματικά δεδομένα.",
    order: "Σειρά",
    edit: "Επεξεργασία",
    remove: "Διαγραφή",
    reset: "Καθαρισμός φόρμας",
    activeBadge: "Ενεργό",
    hiddenBadge: "Κρυφό",
    featuredBadge: "Στην αρχική",
  },
  lv: {
    top: "Aizsargāta projektu pārvaldība",
    support: "Kontakti",
    title: "Projekti",
    description: "Augšupielādējiet paveiktos apgaismojuma darbus, pārvaldiet galeriju un izvēlieties 4 projektus sākumlapai.",
    loading: "Ielādē projektus...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    back: "Atpakaļ uz paneli",
    create: "Izveidot projektu",
    update: "Atjaunināt projektu",
    creating: "Saglabā projektu...",
    successCreate: "Projekts veiksmīgi izveidots.",
    successUpdate: "Projekts veiksmīgi atjaunināts.",
    deleteSuccess: "Projekts izdzēsts.",
    genericError: "Neizdevās saglabāt projektu.",
    deleteError: "Neizdevās izdzēst projektu.",
    formEyebrow: "Projekta forma",
    formTitle: "Projekta foto pievienošana",
    sortOrder: "Secība",
    coverImage: "Projekta attēls",
    uploading: "Augšupielādē attēlu...",
    active: "Rādīt galerijā",
    featured: "Rādīt sākumlapā",
    existingEyebrow: "Esošie projekti",
    existingTitle: "Pašreizējā projektu galerija",
    empty: "Projektu vēl nav. Pievienojiet pirmo darbu, lai savienotu sākumlapu ar reāliem datiem.",
    order: "Secība",
    edit: "Rediģēt",
    remove: "Dzēst",
    reset: "Notīrīt formu",
    activeBadge: "Aktīvs",
    hiddenBadge: "Paslēpts",
    featuredBadge: "Sākumlapā",
  },
} as const;

function createInitialForm(): ProjectFormState {
  return {
    sortOrder: "0",
    coverImageUrl: "",
    isActive: true,
    isFeaturedHome: false,
  };
}

function createProjectSlug(sortOrder: string) {
  const normalizedOrder = Math.max(0, Number.parseInt(sortOrder || "0", 10) || 0);
  return `project-${String(normalizedOrder).padStart(4, "0")}`;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [form, setForm] = useState<ProjectFormState>(createInitialForm());
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadProjects = useCallback(async () => {
    const response = await fetch("/api/admin/projects", {
      credentials: "include",
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      projects?: ProjectRow[];
    };

    if (response.status === 401) {
      setError(t.signIn);
      setIsAdmin(false);
      router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
      return;
    }

    if (response.status === 403) {
      setError(t.noAccess);
      setIsAdmin(false);
      return;
    }

    if (!response.ok) {
      setError(payload.error || t.genericError);
      return;
    }

    setProjects(payload.projects ?? []);
    setIsAdmin(true);
  }, [locale, router, t.genericError, t.noAccess, t.signIn]);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      await loadProjects();
      if (!mounted) return;
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [loadProjects]);

  const resetForm = () => {
    setEditingId(null);
    setForm(createInitialForm());
  };

  const handleProjectImageChange = async (file: File | null) => {
    if (!file) return;
    setError("");
    setSuccess("");
    setUploadingImage(true);

    try {
      const upload = await uploadAdminImage({
        file,
        folder: "projects",
        slug: createProjectSlug(form.sortOrder),
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

    if (!form.coverImageUrl.trim()) {
      setError(t.genericError);
      return;
    }

    const finalSlug = createProjectSlug(form.sortOrder);
    setSubmitting(true);

    try {
      if (editingId) {
        const response = await fetch("/api/admin/projects", {
          method: "PATCH",
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
            isFeaturedHome: form.isFeaturedHome,
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          setError(payload.error || t.genericError);
          setSubmitting(false);
          return;
        }
      } else {
        const response = await fetch("/api/admin/projects", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug: finalSlug,
            sortOrder: Number.parseInt(form.sortOrder || "0", 10) || 0,
            coverImageUrl: form.coverImageUrl.trim() || null,
            isActive: form.isActive,
            isFeaturedHome: form.isFeaturedHome,
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          setError(payload.error || t.genericError);
          setSubmitting(false);
          return;
        }
      }

      setSuccess(editingId ? t.successUpdate : t.successCreate);
      await loadProjects();
      resetForm();
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (project: ProjectRow) => {
    const nextForm = createInitialForm();
    nextForm.sortOrder = String(project.sort_order);
    nextForm.coverImageUrl = project.cover_image_url || "";
    nextForm.isActive = project.is_active;
    nextForm.isFeaturedHome = project.is_featured_home;

    setEditingId(project.id);
    setForm(nextForm);
    setError("");
    setSuccess("");
  };

  const deleteProject = async (id: string) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error || t.deleteError);
        return;
      }

      if (editingId === id) resetForm();
      setSuccess(t.deleteSuccess);
      await loadProjects();
    } catch {
      setError(t.deleteError);
    }
  };

  return (
    <AdminShell
      topLabel={t.top}
      title={t.title}
      description={t.description}
    >
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
                <Images className="h-6 w-6" />
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

            <label className="block space-y-2 text-sm font-medium text-[color:var(--headline)]">
              <span>{t.sortOrder}</span>
              <input type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
            </label>

            <div className="space-y-3 text-sm font-medium text-[color:var(--headline)]">
              <span>{t.coverImage}</span>
              <div className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-4">
                <input type="file" accept="image/*" onChange={(event) => void handleProjectImageChange(event.target.files?.[0] ?? null)} className="block w-full text-sm text-[color:var(--muted)] file:mr-4 file:rounded-xl file:border-0 file:bg-[color:var(--accent)] file:px-4 file:py-2 file:font-medium file:text-[#203153]" />
                {uploadingImage ? <p className="mt-3 text-sm text-[color:var(--muted)]">{t.uploading}</p> : null}
                {form.coverImageUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#ece3d9] bg-white">
                    <Image
                      src={form.coverImageUrl}
                      alt="Project preview"
                      width={1200}
                      height={640}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="accent-[color:var(--accent)]" />
                <span>{t.active}</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                <input type="checkbox" checked={form.isFeaturedHome} onChange={(event) => setForm((current) => ({ ...current, isFeaturedHome: event.target.checked }))} className="accent-[color:var(--accent)]" />
                <span>{t.featured}</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
                <Plus className="h-4 w-4" />
                {submitting ? t.creating : editingId ? t.update : t.create}
              </button>
              <button type="button" onClick={resetForm} className="inline-flex h-12 items-center rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
                {t.reset}
              </button>
              <Link href={localizePathname("/panel-x9k2m4q7r2a", locale)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
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

            <div className="mt-5 space-y-4">
              {projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-[#fffcf7] px-4 py-5 text-sm text-[color:var(--muted)]">{t.empty}</div>
              ) : (
                projects.map((project) => {
                  return (
                    <article key={project.id} className="rounded-[1.4rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                      {project.cover_image_url ? (
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#ece3d9] bg-white">
                          <Image
                            src={project.cover_image_url}
                            alt={project.slug}
                            width={1200}
                            height={704}
                            className="h-44 w-full object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                              #{project.sort_order}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${project.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              {project.is_active ? t.activeBadge : t.hiddenBadge}
                            </span>
                            {project.is_featured_home ? (
                              <span className="rounded-full bg-[#fff1da] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b46a14]">
                                {t.featuredBadge}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-3 font-display text-xl font-semibold text-[color:var(--headline)]">
                            {`#${project.sort_order}`}
                          </h3>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">{project.slug}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button type="button" onClick={() => startEdit(project)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ece3d9] bg-white text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25" aria-label={t.edit}>
                            <PencilLine className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => void deleteProject(project.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f1d7ca] bg-white text-[#af4b2b] transition hover:bg-[#fff2ec]" aria-label={t.remove}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
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
