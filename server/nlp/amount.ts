/*
const WORDS: Record<string, number> = {
  nol: 0,
  bir: 1,
  ikki: 2,
  uch: 3,
  tort: 4,
  "to'rt": 4,
  "to‘rt": 4,
  besh: 5,
  olti: 6,
  yetti: 7,
  sakkiz: 8,
  toqqiz: 9,
  "to'qqiz": 9,
  "to‘qqiz": 9,
  on: 10,
  "o'n": 10,
  "o‘n": 10,
  yigirma: 20,
  ottiz: 30,
  "o'ttiz": 30,
  "o‘ttiz": 30,
  qirq: 40,
  ellik: 50,
  oltmish: 60,
  yetmish: 70,
  sakson: 80,
  toqson: 90,
  "to'qson": 90,
  "to‘qson": 90,
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .replaceAll("’", "'")
    .replaceAll("ʻ", "'")
    .replaceAll("`", "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseAmountFromText(text: string): {
  amount: number | null;
  evidence?: string;
} {
  const raw = normalize(text);

  // 1) Raqamli: 120 ming, 45 000, 1 200 000, 1 mln, 2 million
  const numeric = parseNumericAmount(raw);
  if (numeric) return numeric;

  // 2) So‘zli: "bir million", "ikki yuz ming", ...
  const wordy = parseWordAmount(raw);
  if (wordy) return wordy;

  return { amount: null };
}

function parseNumericAmount(t: string): { amount: number; evidence: string } | null {
  const m =
    t.match(
      /\b(\d{1,3}(?:[ _]\d{3})*|\d+)\s*(ming|mln|million|milyon)?\b/
    ) ?? null;
  if (!m) return null;

  const numStr = m[1].replace(/[ _]/g, "");
  const base = Number(numStr);
  if (!Number.isFinite(base)) return null;

  const unit = m[2];
  let mult = 1;
  if (unit === "ming") mult = 1_000;
  if (unit === "mln" || unit === "million" || unit === "milyon") mult = 1_000_000;

  const amount = Math.round(base * mult);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return { amount, evidence: m[0] };
}

function parseWordAmount(t: string): { amount: number; evidence: string } | null {
  // Juda yengil parser: [x] yuz [y] ming [z] ... (million/ming bilan)
  // Misollar:
  // - "bir million" => 1_000_000
  // - "ikki yuz ming" => 200_000
  // - "bir yuz yigirma ming" => 120_000
  // - "bir million ikki yuz ming" => 1_200_000

  const tokens = t.split(" ");
  const idxMillion = tokens.findIndex((x) => x === "million" || x === "milyon");
  const idxMing = tokens.findIndex((x) => x === "ming");

  let evidence = "";
  let total = 0;

  if (idxMillion !== -1) {
    const left = tokens.slice(0, idxMillion);
    const millionPart = parseUnderThousand(left);
    if (millionPart === null) return null;
    total += millionPart * 1_000_000;
    evidence = tokens.slice(0, idxMillion + 1).join(" ");
  }

  if (idxMing !== -1) {
    const start = idxMillion !== -1 ? idxMillion + 1 : 0;
    const left = tokens.slice(start, idxMing);
    const thousandPart = parseUnderThousand(left);
    if (thousandPart === null) return null;
    total += thousandPart * 1_000;
    evidence = tokens.slice(0, idxMing + 1).join(" ");
  }

  if (total > 0) return { amount: total, evidence: evidence.trim() };
  return null;
}

function parseUnderThousand(tokens: string[]): number | null {
  const t = tokens.filter(Boolean);
  if (t.length === 0) return 1; // "million" deb tursa: 1 million

  let acc = 0;
  let current = 0;

  for (const tok of t) {
    if (tok === "yuz") {
      if (current === 0) current = 1;
      current *= 100;
      acc += current;
      current = 0;
      continue;
    }

    const n = WORDS[tok] ?? null;
    if (n === null) return null;
    current += n;
  }

  return acc + current;
}

*/
const WORDS: Record<string, number> = {
  nol: 0,
  bir: 1,
  ikki: 2,
  uch: 3,
  tort: 4,
  "to'rt": 4,
  "to‘rt": 4,
  toʻrt: 4,
  besh: 5,
  olti: 6,
  yetti: 7,
  sakkiz: 8,
  toqqiz: 9,
  "to'qqiz": 9,
  "to‘qqiz": 9,
  toʻqqiz: 9,
  on: 10,
  "o'n": 10,
  "o‘n": 10,
  oʻn: 10,
  yigirma: 20,
  ottiz: 30,
  "o'ttiz": 30,
  "o‘ttiz": 30,
  oʻttiz: 30,
  qirq: 40,
  ellik: 50,
  oltmish: 60,
  yetmish: 70,
  sakson: 80,
  toqson: 90,
  "to'qson": 90,
  "to‘qson": 90,
  toʻqson: 90,
};

