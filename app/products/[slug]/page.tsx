"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart, X } from "lucide-react";
import { useLocale } from "@/components/ui/locale-provider";
import { CatalogProductCard } from "@/components/ui/catalog-product-card";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import { buildCategoryPath, buildProductPath } from "@/lib/seo";
import {
  getAttributeOptionChoices,
  localizeStoredAttributeValue,
  splitMultiValue,
  type AttributeOptionChoice,
  type RawAttributeOptionValue,
  type SelectedOptionMap,
} from "@/lib/attribute-options";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase-client";
import { addProductToCart, getCurrentUserId } from "@/lib/cart";

type LocaleKey = "en" | "ru" | "el" | "lv";
type ProductRow = {
  id: string;
  sku: string;
  slug: string;
  currency: string;
  price_cents: number;
  stock_quantity: number;
  primary_image_url: string | null;
  image_urls?: string[] | null;
  category_id: string | null;
  product_translations?: Array<{
    locale: LocaleKey;
    name: string | null;
    slug?: string | null;
    short_description?: string | null;
  }>;
};
type RelatedProductRow = {
  id: string;
  sku: string;
  slug: string;
  price_cents: number;
  currency: string;
  primary_image_url: string | null;
  product_translations?: Array<{
    locale: LocaleKey;
    name: string | null;
    slug?: string | null;
    short_description: string | null;
  }>;
};
type CategoryRow = {
  id: string;
  slug: string;
  category_translations?: Array<{
    locale: LocaleKey;
    name: string;
    slug?: string | null;
  }>;
};
type ProductAttributeRow = {
  value: string;
  price_adjustments?: Record<string, number> | null;
  attributes?: {
    slug: string;
    name_ru: string;
    name_en: string;
    name_lv: string;
    name_el: string;
    value_type: "text" | "boolean" | "multi_select";
    option_values?: RawAttributeOptionValue[] | null;
  } | null;
};

type SelectorGroup = {
  slug: string;
  label: string;
  kind: "color" | "length" | "material" | "default";
  choices: AttributeOptionChoice[];
  priceAdjustments: Record<string, number>;
};

function getAttributeName(attribute: NonNullable<ProductAttributeRow["attributes"]>, locale: LocaleKey) {
  if (locale === "ru") return attribute.name_ru;
  if (locale === "lv") return attribute.name_lv;
  if (locale === "el") return attribute.name_el;
  return attribute.name_en;
}

const copy = {
  en: { top: "Multilingual LED marketplace", loading: "Loading product...", backCatalog: "Back to catalog", addToCart: "Add to cart", addingToCart: "Adding...", sku: "SKU", category: "Category", attributes: "Attributes", colors: "Available colors", selectedColor: "Selected color", lengths: "Available lengths", selectedLength: "Selected length", materials: "Available materials", selectedMaterial: "Selected material", imagePlaceholder: "Add product photo in admin", stockLow: "Low stock left", outOfStock: "Out of stock", included: "Included", notIncluded: "Not included", addError: "Could not add product to cart.", relatedTitle: "Similar products", relatedText: "A few more products from the same category." },
  ru: { top: "Мультиязычный LED marketplace", loading: "Загружаю товар...", backCatalog: "Назад в каталог", addToCart: "В корзину", addingToCart: "Добавляю...", sku: "SKU", category: "Категория", attributes: "Характеристики", colors: "Доступные цвета", selectedColor: "Выбранный цвет", lengths: "Доступная длина", selectedLength: "Выбранная длина", materials: "Доступные материалы", selectedMaterial: "Выбранный материал", imagePlaceholder: "Добавьте фото товара в админке", stockLow: "Осталось мало", outOfStock: "Нету в наличии", included: "Идет в комплект", notIncluded: "Не идет в комплект", addError: "Не удалось добавить товар в корзину.", relatedTitle: "Похожие товары", relatedText: "Ещё несколько товаров из этой же категории." },
  el: { top: "Πολυγλωσσικό LED marketplace", loading: "Φόρτωση προϊόντος...", backCatalog: "Πίσω στον κατάλογο", addToCart: "Προσθήκη στο καλάθι", addingToCart: "Προσθήκη...", sku: "SKU", category: "Κατηγορία", attributes: "Χαρακτηριστικά", colors: "Διαθέσιμα χρώματα", selectedColor: "Επιλεγμένο χρώμα", lengths: "Διαθέσιμα μήκη", selectedLength: "Επιλεγμένο μήκος", materials: "Διαθέσιμα υλικά", selectedMaterial: "Επιλεγμένο υλικό", imagePlaceholder: "Προσθέστε φωτογραφία προϊόντος στο admin", stockLow: "Μένουν λίγα", outOfStock: "Εξαντλημένο", included: "Περιλαμβάνεται", notIncluded: "Δεν περιλαμβάνεται", addError: "Δεν ήταν δυνατή η προσθήκη στο καλάθι.", relatedTitle: "Παρόμοια προϊόντα", relatedText: "Μερικά ακόμη προϊόντα από την ίδια κατηγορία." },
  lv: { top: "Daudzvalodu LED marketplace", loading: "Ielādē produktu...", backCatalog: "Atpakaļ uz katalogu", addToCart: "Pievienot grozam", addingToCart: "Pievieno...", sku: "SKU", category: "Kategorija", attributes: "Raksturlielumi", colors: "Pieejamās krāsas", selectedColor: "Izvēlētā krāsa", lengths: "Pieejamie garumi", selectedLength: "Izvēlētais garums", materials: "Pieejamie materiāli", selectedMaterial: "Izvēlētais materiāls", imagePlaceholder: "Pievienojiet produkta foto admin panelī", stockLow: "Atlicis maz", outOfStock: "Nav noliktavā", included: "Iekļauts komplektā", notIncluded: "Nav iekļauts", addError: "Neizdevās pievienot produktu grozam.", relatedTitle: "Līdzīgi produkti", relatedText: "Vēl daži produkti no šīs pašas kategorijas." },
} as const;

