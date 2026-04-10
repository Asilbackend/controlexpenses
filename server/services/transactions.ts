import { Between } from "typeorm";
import { getDataSource } from "@/server/db/data-source";
import { categoryRepo, transactionRepo } from "@/server/db/repositories";
import type { Transaction } from "@/server/entities/Transaction";
import { getCategoryForUser } from "@/server/services/categories";

export async function createTransaction(input: {
  userId: string;
  type: "expense" | "income";
  categoryId: string;
  amount: number;
  description?: string | null;
  occurredAt: Date;
  source: "manual" | "voice";
  transcript?: string | null;
}): Promise<Transaction> {
  const cat = await getCategoryForUser(input.userId, input.categoryId);
  if (!cat || !cat.isActive) throw new Error("Kategoriya topilmadi yoki o‘chirilgan");
  if (cat.type !== input.type) throw new Error("Kategoriya turi tranzaksiya turi bilan mos kelmaydi");

  const ds = await getDataSource();
  const repo = transactionRepo(ds);

  const t = repo.create({
    userId: input.userId,
    categoryId: input.categoryId,
    type: input.type,
    amount: input.amount,
    description: input.description ?? null,
    occurredAt: input.occurredAt,
    source: input.source,
    transcript: input.transcript ?? null,
  });

  return await repo.save(t);
}

export async function updateTransaction(
  userId: string,
  id: string,
  patch: Partial<{
    type: "expense" | "income";
    categoryId: string;
    amount: number;
    description: string | null;
    occurredAt: Date;
  }>
): Promise<Transaction> {
  const ds = await getDataSource();
  const repo = transactionRepo(ds);
  const t = await repo.findOne({ where: { id, userId }, relations: { category: true } });
  if (!t) throw new Error("Yozuv topilmadi");

  const nextType = patch.type ?? t.type;
  const nextCategoryId = patch.categoryId ?? t.categoryId;

  if (patch.categoryId !== undefined || patch.type !== undefined) {
    const cat = await getCategoryForUser(userId, nextCategoryId);
    if (!cat || !cat.isActive) throw new Error("Kategoriya topilmadi yoki o‘chirilgan");
    if (cat.type !== nextType) throw new Error("Kategoriya turi tranzaksiya turi bilan mos kelmaydi");
    t.categoryId = nextCategoryId;
    t.type = nextType;
  }

  if (patch.amount !== undefined) t.amount = patch.amount;
  if (patch.description !== undefined) t.description = patch.description;
  if (patch.occurredAt !== undefined) t.occurredAt = patch.occurredAt;

  return repo.save(t);
}

export async function deleteTransaction(userId: string, id: string): Promise<void> {
  const ds = await getDataSource();
  const res = await transactionRepo(ds).delete({ id, userId });
  if (!res.affected) throw new Error("Yozuv topilmadi");
}

export async function getTransaction(userId: string, id: string): Promise<Transaction | null> {
  const ds = await getDataSource();
  return transactionRepo(ds).findOne({
    where: { id, userId },
    relations: { category: true },
  });
}

export async function listTransactionsByMonth(userId: string, month: string): Promise<Transaction[]> {
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    throw new Error("month noto‘g‘ri. Format: YYYY-MM");
  }

  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));

  const ds = await getDataSource();
  const repo = transactionRepo(ds);

  return await repo.find({
    where: { userId, occurredAt: Between(start, end) },
    relations: { category: true },
    order: { occurredAt: "DESC" },
  });
}

export async function getDashboardByMonth(userId: string, month: string) {
  const items = await listTransactionsByMonth(userId, month);
  let expense = 0;
  let income = 0;

  const byCategory: Record<string, number> = {};
  const byDay: Record<string, { expense: number; income: number }> = {};

  for (const t of items) {
    if (t.type === "expense") expense += t.amount;
    else income += t.amount;

    const label = t.category?.name ?? "—";
    byCategory[label] = (byCategory[label] ?? 0) + (t.type === "expense" ? t.amount : 0);

    const day = t.occurredAt.toISOString().slice(0, 10);
    byDay[day] = byDay[day] ?? { expense: 0, income: 0 };
    byDay[day][t.type] += t.amount;
  }

  const categorySeries = Object.entries(byCategory)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const daySeries = Object.entries(byDay)
    .map(([day, v]) => ({ day, expense: v.expense, income: v.income }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return {
    month,
    totals: { expense, income, net: income - expense },
    categorySeries,
    daySeries,
    items,
  };
}

/** Kategoriya ranglari bilan diagramma uchun */
export async function categoryColorMap(userId: string): Promise<Record<string, string>> {
  const ds = await getDataSource();
  const cats = await categoryRepo(ds).find({ where: { userId } });
  const map: Record<string, string> = {};
  for (const c of cats) map[c.name] = c.color;
  return map;
}
