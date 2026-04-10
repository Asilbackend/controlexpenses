"use client";

import { useMemo, useState } from "react";

function currentMonth() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonth());

  const href = useMemo(() => `/api/reports/export?month=${encodeURIComponent(month)}`, [month]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-lg font-semibold">Hisobotlar</h1>
          <p className="text-sm text-zinc-600">CSV eksport</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
        <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
          <label className="text-xs font-semibold text-zinc-600">
            Oy
            <input
              className="mt-1 block rounded-xl border border-black/10 px-3 py-2 text-sm"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
          <a
            href={href}
            className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
          >
            CSV yuklab olish
          </a>
          <p className="text-xs text-zinc-500">Brauzer cookie orqali autentifikatsiyani yuboradi.</p>
        </div>
      </main>
    </div>
  );
}