function getAttributeValue(
  item: ProductAttributeRow,
  locale: LocaleKey,
) {
  if (item.value === "included") return copy[locale].included;
  if (item.value === "not_included") return copy[locale].notIncluded;
  return localizeStoredAttributeValue(item.value, item.attributes?.option_values, locale);
}

function getSelectableChoices(
  items: ProductAttributeRow[],
  attributeSlugs: string[],
  locale: LocaleKey,
) {
  const choices = new Map<string, AttributeOptionChoice>();

  items
    .filter((item) => item.attributes?.slug && attributeSlugs.includes(item.attributes.slug))
    .forEach((item) => {
      const optionChoices = getAttributeOptionChoices(item.attributes?.option_values, locale);
      const parts = splitMultiValue(item.value);

      if (optionChoices.length > 0) {
        for (const part of parts) {
          const matched = optionChoices.find((choice) => choice.aliases.includes(part));
          const key = matched?.value || part;
          if (!choices.has(key)) {
            choices.set(
              key,
              matched || { value: part, label: part, aliases: [part] },
            );
          }
        }
      } else {
        for (const part of parts) {
          if (!choices.has(part)) {
            choices.set(part, { value: part, label: part, aliases: [part] });
          }
        }
      }
    });

  return Array.from(choices.values());
}

function getSelectorKind(slug: string): SelectorGroup["kind"] {
  if (slug === "available-colors") return "color";
  if (slug === "available-lengths" || slug === "length") return "length";
  if (slug === "available-materials" || slug === "material") return "material";
  return "default";
}

function isSelectableAttribute(item: ProductAttributeRow) {
  if (!item.attributes) return false;

  const slug = item.attributes.slug || "";
  if (
    slug === "available-colors" ||
    slug === "available-lengths" ||
    slug === "length" ||
    slug === "available-materials" ||
    slug === "material"
  ) {
    return true;
  }

  if (item.attributes.value_type === "multi_select") {
    return true;
  }

  return getAttributeOptionChoices(item.attributes.option_values, "en").length > 0;
}

function buildSelectorGroups(items: ProductAttributeRow[], locale: LocaleKey) {
  return items
    .filter(
      (item) =>
        isSelectableAttribute(item) &&
        splitMultiValue(item.value).length > 0,
    )
    .map((item): SelectorGroup => {
      const slug = item.attributes?.slug || "";
      const choices = getSelectableChoices([item], [slug], locale);
      return {
        slug,
        label: item.attributes ? getAttributeName(item.attributes, locale) : slug,
        kind: getSelectorKind(slug),
        choices,
        priceAdjustments: item.price_adjustments ?? {},
      };
    });
}

