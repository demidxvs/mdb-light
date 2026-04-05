"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, PencilLine, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/ui/admin-shell";
import { useLocale } from "@/components/ui/locale-provider";
import { isAdminSupabaseConfigured } from "@/lib/admin-supabase-client";
import {
  getAttributeOptionChoices,
  normalizeSelectedChoiceValues,
  type RawAttributeOptionValue,
} from "@/lib/attribute-options";
import { uploadAdminImage } from "@/lib/storage";
import { localizePathname } from "@/i18n/config";
import { slugify } from "@/lib/product-utils";

type LocaleKey = "en" | "ru" | "el" | "lv";
type TranslationFields = {
  name: string;
};
type FormState = {
  sku: string;
  slug: string;
  categoryId: string;
  currency: string;
  price: string;
  stockQuantity: string;
  primaryImageUrl: string;
  imageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  translations: Record<LocaleKey, TranslationFields>;
};
type CategoryRow = {
  id: string;
  slug: string;
  category_translations?: Array<{ locale: LocaleKey; name: string }>;
};
type AttributeRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  name_lv: string;
  name_el: string;
  value_type: "text" | "boolean" | "multi_select";
  option_values: RawAttributeOptionValue[] | null;
};
type ProductAttributeValueRow = {
  id: string;
  product_id: string;
  attribute_id: string;
  value: string;
  price_adjustments?: Record<string, number> | null;
};
type ProductAttributeFormItem = {
  id?: string;
  attributeId: string;
  value: string;
  priceAdjustments: Record<string, string>;
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
    top: "Protected catalog management area",
    title: "Edit product",
    description: "Update the product data, translations, pricing, and attributes.",
    loading: "Loading product...",
    denied: "Admin access required",
    signIn: "Sign in first to open the admin panel.",
    noAccess: "You do not have access to this page.",
    missing: "Product not found.",
    back: "Back to products",
    save: "Update product",
    saving: "Saving changes...",
    success: "Product updated successfully.",
    genericError: "Could not update product. Check the fields and try again.",
    skuRequired: "Enter SKU.",
    slugRequired: "Enter slug or an English product name to generate it.",
    priceInvalid: "Enter a valid price.",
    missingTranslations: "Fill product name for all 4 languages.",
    baseInfo: "Base product info",
    sku: "SKU",
    slug: "Slug",
    category: "Category",
    noCategory: "No category",
    commercial: "Commercial settings",
    currency: "Currency",
    price: "Price",
    stock: "Stock quantity",
    image: "Product image",
    gallery: "Gallery",
    setPrimary: "Make primary",
    removeImage: "Remove image",
    uploadMany: "You can upload multiple images at once.",
    uploadImage: "Upload image",
    uploading: "Uploading image...",
    trackInventory: "Track inventory",
    visible: "Visible in storefront",
    featured: "Featured on homepage",
    translations: "Translations",
    productName: "Product name",
    attributesTitle: "Attributes",
    attributesText: "Choose a saved attribute and set the value for this product.",
    addAttribute: "Add attribute",
    attribute: "Attribute",
    value: "Value",
    included: "Included",
    notIncluded: "Not included",
    chooseValue: "Choose value",
    black: "Black",
    white: "White",
    gray: "Gray",
    remove: "Remove",
    noAttributes: "No attributes added yet.",
    noAttributeOptions: "Create attributes first in the admin section.",
    optionPrice: "Price delta",
    optionPriceHint: "Positive or negative value applied on top of the base product price.",
  },
  ru: {
    top: "Защищенная зона управления каталогом",
    title: "Редактировать товар",
    description: "Обновите данные товара, переводы, цену и характеристики.",
    loading: "Загружаю товар...",
    denied: "Требуется доступ администратора",
    signIn: "Сначала войдите, чтобы открыть админку.",
    noAccess: "У вас нет доступа к этой странице.",
    missing: "Товар не найден.",
    back: "Назад к товарам",
    save: "Обновить товар",
    saving: "Сохраняю изменения...",
    success: "Товар успешно обновлен.",
    genericError: "Не удалось обновить товар. Проверьте поля и попробуйте снова.",
    skuRequired: "Введите SKU.",
    slugRequired: "Введите slug или английское имя товара для автогенерации.",
    priceInvalid: "Введите корректную цену.",
    missingTranslations: "Заполните название товара для всех 4 языков.",
    baseInfo: "Основная информация",
    sku: "SKU",
    slug: "Slug",
    category: "Категория",
    noCategory: "Без категории",
    commercial: "Коммерческие настройки",
    currency: "Валюта",
    price: "Цена",
    stock: "Количество на складе",
    image: "Изображение товара",
    gallery: "Галерея",
    setPrimary: "Сделать главным",
    removeImage: "Удалить фото",
    uploadMany: "Можно загружать сразу несколько изображений.",
    uploadImage: "Загрузить изображение",
    uploading: "Загружаю изображение...",
    trackInventory: "Отслеживать остатки",
    visible: "Показывать на витрине",
    featured: "Показывать на главной",
    translations: "Переводы",
    productName: "Название товара",
    attributesTitle: "Характеристики",
    attributesText: "Выберите сохранённую характеристику и задайте значение для этого товара.",
    addAttribute: "Добавить характеристику",
    attribute: "Характеристика",
    value: "Значение",
    included: "Идет в комплект",
    notIncluded: "Не идет в комплект",
    chooseValue: "Выберите значение",
    black: "Черный",
    white: "Белый",
    gray: "Серый",
    remove: "Удалить",
    noAttributes: "Характеристики пока не добавлены.",
    noAttributeOptions: "Сначала создайте характеристики в отдельном разделе админки.",
    optionPrice: "Изменение цены",
    optionPriceHint: "Положительное или отрицательное значение поверх базовой цены товара.",
  },
  el: {
    top: "Προστατευμένη διαχείριση καταλόγου",
    title: "Επεξεργασία προϊόντος",
    description: "Ενημερώστε τα στοιχεία του προϊόντος, τις μεταφράσεις, την τιμή και τα χαρακτηριστικά.",
    loading: "Φόρτωση προϊόντος...",
    denied: "Απαιτείται πρόσβαση διαχειριστή",
    signIn: "Συνδεθείτε πρώτα για να ανοίξετε το admin panel.",
    noAccess: "Δεν έχετε πρόσβαση σε αυτή τη σελίδα.",
    missing: "Το προϊόν δεν βρέθηκε.",
    back: "Πίσω στα προϊόντα",
    save: "Ενημέρωση προϊόντος",
    saving: "Αποθήκευση αλλαγών...",
    success: "Το προϊόν ενημερώθηκε με επιτυχία.",
    genericError: "Δεν ήταν δυνατή η ενημέρωση του προϊόντος. Ελέγξτε τα πεδία και δοκιμάστε ξανά.",
    skuRequired: "Συμπληρώστε το SKU.",
    slugRequired: "Συμπληρώστε slug ή αγγλικό όνομα προϊόντος για αυτόματη δημιουργία.",
    priceInvalid: "Συμπληρώστε έγκυρη τιμή.",
    missingTranslations: "Συμπληρώστε το όνομα προϊόντος και στις 4 γλώσσες.",
    baseInfo: "Βασικές πληροφορίες",
    sku: "SKU",
    slug: "Slug",
    category: "Κατηγορία",
    noCategory: "Χωρίς κατηγορία",
    commercial: "Εμπορικές ρυθμίσεις",
    currency: "Νόμισμα",
    price: "Τιμή",
    stock: "Ποσότητα αποθέματος",
    image: "Εικόνα προϊόντος",
    gallery: "Gallery",
    setPrimary: "Ορισμός ως κύρια",
    removeImage: "Διαγραφή εικόνας",
    uploadMany: "Μπορείτε να ανεβάσετε πολλές εικόνες ταυτόχρονα.",
    uploadImage: "Μεταφόρτωση εικόνας",
    uploading: "Μεταφόρτωση εικόνας...",
    trackInventory: "Παρακολούθηση αποθέματος",
    visible: "Ορατό στη βιτρίνα",
    featured: "Εμφάνιση στην αρχική",
    translations: "Μεταφράσεις",
    productName: "Όνομα προϊόντος",
    attributesTitle: "Χαρακτηριστικά",
    attributesText: "Επιλέξτε αποθηκευμένο χαρακτηριστικό και ορίστε την τιμή του για το προϊόν.",
    addAttribute: "Προσθήκη χαρακτηριστικού",
    attribute: "Χαρακτηριστικό",
    value: "Τιμή",
    included: "Περιλαμβάνεται",
    notIncluded: "Δεν περιλαμβάνεται",
    chooseValue: "Επιλέξτε τιμή",
    black: "Μαύρο",
    white: "Λευκό",
    gray: "Γκρι",
    remove: "Διαγραφή",
    noAttributes: "Δεν έχουν προστεθεί ακόμη χαρακτηριστικά.",
    noAttributeOptions: "Δημιουργήστε πρώτα χαρακτηριστικά στο admin.",
    optionPrice: "Μεταβολή τιμής",
    optionPriceHint: "Θετική ή αρνητική τιμή πάνω στη βασική τιμή του προϊόντος.",
  },
  lv: {
    top: "Aizsargāta kataloga pārvaldība",
    title: "Rediģēt produktu",
    description: "Atjauniniet produkta datus, tulkojumus, cenu un raksturlielumus.",
    loading: "Ielādē produktu...",
    denied: "Nepieciešama administratora piekļuve",
    signIn: "Lai atvērtu admin paneli, vispirms pieslēdzieties.",
    noAccess: "Jums nav piekļuves šai lapai.",
    missing: "Produkts nav atrasts.",
    back: "Atpakaļ uz produktiem",
    save: "Atjaunināt produktu",
    saving: "Saglabā izmaiņas...",
    success: "Produkts veiksmīgi atjaunināts.",
    genericError: "Neizdevās atjaunināt produktu. Pārbaudiet laukus un mēģiniet vēlreiz.",
    skuRequired: "Ievadiet SKU.",
    slugRequired: "Ievadiet slug vai produkta nosaukumu angļu valodā automātiskai ģenerēšanai.",
    priceInvalid: "Ievadiet korektu cenu.",
    missingTranslations: "Aizpildiet produkta nosaukumu visās 4 valodās.",
    baseInfo: "Pamata informācija",
    sku: "SKU",
    slug: "Slug",
    category: "Kategorija",
    noCategory: "Bez kategorijas",
    commercial: "Komerciālie iestatījumi",
    currency: "Valūta",
    price: "Cena",
    stock: "Atlikuma daudzums",
    image: "Produkta attēls",
    gallery: "Galerija",
    setPrimary: "Padarīt par galveno",
    removeImage: "Dzēst attēlu",
    uploadMany: "Var augšupielādēt vairākus attēlus vienlaikus.",
    uploadImage: "Augšupielādēt attēlu",
    uploading: "Augšupielādē attēlu...",
    trackInventory: "Sekot atlikumam",
    visible: "Rādīt vitrīnā",
    featured: "Rādīt sākumlapā",
    translations: "Tulkojumi",
    productName: "Produkta nosaukums",
    attributesTitle: "Raksturlielumi",
    attributesText: "Izvēlieties saglabātu raksturlielumu un ievadiet tā vērtību šim produktam.",
    addAttribute: "Pievienot raksturlielumu",
    attribute: "Raksturlielums",
    value: "Vērtība",
    included: "Iekļauts komplektā",
    notIncluded: "Nav iekļauts",
    chooseValue: "Izvēlieties vērtību",
    black: "Melns",
    white: "Balts",
    gray: "Pelēks",
    remove: "Dzēst",
    noAttributes: "Raksturlielumi vēl nav pievienoti.",
    noAttributeOptions: "Vispirms izveidojiet raksturlielumus admin sadaļā.",
    optionPrice: "Cenas izmaiņa",
    optionPriceHint: "Pozitīva vai negatīva vērtība virs produkta pamata cenas.",
  },
} as const;