function normalize(s: string): string {
  return s
      .toLowerCase()
      // Apostrof variantlari
      .replaceAll("’", "'")
      .replaceAll("ʻ", "'")
      .replaceAll("`", "'")
      .replaceAll("“", '"')
      .replaceAll("”", '"')
      // Oʻzbekcha maxsus harflar
      .replaceAll("o‘", "o'")
      .replaceAll("oʻ", "o'")
      .replaceAll("g‘", "g'")
      .replaceAll("gʻ", "g'")
      .replaceAll("sh", "sh")
      .replaceAll("ch", "ch")
      // Qoʻshimcha shovqinlarni tozalash
      .replace(/[^a-z0-9'\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
}

export function parseAmountFromText(text: string): {
  amount: number | null;
  evidence?: string;
} {
  const raw = normalize(text);

  // 1. Raqamli formatlar (eng yuqori ustunlik)
  const numeric = parseNumericAmount(raw);
  if (numeric) return numeric;

  // 2. Soʻz bilan yozilgan summalar
  const wordy = parseWordAmountImproved(raw);
  if (wordy) return wordy;

  return { amount: null };
}

/** Raqamli: 200 000, 1 200 000, 45 ming, 2 mln, 3 million va h.k. */
function parseNumericAmount(t: string): { amount: number; evidence: string } | null {
  // Kengaytirilgan regex: bo'sh joy, nuqta, vergul bilan ajratilgan raqamlar + birlik
  const m = t.match(
      /\b(\d{1,3}(?:[.,\s]\d{3})*|\d+)\s*(ming|mln|million|milyon|milliard|mlrd)?\b/i
  );

  if (!m) return null;

  let numStr = m[1].replace(/[.,\s]/g, "");
  const base = Number(numStr);
  if (!Number.isFinite(base) || base <= 0) return null;

  const unit = (m[2] || "").toLowerCase();
  let mult = 1;
  if (unit === "ming") mult = 1_000;
  else if (["mln", "million", "milyon"].includes(unit)) mult = 1_000_000;
  else if (["mlrd", "milliard"].includes(unit)) mult = 1_000_000_000;

  const amount = Math.round(base * mult);
  return { amount, evidence: m[0].trim() };
}

/** Yangi, kuchliroq soʻzli parser */
function parseWordAmountImproved(t: string): { amount: number; evidence: string } | null {
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let total = 0;
  let current = 0;           // hozirgi yuzlik/qism
  let evidenceParts: string[] = [];

  const unitWords = new Set(["yuz", "ming", "million", "milyon", "milliard", "mlrd"]);

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok === "yuz") {
      if (current === 0) current = 1;   // "yuz" → 100
      current *= 100;
      continue;
    }

    if (["ming", "million", "milyon", "milliard", "mlrd"].includes(tok)) {
      let mult = 1;
      if (tok === "ming") mult = 1_000;
      else if (tok === "million" || tok === "milyon") mult = 1_000_000;
      else if (tok === "milliard" || tok === "mlrd") mult = 1_000_000_000;

      // Agar oldin hech narsa bo'lmasa → 1 * mult
      if (current === 0) current = 1;

      total += current * mult;
      evidenceParts.push(tokens.slice(Math.max(0, i - 5), i + 1).join(" ")); // yaqin kontekst

      current = 0;
      continue;
    }

    // Oddiy son soʻzi
    const n = WORDS[tok];
    if (n !== undefined) {
      current += n;
      continue;
    }

    // Noma'lum soʻz — agar current bor bo'lsa, uni "tugatib" qo'yamiz (masalan keyingi birlik bo'lishi mumkin)
    if (current > 0 && !unitWords.has(tok)) {
      total += current;
      current = 0;
    }
  }

  // Oxirida qolgan qism (ming/million siz qolgan bo'lsa)
  if (current > 0) {
    total += current;
  }

  if (total > 0) {
    return {
      amount: total,
      evidence: evidenceParts.length > 0
          ? evidenceParts.join(" | ")
          : tokens.join(" ")
    };
  }

  return null;
}