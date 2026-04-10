"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatSom } from "@/lib/money";

type Tx = {
  id: string;
  type: "expense" | "income";
  amount: number;
  description: string | null;
  occurredAt: string;
  source: string;
  category?: { id: string; name: string; color?: string; icon?: string };
};

function currentMonth() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function TransactionsClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const month = sp.get("month") || currentMonth();
  const [items, setItems] = useState<Tx[]>([]);
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/transactions?month=${encodeURIComponent(month)}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Yuklanmadi");
      return;
    }
    const raw = (data.items ?? []) as Tx[];
    setItems(
      raw.map((t) => ({
        ...t,
        occurredAt:
          typeof t.occurredAt === "string"
            ? t.occurredAt
            : new Date(t.occurredAt as unknown as string).toISOString(),
      }))
    );
  }, [month]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = items.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (q.trim()) {
      const qq = q.toLowerCase();
      const cat = t.category?.name?.toLowerCase() ?? "";
      const desc = (t.description ?? "").toLowerCase();
      if (!cat.includes(qq) && !desc.includes(qq)) return false;
    }
    return true;
  });

  async function remove(id: string) {
    if (!confirm("O‘chirishni tasdiqlaysizmi?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "O‘chirilmadi");
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Tranzaksiyalar</h1>
            <p className="text-sm text-zinc-600">Oy: {month}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/transactions/new?month=${encodeURIComponent(month)}`}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            >
              + Qo‘shish
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-6">
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-black/10 bg-white p-4">
          <label className="text-xs font-semibold text-zinc-600">
            Oy
            <input
              className="mt-1 block rounded-xl border border-black/10 px-3 py-2 text-sm"
              type="month"
              defaultValue={month}
              onChange={(e) => router.push(`/transactions?month=${encodeURIComponent(e.target.value)}`)}
            />
          </label>
          <label className="text-xs font-semibold text-zinc-600">
            Tur
            <select
              className="mt-1 block rounded-xl border border-black/10 px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            >
              <option value="all">Hammasi</option>
              <option value="expense">Harajat</option>
              <option value="income">Tushum</option>
            </select>
          </label>
          <label className="min-w-[200px] flex-1 text-xs font-semibold text-zinc-600">
            Qidiruv
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kategoriya yoki izoh"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-xs text-zinc-500">
              <tr>
                <th className="p-3">Sana</th>
                <th className="p-3">Tur</th>
                <th className="p-3">Kategoriya</th>
                <th className="p-3">Summa</th>
                <th className="p-3">Izoh</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-black/5">
                  <td className="p-3 whitespace-nowrap">{t.occurredAt.slice(0, 10)}</td>
                  <td className="p-3">{t.type === "income" ? "Tushum" : "Harajat"}</td>
                  <td className="p-3">
                    <span className="mr-1">{t.category?.icon}</span>
                    {t.category?.name ?? "—"}
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatSom(t.amount)}</td>
                  <td className="p-3 max-w-xs truncate">{t.description ?? ""}</td>
                  <td className="p-3 whitespace-nowrap">
                    <Link
                      href={`/transactions/${t.id}/edit?month=${encodeURIComponent(month)}`}
                      className="mr-2 text-xs font-medium underline"
                    >
                      Tahrirlash
                    </Link>
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 underline disabled:opacity-50"
                      disabled={busyId === t.id}
                      onClick={() => void remove(t.id)}
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-zinc-500">Yozuvlar yo‘q</p>}
        </div>
      </main>
    </div>
  );
}