function findChoiceLabel(choices: AttributeOptionChoice[], value: string) {
  const matched = choices.find(
    (choice) => choice.value === value || choice.aliases.includes(value),
  );
  return matched?.label || value;
}

function getColorSwatchStyle(color: string) {
  const normalized = color.trim().toLowerCase();
  if (normalized.startsWith("#") || normalized.startsWith("rgb") || normalized.startsWith("hsl")) {
    return { backgroundColor: color };
  }

  const palette: Record<string, string> = {
    white: "#f3f3f3",
    "белый": "#f3f3f3",
    "λευκό": "#f3f3f3",
    balts: "#f3f3f3",
    black: "#1f1f1f",
    "черный": "#1f1f1f",
    "чёрный": "#1f1f1f",
    "μαύρο": "#1f1f1f",
    melns: "#1f1f1f",
    gray: "#6b7280",
    grey: "#6b7280",
    "серый": "#6b7280",
    "γκρι": "#6b7280",
    pelēks: "#6b7280",
    silver: "#b7bdc7",
    red: "#dc2626",
    green: "#16a34a",
    blue: "#2563eb",
    yellow: "#facc15",
    gold: "#d4a017",
    beige: "#d6c1a3",
    brown: "#7c4a2d",
  };

  return { backgroundColor: palette[normalized] ?? color };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const supabaseReady = useMemo(() => isSupabaseConfigured(), []);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [attributes, setAttributes] = useState<ProductAttributeRow[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomedImage, setZoomedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedDynamicOptions, setSelectedDynamicOptions] = useState<SelectedOptionMap>({});
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductRow[]>([]);

  useEffect(() => {
    let mounted = true;
    void params.then((resolved) => {
      if (!mounted) return;
      setSlug(resolved.slug);
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!supabaseReady || !slug) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const productQuery = await supabase
        .from("products")
        .select("id, sku, slug, currency, price_cents, stock_quantity, primary_image_url, image_urls, category_id, product_translations(locale, name, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      let productData: ProductRow | null = (productQuery.data as ProductRow | null) ?? null;
      const productError = productQuery.error;

      if (productError?.message.includes("slug does not exist")) {
        const fallback = await supabase
          .from("products")
          .select("id, sku, slug, currency, price_cents, stock_quantity, primary_image_url, image_urls, category_id, product_translations(locale, name)")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();
        productData = (fallback.data as ProductRow | null) ?? null;
      }

      if (!mounted) return;
      if (!productData) {
        setProduct(null);
        setCategory(null);
        setLoading(false);
        return;
      }

      const typedProduct = productData as ProductRow;
      setProduct(typedProduct);
      const gallery =
        (typedProduct.image_urls ?? []).filter(Boolean).length > 0
          ? (typedProduct.image_urls ?? []).filter(Boolean)
          : typedProduct.primary_image_url
            ? [typedProduct.primary_image_url]
            : [];
      setSelectedImage(gallery[0] || "");

      const { data: attributeData } = await supabase
        .from("product_attribute_values")
        .select("value, price_adjustments, attributes(slug, name_ru, name_en, name_lv, name_el, value_type, option_values)")
        .eq("product_id", typedProduct.id);

      if (!mounted) return;
      const nextAttributes = (attributeData as ProductAttributeRow[] | null) ?? [];
      setAttributes(nextAttributes);
      const nextColors = getSelectableChoices(nextAttributes, ["available-colors"], locale);
      const nextLengths = getSelectableChoices(nextAttributes, ["available-lengths", "length"], locale);
      const nextMaterials = getSelectableChoices(nextAttributes, ["available-materials", "material"], locale);
      const nextSelectorGroups = buildSelectorGroups(nextAttributes, locale).filter(
        (group) => group.kind === "default",
      );
      setSelectedColor((current) =>
        nextColors.some((choice) => choice.value === current || choice.aliases.includes(current))
          ? current
          : nextColors[0]?.value || "",
      );
      setSelectedLength((current) =>
        nextLengths.some((choice) => choice.value === current || choice.aliases.includes(current))
          ? current
          : nextLengths[0]?.value || "",
      );
      setSelectedMaterial((current) =>
        nextMaterials.some((choice) => choice.value === current || choice.aliases.includes(current))
          ? current
          : nextMaterials[0]?.value || "",
      );
      setSelectedDynamicOptions((current) =>
        Object.fromEntries(
          nextSelectorGroups.map((group) => {
            const currentValue = current[group.slug];
            const activeValue = group.choices.some(
              (choice) => choice.value === currentValue || choice.aliases.includes(currentValue || ""),
            )
              ? currentValue
              : group.choices[0]?.value || "";
            return [group.slug, activeValue];
          }),
        ),
      );

      if (typedProduct.category_id) {
        const [categoryQuery, relatedQuery] = await Promise.all([
          supabase
            .from("categories")
            .select("id, slug, category_translations(locale, name, slug)")
            .eq("id", typedProduct.category_id)
            .maybeSingle(),
          supabase
            .from("products")
            .select("id, sku, slug, price_cents, currency, primary_image_url, product_translations(locale, name, slug, short_description)")
            .eq("category_id", typedProduct.category_id)
            .eq("is_active", true)
            .neq("id", typedProduct.id)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
        ]);
        let resolvedCategoryData: CategoryRow | null = (categoryQuery.data as CategoryRow | null) ?? null;
        let resolvedRelatedData: RelatedProductRow[] | null = (relatedQuery.data as RelatedProductRow[] | null) ?? null;

        if (
          categoryQuery.error?.message.includes("slug does not exist") ||
          relatedQuery.error?.message.includes("slug does not exist") ||
          relatedQuery.error?.message.includes("sort_order does not exist")
        ) {
          const [fallbackCategory, fallbackRelated] = await Promise.all([
            supabase
              .from("categories")
              .select("id, slug, category_translations(locale, name)")
              .eq("id", typedProduct.category_id)
              .maybeSingle(),
            supabase
              .from("products")
              .select("id, sku, slug, price_cents, currency, primary_image_url, product_translations(locale, name, short_description)")
              .eq("category_id", typedProduct.category_id)
              .eq("is_active", true)
              .neq("id", typedProduct.id)
              .order("created_at", { ascending: false }),
          ]);
          resolvedCategoryData = (fallbackCategory.data as CategoryRow | null) ?? null;
          resolvedRelatedData = (fallbackRelated.data as RelatedProductRow[] | null) ?? null;
        }

        if (!mounted) return;
        setCategory((resolvedCategoryData as CategoryRow | null) ?? null);
        const shuffled = [ ...((resolvedRelatedData as RelatedProductRow[] | null) ?? []) ]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setRelatedProducts(shuffled);
      } else {
        setCategory(null);
        setRelatedProducts([]);
      }

      setLoading(false);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [locale, slug, supabaseReady]);

  const translation =
    product?.product_translations?.find((item) => item.locale === locale) ||
    product?.product_translations?.find((item) => item.locale === "en") ||
    product?.product_translations?.[0];
  const categoryName =
    category?.category_translations?.find((item) => item.locale === locale)?.name ||
    category?.category_translations?.find((item) => item.locale === "en")?.name ||
    category?.category_translations?.[0]?.name ||
    category?.slug;
  const stockStatus =
    !product ? null : product.stock_quantity === 0 ? t.outOfStock : product.stock_quantity < 3 ? t.stockLow : null;
  const availableColors = useMemo(
    () => getSelectableChoices(attributes, ["available-colors"], locale),
    [attributes, locale],
  );
  const availableLengths = useMemo(
    () => getSelectableChoices(attributes, ["available-lengths", "length"], locale),
    [attributes, locale],
  );
  const availableMaterials = useMemo(
    () => getSelectableChoices(attributes, ["available-materials", "material"], locale),
    [attributes, locale],
  );
  const selectorGroups = useMemo(
    () => buildSelectorGroups(attributes, locale),
    [attributes, locale],
  );
  const extraSelectorGroups = useMemo(
    () => selectorGroups.filter((group) => group.kind === "default"),
    [selectorGroups],
  );
  const selectedOptions = useMemo(
    () =>
      Object.fromEntries(
        selectorGroups
          .map((group) => {
            const value =
              group.kind === "color"
                ? selectedColor
                : group.kind === "length"
                  ? selectedLength
                  : group.kind === "material"
                    ? selectedMaterial
                    : selectedDynamicOptions[group.slug] || "";
            return [group.slug, value];
          })
          .filter(([, value]) => value),
      ) as SelectedOptionMap,
    [selectorGroups, selectedColor, selectedLength, selectedMaterial, selectedDynamicOptions],
  );
  const selectedOptionLabels = useMemo(
    () =>
      Object.fromEntries(
        extraSelectorGroups
          .map((group) => {
            const value = selectedDynamicOptions[group.slug];
            if (!value) return null;
            return [group.label, findChoiceLabel(group.choices, value)];
          })
          .filter(Boolean) as Array<[string, string]>,
      ),
    [extraSelectorGroups, selectedDynamicOptions],
  );
  const adjustedPriceCents = useMemo(
    () =>
      (product?.price_cents ?? 0) +
      selectorGroups.reduce((sum, group) => {
        const value = selectedOptions[group.slug];
        if (!value) return sum;
        return sum + (group.priceAdjustments[value] ?? 0);
      }, 0),
    [product?.price_cents, selectedOptions, selectorGroups],
  );
  const galleryImages = useMemo(() => {
    const imageUrls = (product?.image_urls ?? []).filter(Boolean);
    if (imageUrls.length) {
      return imageUrls;
    }

    return product?.primary_image_url ? [product.primary_image_url] : [];
  }, [product?.image_urls, product?.primary_image_url]);
  const selectedImageIndex = galleryImages.findIndex(
    (imageUrl) => imageUrl === (zoomedImage || selectedImage),
  );

  const showPreviousImage = useCallback(() => {
    if (galleryImages.length <= 1) return;
    const currentIndex =
      selectedImageIndex >= 0 ? selectedImageIndex : 0;
    const nextIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setZoomedImage(galleryImages[nextIndex]);
    setSelectedImage(galleryImages[nextIndex]);
  }, [galleryImages, selectedImageIndex]);

  const showNextImage = useCallback(() => {
    if (galleryImages.length <= 1) return;
    const currentIndex =
      selectedImageIndex >= 0 ? selectedImageIndex : 0;
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setZoomedImage(galleryImages[nextIndex]);
    setSelectedImage(galleryImages[nextIndex]);
  }, [galleryImages, selectedImageIndex]);

  useEffect(() => {
    if (!zoomedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomedImage("");
      } else if (event.key === "ArrowLeft") {
        showPreviousImage();
      } else if (event.key === "ArrowRight") {
        showNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNextImage, showPreviousImage, zoomedImage]);

  const handleAddToCart = async () => {
    if (!product || !translation || product.stock_quantity === 0 || addingToCart) return;
    if (!supabaseReady) {
      setCartError(t.addError);
      return;
    }

    setCartError("");
    setAddingToCart(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const userId = await getCurrentUserId(supabase);
      await addProductToCart(supabase, userId, {
        productId: product.id,
        sku: product.sku,
        slug: product.slug,
        name: translation.name || product.slug,
        imageUrl: product.primary_image_url,
        selectedColor: selectedColor || null,
        selectedLength: selectedLength || null,
        selectedMaterial: selectedMaterial || null,
        selectedOptions,
        selectedOptionLabels,
        unitPriceCents: adjustedPriceCents,
        currency: product.currency || "EUR",
      });
    } catch {
      setCartError(t.addError);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_30%),linear-gradient(180deg,#fffdfa_0%,#f8f3eb_100%)]">
      <SiteHeader topLabel={t.top} />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-10 sm:py-8 lg:px-12">
        {loading || !product ? (
          <div className="rounded-[2rem] border border-[#e5e8ee] bg-white px-6 py-12 text-sm text-[color:var(--muted)] shadow-[0_20px_60px_rgba(27,42,74,0.06)]">{t.loading}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="overflow-hidden rounded-[2rem] border border-[#e5e8ee] bg-white shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
              <div className="relative aspect-[1.04/1] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)]">
                {selectedImage || product.primary_image_url ? (
                  <button type="button" onClick={() => setZoomedImage(selectedImage || product.primary_image_url || "")} className="relative h-full w-full">
                    <Image
                      src={selectedImage || product.primary_image_url || ""}
                      alt={translation?.name || product.slug}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </button>
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm uppercase tracking-[0.22em] text-[#9c8b6b]">{t.imagePlaceholder}</div>
                )}
              </div>
              {galleryImages.length > 1 ? (
                <div className="grid grid-cols-4 gap-2 border-t border-[#e5e8ee] p-3 sm:grid-cols-5 sm:gap-3 sm:p-4">
                  {galleryImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(imageUrl)}
                      className={`relative overflow-hidden rounded-xl border ${imageUrl === (selectedImage || galleryImages[0]) ? "border-[color:var(--accent)]" : "border-[#e5e8ee]"}`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${translation?.name || product.slug} ${index + 1}`}
                        width={320}
                        height={80}
                        className="h-20 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-5 shadow-[0_20px_60px_rgba(27,42,74,0.06)] sm:p-8">
              <Link href={category ? buildCategoryPath(locale, category) : "/catalog"} className="inline-flex items-center gap-2 rounded-xl border border-[#ece3d9] bg-[#fffcf7] px-4 py-2 text-sm font-medium text-[color:var(--headline)]"><ArrowLeft className="h-4 w-4" />{t.backCatalog}</Link>
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">{categoryName || t.category}</p>
                <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">{translation?.name || product.slug}</h1>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="min-w-0">
                  <p className="font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)] sm:text-4xl">{new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency || "EUR" }).format(adjustedPriceCents / 100)}</p>
                  {stockStatus ? <p className={`mt-3 text-sm font-medium ${product.stock_quantity === 0 ? "text-red-600" : "text-amber-600"}`}>{stockStatus}</p> : null}
                </div>
                <button type="button" onClick={() => void handleAddToCart()} disabled={product.stock_quantity === 0 || addingToCart} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-[#203153] shadow-[0_14px_30px_rgba(244,198,79,0.28)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"><ShoppingCart className="h-4 w-4" />{addingToCart ? t.addingToCart : t.addToCart}</button>
              </div>
              {cartError ? <p className="mt-3 text-sm font-medium text-red-600">{cartError}</p> : null}
              <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-[#ece3d9] bg-[#fffcf7] p-5 text-sm text-[color:var(--headline)]">
                <div className="flex items-center justify-between gap-4 border-b border-[#efe6dd] pb-3"><span className="text-[color:var(--muted)]">{t.sku}</span><span className="font-medium">{product.sku}</span></div>
                {categoryName ? <div className="flex items-center justify-between gap-4"><span className="text-[color:var(--muted)]">{t.category}</span><span className="font-medium">{categoryName}</span></div> : null}
                {selectedColor ? <div className="flex items-center justify-between gap-4"><span className="text-[color:var(--muted)]">{t.selectedColor}</span><span className="font-medium">{findChoiceLabel(availableColors, selectedColor)}</span></div> : null}
                {selectedLength ? <div className="flex items-center justify-between gap-4"><span className="text-[color:var(--muted)]">{t.selectedLength}</span><span className="font-medium">{findChoiceLabel(availableLengths, selectedLength)}</span></div> : null}
                {selectedMaterial ? <div className="flex items-center justify-between gap-4"><span className="text-[color:var(--muted)]">{t.selectedMaterial}</span><span className="font-medium">{findChoiceLabel(availableMaterials, selectedMaterial)}</span></div> : null}
                {extraSelectorGroups.map((group) =>
                  selectedOptions[group.slug] ? (
                    <div key={group.slug} className="flex items-center justify-between gap-4">
                      <span className="text-[color:var(--muted)]">{group.label}</span>
                      <span className="font-medium">{findChoiceLabel(group.choices, selectedOptions[group.slug])}</span>
                    </div>
                  ) : null,
                )}
              </div>
              {availableColors.length > 0 ? (
                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">{t.colors}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {availableColors.map((color) => {
                      const isActive = color.value === selectedColor;
                      return (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color.value)}
                          className={`rounded-2xl border p-2 transition ${isActive ? "border-[color:var(--accent)] bg-white shadow-[0_10px_24px_rgba(244,198,79,0.18)]" : "border-[#ece3d9] bg-[#fffcf7]"}`}
                        >
                          <span
                            className="block h-16 w-16 rounded-xl border border-black/10"
                            style={getColorSwatchStyle(color.label)}
                            title={color.label}
                          />
                          <span className="mt-2 block max-w-16 text-center text-xs font-medium text-[color:var(--headline)]">
                            {color.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {availableLengths.length > 0 ? (
                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">{t.lengths}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {availableLengths.map((length) => {
                      const isActive = length.value === selectedLength;
                      return (
                        <button
                          key={length.value}
                          type="button"
                          onClick={() => setSelectedLength(length.value)}
                          className={`inline-flex min-w-[68px] items-center justify-center rounded-xl border px-4 py-3 text-xl font-semibold transition ${
                            isActive
                              ? "border-[color:var(--accent)] bg-[#fff7e8] text-[color:var(--headline)] shadow-[0_10px_24px_rgba(244,198,79,0.16)]"
                              : "border-[#ece3d9] bg-[#fffcf7] text-[color:var(--headline)] hover:border-[#dcc8ac] hover:bg-white"
                          }`}
                        >
                          {length.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {availableMaterials.length > 0 ? (
                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">{t.materials}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {availableMaterials.map((material) => {
                      const isActive = material.value === selectedMaterial;
                      return (
                        <button
                          key={material.value}
                          type="button"
                          onClick={() => setSelectedMaterial(material.value)}
                          className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                            isActive
                              ? "border-[color:var(--accent)] bg-[#fff7e8] text-[color:var(--headline)] shadow-[0_10px_24px_rgba(244,198,79,0.16)]"
                              : "border-[#ece3d9] bg-[#fffcf7] text-[color:var(--headline)] hover:border-[#dcc8ac] hover:bg-white"
                          }`}
                        >
                          {material.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {extraSelectorGroups.map((group) => (
                <div key={group.slug} className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">{group.label}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {group.choices.map((choice) => {
                      const isActive = selectedDynamicOptions[group.slug] === choice.value;
                      return (
                        <button
                          key={choice.value}
                          type="button"
                          onClick={() =>
                            setSelectedDynamicOptions((current) => ({
                              ...current,
                              [group.slug]: choice.value,
                            }))
                          }
                          className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                            isActive
                              ? "border-[color:var(--accent)] bg-[#fff7e8] text-[color:var(--headline)] shadow-[0_10px_24px_rgba(244,198,79,0.16)]"
                              : "border-[#ece3d9] bg-[#fffcf7] text-[color:var(--headline)] hover:border-[#dcc8ac] hover:bg-white"
                          }`}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {attributes.length > 0 ? (
                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">{t.attributes}</p>
                  <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-[#ece3d9] bg-[#fffcf7]">
                    <table className="min-w-full divide-y divide-[#efe6dd] text-sm">
                      <tbody className="divide-y divide-[#efe6dd]">
                        {attributes.map((item, index) =>
                          item.attributes ? (
                            <tr key={`${item.value}-${index}`}>
                              <td className="px-4 py-3 text-[color:var(--muted)]">{getAttributeName(item.attributes, locale)}</td>
                              <td className="px-4 py-3 text-right font-medium text-[color:var(--headline)]">{getAttributeValue(item, locale)}</td>
                            </tr>
                          ) : null,
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
      {!loading && relatedProducts.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 lg:px-12">
          <div className="rounded-[2rem] border border-[#e5e8ee] bg-white p-6 shadow-[0_20px_60px_rgba(27,42,74,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
              {t.relatedTitle}
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--headline)]">
                {categoryName || t.relatedTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                {t.relatedText}
              </p>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((relatedProduct) => {
                const relatedTranslation =
                  relatedProduct.product_translations?.find((item) => item.locale === locale) ||
                  relatedProduct.product_translations?.find((item) => item.locale === "en") ||
                  relatedProduct.product_translations?.[0];

                return (
                  <CatalogProductCard
                    key={relatedProduct.id}
                    href={category ? buildProductPath(locale, category, relatedProduct) : `/products/${relatedProduct.slug}`}
                    name={relatedTranslation?.name || relatedProduct.slug}
                    teaser={relatedTranslation?.short_description || ""}
                    sku={relatedProduct.sku}
                    price={new Intl.NumberFormat("en-US", { style: "currency", currency: relatedProduct.currency || "EUR" }).format(relatedProduct.price_cents / 100)}
                    category={categoryName || t.category}
                    imageUrl={relatedProduct.primary_image_url}
                  />
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      {zoomedImage ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.86)] p-6" onClick={() => setZoomedImage("")}>
          {galleryImages.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              className="absolute left-6 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setZoomedImage("")}
            className="absolute right-6 top-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <Image
            src={zoomedImage}
            alt={translation?.name || product?.slug || "Product image"}
            width={1600}
            height={1600}
            className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {galleryImages.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              className="absolute right-6 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      ) : null}
      <SiteFooter />
    </main>
  );
}
