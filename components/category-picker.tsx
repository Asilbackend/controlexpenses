"use client";

import { useMemo, useState } from "react";

export type CategoryOption = {
  id: string;
  name: string;
  type: "expense" | "income";
  color: string;
  icon: string;
  isActive: boolean;
};

export function CategoryPicker(props: {
  type: "expense" | "income";
  categories: CategoryOption[];
  valueId: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = props.categories.filter((c) => c.type === props.type && c.isActive);
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter((c) => c.name.toLowerCase().includes(qq));
  }, [props.categories, props.type, q]);

  const selected = props.categories.find((c) => c.id === props.valueId);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-left text-sm outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <span className="text-base">{selected.icon}</span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-zinc-500">Kategoriyani tanlang</span>
          )}
        </span>
        <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-xl border border-black/10 bg-white p-2 shadow-lg">
          <input
            className="mb-2 w-full rounded-lg border border-black/10 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Qidirish..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <div className="max-h-52 overflow-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-50"
                onClick={() => {
                  props.onChange(c.id);
                  setOpen(false);
                  setQ("");
                }}
              >
                <span>{c.icon}</span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-2 py-2 text-xs text-zinc-500">Natija yo‘q</p>}
          </div>
        </div>
      )}

      {open && (
        <button
          type="button"
          aria-label="Yopish"
          className="fixed inset-0 z-30 cursor-default bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
