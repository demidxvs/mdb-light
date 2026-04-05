import { slugify } from "@/lib/product-utils";

export type AttributeOptionLocale = "ru" | "en" | "lv" | "el";

export type RawAttributeOptionValue =
  | string
  | {
      slug?: string | null;
      label_ru?: string | null;
      label_en?: string | null;
      label_lv?: string | null;
      label_el?: string | null;
    };

export type LocalizedAttributeOption = {
  slug: string;
  label_ru: string;
  label_en: string;
  label_lv: string;
  label_el: string;
};

export type AttributeOptionChoice = {
  value: string;
  label: string;
  aliases: string[];
};

export type SelectedOptionMap = Record<string, string>;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function normalizeAttributeOptionValues(
  values: RawAttributeOptionValue[] | null | undefined,
) {
  return (values ?? [])
    .map((value): LocalizedAttributeOption | null => {
      if (typeof value === "string") {
        const label = normalizeText(value);
        if (!label) return null;

        return {
          slug: slugify(label) || label.toLowerCase(),
          label_ru: label,
          label_en: label,
          label_lv: label,
          label_el: label,
        };
      }

      if (!value || typeof value !== "object") return null;

      const labelRu = normalizeText(value.label_ru);
      const labelEn = normalizeText(value.label_en);
      const labelLv = normalizeText(value.label_lv);
      const labelEl = normalizeText(value.label_el);
      const fallback =
        labelEn || labelRu || labelLv || labelEl || normalizeText(value.slug);

      if (!fallback) return null;

      return {
        slug:
          slugify(normalizeText(value.slug)) ||
          slugify(labelEn) ||
          slugify(labelRu) ||
          slugify(labelLv) ||
          slugify(labelEl) ||
          fallback.toLowerCase(),
        label_ru: labelRu || fallback,
        label_en: labelEn || fallback,
        label_lv: labelLv || fallback,
        label_el: labelEl || fallback,
      };
    })
    .filter((value): value is LocalizedAttributeOption => Boolean(value));
}

export function getLocalizedAttributeOptionLabel(
  option: LocalizedAttributeOption,
  locale: AttributeOptionLocale,
) {
  if (locale === "ru") return option.label_ru;
  if (locale === "lv") return option.label_lv;
  if (locale === "el") return option.label_el;
  return option.label_en;
}

export function getAttributeOptionChoices(
  values: RawAttributeOptionValue[] | null | undefined,
  locale: AttributeOptionLocale,
) {
  return normalizeAttributeOptionValues(values).map((option): AttributeOptionChoice => ({
    value: option.slug,
    label: getLocalizedAttributeOptionLabel(option, locale),
    aliases: uniqueStrings([
      option.slug,
      option.label_ru,
      option.label_en,
      option.label_lv,
      option.label_el,
    ]),
  }));
}

export function splitMultiValue(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function localizeStoredAttributeValue(
  value: string,
  options: RawAttributeOptionValue[] | null | undefined,
  locale: AttributeOptionLocale,
) {
  const normalizedOptions = normalizeAttributeOptionValues(options);
  const parts = splitMultiValue(value);

  if (parts.length === 0) return value;

  return parts
    .map((part) => {
      const matched = normalizedOptions.find((option) =>
        uniqueStrings([
          option.slug,
          option.label_ru,
          option.label_en,
          option.label_lv,
          option.label_el,
        ]).includes(part),
      );

      return matched ? getLocalizedAttributeOptionLabel(matched, locale) : part;
    })
    .join(", ");
}

export function normalizeSelectedChoiceValues(
  value: string,
  choices: AttributeOptionChoice[],
) {
  const parts = splitMultiValue(value);
  const normalizedParts = parts.map((part) => {
    const matched = choices.find((choice) => choice.aliases.includes(part));
    return matched?.value || part;
  });

  return uniqueStrings(normalizedParts);
}

export function normalizeSelectedOptionsMap(
  value: SelectedOptionMap | null | undefined,
) {
  return Object.fromEntries(
    Object.entries(value ?? {})
      .map(([key, entryValue]) => [key.trim(), typeof entryValue === "string" ? entryValue.trim() : ""])
      .filter(([key, entryValue]) => key && entryValue)
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function createVariantKey(value: SelectedOptionMap | null | undefined) {
  const normalized = normalizeSelectedOptionsMap(value);
  return Object.entries(normalized)
    .map(([key, entryValue]) => `${key}:${entryValue}`)
    .join("|");
}