function createInitialForm(): FormState {
  return {
    sku: "",
    slug: "",
    categoryId: "",
    currency: "EUR",
    price: "",
    stockQuantity: "0",
    primaryImageUrl: "",
    imageUrls: [],
    isActive: true,
    isFeatured: false,
    trackInventory: true,
    translations: {
      en: { name: "" },
      ru: { name: "" },
      el: { name: "" },
      lv: { name: "" },
    },
  };
}

function getAttributeName(attribute: AttributeRow, locale: LocaleKey) {
  if (locale === "ru") return attribute.name_ru;
  if (locale === "lv") return attribute.name_lv;
  if (locale === "el") return attribute.name_el;
  return attribute.name_en;
}

function centsToInput(value: number | null | undefined) {
  if (!Number.isFinite(value)) return "0";
  return ((value ?? 0) / 100).toString();
}

function parseDecimalInput(value: string) {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getFallbackAttributeType(attribute: AttributeRow | undefined) {
  if (!attribute) return "text" as const;
  if (attribute.slug === "power-module" || attribute.slug === "end-cap") {
    return "boolean" as const;
  }
  if (attribute.slug === "available-colors" || attribute.slug === "available-lengths" || attribute.slug === "length") {
    return "multi_select" as const;
  }
  return "text" as const;
}

function getEffectiveAttributeType(attribute: AttributeRow | undefined) {
  if (!attribute) return "text" as const;
  if (attribute.value_type && attribute.value_type !== "text") {
    return attribute.value_type;
  }
  return getFallbackAttributeType(attribute);
}

function getEffectiveAttributeOptions(
  attribute: AttributeRow | undefined,
  locale: LocaleKey,
  t: (typeof copy)[LocaleKey],
) {
  const savedOptions = getAttributeOptionChoices(attribute?.option_values, locale);
  if (savedOptions.length > 0) return savedOptions;
  if (attribute?.slug === "available-colors") {
    return [
      { value: "black", label: t.black, aliases: ["black", t.black] },
      { value: "white", label: t.white, aliases: ["white", t.white] },
      { value: "gray", label: t.gray, aliases: ["gray", "grey", t.gray] },
    ];
  }
  if (attribute?.slug === "available-lengths" || attribute?.slug === "length") {
    return ["1M", "2M", "3M", "4M", "5M"].map((value) => ({
      value,
      label: value,
      aliases: [value, value.toLowerCase()],
    }));
  }
  return [];
}

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isAdminSupabaseConfigured(), []);
  const [loading, setLoading] = useState(supabaseReady);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(supabaseReady ? "" : "Supabase is not configured.");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductAttributeFormItem[]>([]);
  const [form, setForm] = useState<FormState>(createInitialForm());
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!supabaseReady || !params?.id) return;
    let mounted = true;

    const hydrate = async () => {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        credentials: "include",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        product?: {
          sku: string;
          slug: string;
          category_id: string | null;
          currency: string;
          price_cents: number;
          stock_quantity: number;
          primary_image_url: string | null;
          image_urls?: string[] | null;
          is_active: boolean;
          is_featured: boolean;
          track_inventory: boolean;
          product_translations?: Array<{ locale: LocaleKey; name: string }>;
        };
        categories?: CategoryRow[];
        attributes?: AttributeRow[];
        productAttributes?: ProductAttributeValueRow[];
      };

      if (!mounted) return;
      if (response.status === 401) {
        setError(t.signIn);
        setLoading(false);
        router.replace(
          `${localizePathname("/panel-x9k2m4q7r2a/login", locale)}?next=${encodeURIComponent(localizePathname(`/panel-x9k2m4q7r2a/products/${params.id}`, locale))}`,
        );
        return;
      }

      if (!response.ok || !payload.product) {
        setError(payload.error || t.missing);
        setLoading(false);
        return;
      }

      const nextForm = createInitialForm();
      const productData = payload.product;
      nextForm.sku = productData.sku;
      nextForm.slug = productData.slug;
      nextForm.categoryId = productData.category_id || "";
      nextForm.currency = productData.currency || "EUR";
      nextForm.price = String(productData.price_cents / 100);
      nextForm.stockQuantity = String(productData.stock_quantity ?? 0);
      nextForm.imageUrls =
        (productData.image_urls ?? []).filter(Boolean).length > 0
          ? (productData.image_urls ?? []).filter(Boolean)
          : productData.primary_image_url
            ? [productData.primary_image_url]
            : [];
      nextForm.primaryImageUrl = nextForm.imageUrls[0] || productData.primary_image_url || "";
      nextForm.isActive = productData.is_active;
      nextForm.isFeatured = productData.is_featured;
      nextForm.trackInventory = productData.track_inventory;

      for (const localeKey of locales) {
        const translation = productData.product_translations?.find((item) => item.locale === localeKey);
        nextForm.translations[localeKey] = {
          name: translation?.name || "",
        };
      }

      setCategories(payload.categories ?? []);
      setAttributes(payload.attributes ?? []);
      setProductAttributes(((payload.productAttributes as ProductAttributeValueRow[] | null) ?? []).map((item) => ({
        id: item.id,
        attributeId: item.attribute_id,
        value: item.value,
        priceAdjustments: Object.fromEntries(
          Object.entries(item.price_adjustments ?? {}).map(([key, value]) => [
            key,
            centsToInput(typeof value === "number" ? value : 0),
          ]),
        ),
      })));
      setForm(nextForm);
      setIsAdmin(true);
      setLoading(false);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [locale, params?.id, router, supabaseReady, t.missing, t.noAccess, t.signIn]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label:
          category.category_translations?.find((item) => item.locale === locale)?.name ||
          category.category_translations?.find((item) => item.locale === "en")?.name ||
          category.category_translations?.[0]?.name ||
          category.slug,
      })),
    [categories, locale],
  );

  const availableAttributeOptions = useMemo(
    () =>
      attributes.map((attribute) => ({
        id: attribute.id,
        label: getAttributeName(attribute, locale),
        valueType: getEffectiveAttributeType(attribute),
        options: getEffectiveAttributeOptions(attribute, locale, t),
      })),
    [attributes, locale, t],
  );

  const getAttributeById = (attributeId: string) => attributes.find((attribute) => attribute.id === attributeId);

  const handleFieldChange = (field: keyof Omit<FormState, "translations">, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleTranslationChange = (localeKey: LocaleKey, field: keyof TranslationFields, value: string) => {
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

  const handleProductImageChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setSuccess("");
    setUploadingImage(true);

    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) =>
          uploadAdminImage({
            file,
            folder: "products",
            slug: form.slug || form.translations.en.name || form.sku || "product",
          }),
        ),
      );
      setForm((current) => {
        const nextImageUrls = [...current.imageUrls, ...uploads.map((upload) => upload.publicUrl)];
        return {
          ...current,
          imageUrls: nextImageUrls,
          primaryImageUrl: nextImageUrls[0] || "",
        };
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t.genericError);
    } finally {
      setUploadingImage(false);
    }
  };

  const setPrimaryImage = (url: string) => {
    setForm((current) => {
      const nextImageUrls = [url, ...current.imageUrls.filter((item) => item !== url)];
      return {
        ...current,
        imageUrls: nextImageUrls,
        primaryImageUrl: nextImageUrls[0] || "",
      };
    });
  };

  const removeImage = (url: string) => {
    setForm((current) => {
      const nextImageUrls = current.imageUrls.filter((item) => item !== url);
      return {
        ...current,
        imageUrls: nextImageUrls,
        primaryImageUrl: nextImageUrls[0] || "",
      };
    });
  };

  const addAttributeRow = () => {
    setProductAttributes((current) => [...current, { attributeId: "", value: "", priceAdjustments: {} }]);
  };

  const updateAttributeRow = (index: number, field: keyof ProductAttributeFormItem, value: string) => {
    setProductAttributes((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  };

  const updateAttributePriceAdjustment = (index: number, option: string, value: string) => {
    setProductAttributes((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              priceAdjustments: {
                ...(item.priceAdjustments ?? {}),
                [option]: value,
              },
            }
          : item,
      ),
    );
  };

  const toggleMultiSelectValue = (index: number, option: string) => {
    setProductAttributes((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const selectedAttribute = getAttributeById(item.attributeId);
        const choices = getEffectiveAttributeOptions(selectedAttribute, locale, t);
        const normalizedParts = normalizeSelectedChoiceValues(item.value, choices);
        const next = normalizedParts.includes(option)
          ? normalizedParts.filter((entry) => entry !== option)
          : [...normalizedParts, option];
        const nextPriceAdjustments = Object.fromEntries(
          Object.entries(item.priceAdjustments ?? {}).filter(([key]) => next.includes(key)),
        );
        return { ...item, value: next.join(", "), priceAdjustments: nextPriceAdjustments };
      }),
    );
  };

  const removeAttributeRow = (index: number) => {
    setProductAttributes((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleDelete = async () => {
    if (!window.confirm(locale === "ru" ? "Удалить этот товар?" : locale === "en" ? "Delete this product?" : locale === "el" ? "Να διαγραφεί αυτό το προϊόν;" : "Dzēst šo produktu?")) {
      return;
    }

    setError("");
    setSuccess("");
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        setError(payload.error || t.genericError);
        return;
      }

      router.replace(localizePathname("/panel-x9k2m4q7r2a/products", locale));
    } catch {
      setError(t.genericError);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.sku.trim()) {
      setError(t.skuRequired);
      return;
    }

    const finalSlug = form.slug.trim() || slugify(form.translations.en.name || form.sku);
    if (!finalSlug) {
      setError(t.slugRequired);
      return;
    }

    const price = parseDecimalInput(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError(t.priceInvalid);
      return;
    }

    const missingTranslation = locales.some((localeKey) => !form.translations[localeKey].name.trim());
    if (missingTranslation) {
      setError(t.missingTranslations);
      return;
    }

    const normalizedAttributes = productAttributes
      .map((item) => ({
        id: item.id,
        attributeId: item.attributeId,
        value: item.value.trim(),
        priceAdjustments: Object.fromEntries(
          Object.entries(item.priceAdjustments ?? {})
            .filter(([key, value]) => key && value.trim() !== "")
            .map(([key, value]) => [key, Math.round(parseDecimalInput(value) * 100)]),
        ),
      }))
      .filter((item) => item.attributeId && item.value);

    const duplicateAttribute = new Set<string>();
    for (const item of normalizedAttributes) {
      if (duplicateAttribute.has(item.attributeId)) {
        setError(t.genericError);
        return;
      }
      duplicateAttribute.add(item.attributeId);
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          categoryId: form.categoryId || null,
          sku: form.sku.trim(),
          slug: finalSlug,
          currency: form.currency.trim().toUpperCase() || "EUR",
          priceCents: Math.round(price * 100),
          stockQuantity: Math.max(0, Number.parseInt(form.stockQuantity || "0", 10) || 0),
          trackInventory: form.trackInventory,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          primaryImageUrl: form.imageUrls[0] || form.primaryImageUrl.trim() || null,
          imageUrls: form.imageUrls,
          translations: locales.map((localeKey) => ({
            locale: localeKey,
            name: form.translations[localeKey].name.trim(),
          })),
          attributes: normalizedAttributes.map((item) => ({
            attributeId: item.attributeId,
            value: item.value,
            priceAdjustments: item.priceAdjustments,
          })),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.replace(localizePathname("/panel-x9k2m4q7r2a/login", locale));
        return;
      }

      if (!response.ok) {
        setError(payload.error || t.genericError);
        return;
      }

      setSuccess(t.success);
    } catch {
      setError(t.genericError);
    } finally {
      setSubmitting(false);
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
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Link href={localizePathname("/panel-x9k2m4q7r2a/products", locale)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-5 text-sm font-medium text-[color:var(--headline)] transition hover:border-[color:var(--accent)]/25">
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Link>
            <button type="button" onClick={() => void handleDelete()} disabled={deleting} className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
              <Trash2 className="h-4 w-4" />
              {deleting
                ? locale === "ru"
                  ? "Удаляю..."
                  : locale === "en"
                    ? "Deleting..."
                    : locale === "el"
                      ? "Διαγραφή..."
                      : "Dzēš..."
                : locale === "ru"
                  ? "Удалить товар"
                  : locale === "en"
                    ? "Delete product"
                    : locale === "el"
                      ? "Διαγραφή προϊόντος"
                      : "Dzēst produktu"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] border border-[#ece3d9] bg-white p-6 shadow-[0_16px_40px_rgba(27,42,74,0.05)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#efe6dd] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{t.title}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--headline)]">
                  {form.translations[locale].name || form.sku || t.title}
                </h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--headline)]">
                <PencilLine className="h-6 w-6" />
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

            <section className="space-y-4">
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.baseInfo}</div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.sku}</span>
                  <input value={form.sku} onChange={(event) => handleFieldChange("sku", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.slug}</span>
                  <input value={form.slug} onChange={(event) => handleFieldChange("slug", slugify(event.target.value))} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.category}</span>
                  <select value={form.categoryId} onChange={(event) => handleFieldChange("categoryId", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]">
                    <option value="">{t.noCategory}</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.commercial}</div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.currency}</span>
                  <input value={form.currency} maxLength={3} onChange={(event) => handleFieldChange("currency", event.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.price}</span>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => handleFieldChange("price", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                  <span>{t.stock}</span>
                  <input type="number" min="0" step="1" value={form.stockQuantity} onChange={(event) => handleFieldChange("stockQuantity", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                </label>
                <div className="space-y-2 text-sm font-medium text-[color:var(--headline)] md:col-span-2 xl:col-span-2">
                  <span>{t.image}</span>
                  <div className="rounded-2xl border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <input type="file" multiple accept="image/*" onChange={(event) => void handleProductImageChange(event.target.files)} className="block w-full text-sm text-[color:var(--muted)] file:mr-4 file:rounded-xl file:border-0 file:bg-[color:var(--accent)] file:px-4 file:py-2 file:font-medium file:text-[#203153]" />
                    <p className="mt-3 text-xs text-[color:var(--muted)]">{t.uploadMany}</p>
                    {uploadingImage ? <p className="mt-3 text-sm text-[color:var(--muted)]">{t.uploading}</p> : null}
                    {form.imageUrls.length > 0 ? (
                      <div className="mt-4 space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-[#ece3d9] bg-white">
                          <Image
                            src={form.imageUrls[0]}
                            alt="Product preview"
                            width={1200}
                            height={768}
                            className="h-48 w-full object-cover"
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {form.imageUrls.map((url, index) => (
                            <div key={url} className="rounded-2xl border border-[#ece3d9] bg-white p-3">
                              <div className="overflow-hidden rounded-xl border border-[#ece3d9]">
                                <Image
                                  src={url}
                                  alt={`Product preview ${index + 1}`}
                                  width={640}
                                  height={320}
                                  className="h-28 w-full object-cover"
                                />
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {index !== 0 ? (
                                  <button type="button" onClick={() => setPrimaryImage(url)} className="inline-flex h-9 items-center rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-3 text-xs font-medium text-[color:var(--headline)]">
                                    {t.setPrimary}
                                  </button>
                                ) : null}
                                <button type="button" onClick={() => removeImage(url)} className="inline-flex h-9 items-center rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700">
                                  {t.removeImage}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                  <input type="checkbox" checked={form.trackInventory} onChange={(event) => handleFieldChange("trackInventory", event.target.checked)} className="accent-[color:var(--accent)]" />
                  <span>{t.trackInventory}</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => handleFieldChange("isActive", event.target.checked)} className="accent-[color:var(--accent)]" />
                  <span>{t.visible}</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-3 text-sm font-medium text-[color:var(--headline)]">
                  <input type="checkbox" checked={form.isFeatured} onChange={(event) => handleFieldChange("isFeatured", event.target.checked)} className="accent-[color:var(--accent)]" />
                  <span>{t.featured}</span>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="text-sm font-semibold text-[color:var(--headline)]">{t.translations}</div>
              <div className="grid gap-4 xl:grid-cols-2">
                {locales.map((localeKey) => (
                  <div key={localeKey} className="space-y-3 rounded-[1.4rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
                    <p className="text-sm font-semibold text-[color:var(--headline)]">{labels[localeKey]}</p>
                    <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                      <span>{t.productName}</span>
                      <input value={form.translations[localeKey].name} onChange={(event) => handleTranslationChange(localeKey, "name", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]" />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-[1.4rem] border border-[#ece3d9] bg-[#fffcf7] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--headline)]">{t.attributesTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{t.attributesText}</p>
                </div>
                <button type="button" onClick={addAttributeRow} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ece3d9] bg-white px-4 text-sm font-medium text-[color:var(--headline)]">
                  <Plus className="h-4 w-4" />
                  {t.addAttribute}
                </button>
              </div>

              {attributes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-white px-4 py-5 text-sm text-[color:var(--muted)]">{t.noAttributeOptions}</div>
              ) : productAttributes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e8dccf] bg-white px-4 py-5 text-sm text-[color:var(--muted)]">{t.noAttributes}</div>
              ) : (
                <div className="space-y-3">
                  {productAttributes.map((item, index) => (
                    <div key={item.id || `attribute-${index}`} className="grid gap-3 rounded-2xl border border-[#ece3d9] bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
                      <label className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                        <span>{t.attribute}</span>
                        <select value={item.attributeId} onChange={(event) => {
                          updateAttributeRow(index, "attributeId", event.target.value);
                          updateAttributeRow(index, "value", "");
                          setProductAttributes((current) =>
                            current.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? { ...currentItem, priceAdjustments: {} }
                                : currentItem,
                            ),
                          );
                        }} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]">
                          <option value="">{t.attribute}</option>
                          {availableAttributeOptions.map((attribute) => (
                            <option key={attribute.id} value={attribute.id}>{attribute.label}</option>
                          ))}
                        </select>
                      </label>
                      <div className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                        <span>{t.value}</span>
                        {(() => {
                          const selectedAttribute = getAttributeById(item.attributeId);
                          const selectedType = getEffectiveAttributeType(selectedAttribute);

                          if (selectedType === "boolean") {
                            return (
                              <select
                                value={item.value}
                                onChange={(event) => updateAttributeRow(index, "value", event.target.value)}
                                className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]"
                              >
                                <option value="">{t.chooseValue}</option>
                                <option value="included">{t.included}</option>
                                <option value="not_included">{t.notIncluded}</option>
                              </select>
                            );
                          }

                          if (selectedType === "multi_select") {
                            const choiceOptions = getEffectiveAttributeOptions(selectedAttribute, locale, t);
                            const selectedValues = normalizeSelectedChoiceValues(item.value, choiceOptions);
                            return (
                              <div className="rounded-xl border border-[#ece3d9] bg-[#fffcf7] p-3">
                                <div className="flex flex-wrap gap-2">
                                  {choiceOptions.map((option) => (
                                    <label key={option.value} className="inline-flex items-center gap-2 rounded-full border border-[#ece3d9] bg-white px-3 py-2 text-xs font-medium text-[color:var(--headline)]">
                                      <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option.value)}
                                        onChange={() => toggleMultiSelectValue(index, option.value)}
                                        className="accent-[color:var(--accent)]"
                                      />
                                      <span>{option.label}</span>
                                    </label>
                                  ))}
                                </div>
                                {selectedValues.length > 0 ? (
                                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {selectedValues.map((selectedValue) => {
                                      const selectedOption = choiceOptions.find((option) => option.value === selectedValue);
                                      return (
                                        <label key={selectedValue} className="space-y-2 text-sm font-medium text-[color:var(--headline)]">
                                          <span>{selectedOption?.label || selectedValue} · {t.optionPrice}</span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={item.priceAdjustments?.[selectedValue] ?? "0"}
                                            onChange={(event) => updateAttributePriceAdjustment(index, selectedValue, event.target.value)}
                                            className="h-11 w-full rounded-xl border border-[#ece3d9] bg-white px-4 outline-none transition focus:border-[color:var(--accent)]"
                                          />
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : null}
                                <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">{t.optionPriceHint}</p>
                              </div>
                            );
                          }

                          return (
                            <input value={item.value} onChange={(event) => updateAttributeRow(index, "value", event.target.value)} className="h-11 w-full rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 outline-none transition focus:border-[color:var(--accent)]" />
                          );
                        })()}
                      </div>
                      <button type="button" onClick={() => removeAttributeRow(index)} className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700">
                        <Trash2 className="h-4 w-4" />
                        {t.remove}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-medium text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] transition hover:bg-[#efbf3e] disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? t.saving : t.save}
            </button>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
