"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Me = { email: string; displayName: string | null; isAdmin: boolean };

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) {
      setMe(null);
      return;
    }
    const data = await res.json().catch(() => ({}));
    setMe(data.user ?? null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setMe(null);
    router.push("/login");
    router.refresh();
  }

  if (me === undefined || me === null) return null;

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`rounded-lg px-2 py-1 text-sm hover:bg-zinc-100 ${pathname === href || pathname.startsWith(href + "/") ? "font-semibold text-zinc-900" : "text-zinc-600"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          {link("/dashboard", "Bosh sahifa")}
          {link("/transactions", "Tranzaksiyalar")}
          {link("/transactions/new", "Qo‘shish")}
          {link("/categories", "Kategoriyalar")}
          {link("/reports", "Hisobotlar")}
          {link("/voice", "Ovoz")}
          {link("/profile", "Profil")}
         {/* {link("/settings", "Sozlamalar")}*/}
          {me.isAdmin && link("/admin/users", "Foydalanuvchilar")}
          {me.isAdmin && link("/admin/voice-logs", "Ovoz jurnali")}
          {me.isAdmin && link("/admin/logs", "Jurnal")}
          {me.isAdmin && link("/admin/categories", "Admin: kategoriya")}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-zinc-500 sm:inline">{me.email}</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Chiqish
          </button>
        </div>
      </div>
    </header>
  );
}
