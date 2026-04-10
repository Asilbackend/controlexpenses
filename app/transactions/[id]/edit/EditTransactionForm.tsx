"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatSom } from "@/lib/money";
import { CategoryPicker, type CategoryOption } from "@/components/category-picker";

export function EditTransactionForm() {
  const router = useRouter();
  const params = useParams();
  const sp = useSearchParams();
  const id = String(params.id ?? "");
  const month = sp.get("month") || "";

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [occurredAt, setOccurredAt] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [cRes, tRes] = await Promise.all([
        fetch("/api/categories?includeInactive=1", { credentials: "include" }),
        fetch(`/api/transactions/${id}`, { credentials: "include" }),
      ]);
      const cData = await cRes.json().catch(() => ({}));
      const tData = await tRes.json().catch(() => ({}));
      if (!cRes.ok || !tRes.ok) {
        setError(cData?.error || tData?.error || "Yuklanmadi");
        return;
      }
      setCategories(cData.items ?? []);
      const item = tData.item;
      setType(item.type);
      setCategoryId(item.categoryId ?? item.category?.id ?? null);
      setAmount(item.amount);
      setDescription(item.description ?? "");
      const d = new Date(item.occurredAt);
      const pad = (n: number) => String(n).padStart(2, "0");
      setOccurredAt(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
    })();
  }, [id]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      if (!categoryId) throw new Error("Kategoriya tanlang");
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type,
          categoryId,
          amount,
          description: description || null,
          occurredAt: new Date(occurredAt).toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Saqlanmadi");
      router.push(month ? `/transactions?month=${encodeURIComponent(month)}` : "/transactions");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">Tranzaksiyani tahrirlash</h1>
          <Link href={month ? `/transactions?month=${encodeURIComponent(month)}` : "/transactions"} className="text-sm underline">
            Orqaga
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
        <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
          <label className="block text-xs font-semibold text-zinc-600">
            Tur
            <select
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as "expense" | "income")}
            >
              <option value="expense">Harajat</option>
              <option value="income">Tushum</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-zinc-600">
            Kategoriya
            <div className="mt-1">
              <CategoryPicker type={type} categories={categories} valueId={categoryId} onChange={setCategoryId} disabled={busy} />
            </div>
          </label>
          <label className="block text-xs font-semibold text-zinc-600">
            Summa
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              type="number"
              min={1}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <span className="mt-1 block text-xs text-zinc-500">{amount > 0 ? formatSom(amount) : ""}</span>
          </label>
          <label className="block text-xs font-semibold text-zinc-600">
            Sana
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold text-zinc-600">
            Izoh
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={busy || amount <= 0 || !categoryId}
            onClick={() => void save()}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Saqlash
          </button>
        </div>
      </main>
    </div>
  );
}
