import type { CategoryType } from "../entities/Category";

export type DefaultCategorySeed = {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  keywords: string[];
};

/** Standart harajat va tushum kategoriyalari (ro‘yxatdan o‘tganda nusxalanadi) */
export const DEFAULT_CATEGORY_SEEDS: DefaultCategorySeed[] = [
  {
    name: "Oziq-ovqat",
    type: "expense",
    color: "#22c55e",
    icon: "🥬",
    keywords: ["supermarket", "market", "do‘kon", "do'kon", "non", "ovqat", "restoran", "kafe", "oziq"],
  },
  {
    name: "Transport",
    type: "expense",
    color: "#3b82f6",
    icon: "🚕",
    keywords: ["taksi", "taxi", "avtobus", "metro", "yo‘l kira", "yo'l kira", "benzin", "gaz", "transport"],
  },
  {
    name: "Uy-joy",
    type: "expense",
    color: "#a855f7",
    icon: "🏠",
    keywords: ["ijara", "kvartira", "uy", "uy-joy"],
  },
  {
    name: "Kommunal",
    type: "expense",
    color: "#eab308",
    icon: "💡",
    keywords: ["kommunal", "svet", "elektr", "suv", "issiqlik", "internet"],
  },
  {
    name: "Sog‘liq",
    type: "expense",
    color: "#ef4444",
    icon: "💊",
    keywords: ["dorixona", "apteka", "dori", "shifokor", "klinika", "sog‘liq", "sog'liq"],
  },
  {
    name: "Ta’lim",
    type: "expense",
    color: "#6366f1",
    icon: "📚",
    keywords: ["kurs", "o‘qish", "o'qish", "kontrakt", "universitet", "ta'lim", "ta’lim"],
  },
  {
    name: "Kiyim",
    type: "expense",
    color: "#ec4899",
    icon: "👕",
    keywords: ["kiyim", "poyabzal", "do‘kon kiyim", "magazin"],
  },
  {
    name: "Ko‘ngilochar",
    type: "expense",
    color: "#14b8a6",
    icon: "🎬",
    keywords: ["kino", "o‘yin", "o'yin", "sayohat", "ko‘ngil", "kongil"],
  },
  {
    name: "Kredit / qarz",
    type: "expense",
    color: "#64748b",
    icon: "🏦",
    keywords: ["kredit", "qarz", "bank", "to‘lov kredit", "tolov kredit"],
  },
  {
    name: "Oila",
    type: "expense",
    color: "#f97316",
    icon: "👨‍👩‍👧",
    keywords: ["oila", "bolalar", "maktab", "bog‘cha", "bog'cha"],
  },
  {
    name: "Boshqa",
    type: "expense",
    color: "#94a3b8",
    icon: "📌",
    keywords: [],
  },
  {
    name: "Oylik",
    type: "income",
    color: "#22c55e",
    icon: "💰",
    keywords: ["oylik", "maosh", "ish haqi"],
  },
  {
    name: "Bonus",
    type: "income",
    color: "#84cc16",
    icon: "🎁",
    keywords: ["bonus", "premiya"],
  },
  {
    name: "Freelance",
    type: "income",
    color: "#0ea5e9",
    icon: "💻",
    keywords: ["freelance", "frilans", "loyiha"],
  },
  {
    name: "Savdo",
    type: "income",
    color: "#d946ef",
    icon: "🛒",
    keywords: ["savdo", "sotuv", "kirim", "daromad"],
  },
  {
    name: "Boshqa",
    type: "income",
    color: "#94a3b8",
    icon: "➕",
    keywords: ["tushum", "foyda"],
  },
];
