import { CategoryType } from "@/server/entities/Category";

export type CategoryMatchRule = {
  categoryId: string;
  categoryName: string;
  type: CategoryType;
  keywords: string[];
};

/** @deprecated Faqat test / fallback; asosiy oqim foydalanuvchi kategoriyalari */
export const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  { category: "Transport", keywords: ["taksi", "taxi", "avtobus", "metro", "yo‘l kira", "yo'l kira", "benzin", "gaz"] },
  { category: "Oziq-ovqat", keywords: ["supermarket", "market", "do‘kon", "do'kon", "non", "ovqat", "restoran", "kafe"] },
  { category: "Uy-joy", keywords: ["ijara", "kommunal", "svet", "gaz", "suv", "internet", "kvartira"] },
  { category: "Sog‘liq", keywords: ["dorixona", "apteka", "dori", "shifokor", "klinika"] },
  { category: "Ta’lim", keywords: ["kurs", "o‘qish", "o'qish", "kontrakt", "universitet"] },
  { category: "Aloqa", keywords: ["telefon", "tarif", "mobil", "sim", "internet"] },
  { category: "Ko‘ngilochar", keywords: ["kino", "o‘yin", "o'yin", "cafe", "kafe", "sayohat"] },
];

export function detectCategory(text: string): { category: string; matchedKeyword?: string } {
  const t = normalize(text);
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      const k = normalize(kw);
      if (t.includes(k)) return { category: rule.category, matchedKeyword: kw };
    }
  }
  return { category: "Boshqa" };
}

export function detectCategoryFromRules(
  text: string,
  type: CategoryType,
  rules: CategoryMatchRule[]
): { categoryId: string; categoryName: string; matchedKeyword?: string } {
  const t = normalize(text);
  const scoped = rules.filter((r) => r.type === type);
  for (const rule of scoped) {
    for (const kw of rule.keywords) {
      const k = normalize(kw);
      if (!k) continue;
      if (t.includes(k)) {
        return { categoryId: rule.categoryId, categoryName: rule.categoryName, matchedKeyword: kw };
      }
    }
  }
  const fallback = scoped.find((r) => r.categoryName === "Boshqa") ?? scoped[0];
  if (fallback) {
    return { categoryId: fallback.categoryId, categoryName: fallback.categoryName };
  }
  throw new Error("Kategoriya ro‘yxati bo‘sh");
}

export function detectType(text: string): "expense" | "income" {
  const t = normalize(text);
  const incomeKeywords = ["tushum", "maosh", "oylik", "sotuv", "kirim", "daromad", "foyda", "bonus", "freelance", "frilans"];
  for (const kw of incomeKeywords) {
    if (t.includes(normalize(kw))) return "income";
  }
  return "expense";
}

export function rulesFromCategories(
  cats: { id: string; name: string; type: CategoryType; keywords: string[] }[]
): CategoryMatchRule[] {
  return cats.map((c) => ({
    categoryId: c.id,
    categoryName: c.name,
    type: c.type,
    keywords: c.keywords?.length ? c.keywords : [normalize(c.name)].filter(Boolean),
  }));
}

export function normalize(s: string) {
  return s
    .toLowerCase()
    .replaceAll("’", "'")
    .replaceAll("ʻ", "'")
    .replaceAll("`", "'")
    .replace(/\s+/g, " ")
    .trim();
}
