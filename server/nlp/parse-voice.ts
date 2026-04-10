import {
  detectCategoryFromRules,
  detectType,
  rulesFromCategories,
  type CategoryMatchRule,
} from "@/server/nlp/categories";
import { parseAmountFromText } from "@/server/nlp/amount";
import type { CategoryType } from "@/server/entities/Category";

export type VoiceParseResult = {
  transcript: string;
  amount: number | null;
  categoryId: string;
  categoryName: string;
  type: "expense" | "income";
  categoryUncertain?: boolean;
  evidence?: {
    amount?: string;
    keyword?: string;
  };
};

type CatRow = { id: string; name: string; type: CategoryType; keywords: string[]; isActive: boolean };

export function parseVoiceTranscript(transcript: string, userCategories: CatRow[]): VoiceParseResult {
  const { amount, evidence: amountEvidence } = parseAmountFromText(transcript);
  const type = detectType(transcript);
  const active = userCategories.filter((c) => c.isActive);
  const rules: CategoryMatchRule[] = rulesFromCategories(active);
  const matched = detectCategoryFromRules(transcript, type, rules);
  const uncertain = matched.categoryName === "Boshqa" && !matched.matchedKeyword;

  return {
    transcript,
    amount,
    categoryId: matched.categoryId,
    categoryName: matched.categoryName,
    type,
    categoryUncertain: uncertain,
    evidence: {
      amount: amountEvidence,
      keyword: matched.matchedKeyword,
    },
  };
}
