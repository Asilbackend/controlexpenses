"use client";

import { useCallback, useEffect, useState } from "react";

type Cat = {
  id: string;
  name: string;
  type: "expense" | "income";
  color: string;
  icon: string;
  isActive: boolean;
  keywords: string[];
};

export default function CategoriesPage() {
  const [items, setItems] = useState<Cat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "expense" as "expense" | "income",
    color: "#6366f1",
    icon: "📁",
    isActive: true,
    keywords: "",
  });

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/categories?includeInactive=1", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Yuklanmadi");
      return;
    }
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ name: "", type: "expense", color: "#6366f1", icon: "📁", isActive: true, keywords: "" });
  }

  function openEdit(c: Cat) {
    setEditing(c);
    setCreating(false);
    setForm({
      name: c.name,
      type: c.type,
      color: c.color,
      icon: c.icon,
      isActive: c.isActive,
      keywords: (c.keywords ?? []).join(", "),
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const kw = form.keywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (creating) {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            color: form.color,
            icon: form.icon,
            isActive: form.isActive,
            keywords: kw,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Qo‘shilmadi");
        setCreating(false);
      } else if (editing) {
        const res = await fetch(`/api/categories/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            color: form.color,
            icon: form.icon,
            isActive: form.isActive,
            keywords: kw,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Saqlanmadi");
        setEditing(null);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Cat) {
    if (!confirm(`“${c.name}” o‘chirilsinmi?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "O‘chirilmadi");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Kategoriyalar</h1>
            <p className="text-sm text-zinc-600">Standart to‘plam ro‘yxatdan o‘tganda yaratiladi</p>
          </div>
          <button type="button" className="rounded-xl bg-black px-4 py-2 text-sm text-white" onClick={openCreate}>
            + Yangi
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-6">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {(creating || editing) && (
          <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold">{creating ? "Yangi kategoriya" : "Tahrirlash"}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-xs font-semibold text-zinc-600">
                Nomi
                <input
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Tur
                <select
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "expense" | "income" }))}
                >
                  <option value="expense">Harajat</option>
                  <option value="income">Tushum</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Rang
                <input
                  className="mt-1 h-10 w-full rounded-xl border border-black/10 px-1 py-1 text-sm"
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                />
              </label>
              <label className="text-xs font-semibold text-zinc-600">
                Ikonka
                <input
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                />
              </label>
              <label className="md:col-span-2 text-xs font-semibold text-zinc-600">
                Kalit so‘zlar (vergul bilan)
                <input
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                  value={form.keywords}
                  onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                  placeholder="taksi, benzin"
                />
              </label>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Aktiv
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                onClick={() => void save()}
              >
                Saqlash
              </button>
              <button
                type="button"
                className="rounded-xl border px-4 py-2 text-sm"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              >
                Bekor
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs text-zinc-500">
              <tr>
                <th className="p-3">Ikonka</th>
                <th className="p-3">Nomi</th>
                <th className="p-3">Tur</th>
                <th className="p-3">Rang</th>
                <th className="p-3">Holat</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-black/5">
                  <td className="p-3 text-lg">{c.icon}</td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.type === "income" ? "Tushum" : "Harajat"}</td>
                  <td className="p-3">
                    <span className="inline-block h-4 w-4 rounded-full border align-middle" style={{ backgroundColor: c.color }} />{" "}
                    <span className="text-xs text-zinc-500">{c.color}</span>
                  </td>
                  <td className="p-3">{c.isActive ? "Aktiv" : "Pasiv"}</td>
                  <td className="p-3 space-x-2 whitespace-nowrap">
                    <button type="button" className="text-xs underline" onClick={() => openEdit(c)}>
                      Tahrirlash
                    </button>
                    <button type="button" className="text-xs text-red-600 underline" onClick={() => void remove(c)}>
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
