"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, displayName: displayName || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Ro‘yxatdan o‘tishda xatolik");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-xl font-semibold">Ro‘yxatdan o‘tish</h1>
      <p className="mt-1 text-sm text-zinc-600">Yangi hisob yarating</p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-3 rounded-2xl border border-black/10 bg-white p-4">
        <label className="block text-xs font-semibold text-zinc-600">
          Email
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-xs font-semibold text-zinc-600">
          Parol (kamida 8 belgi)
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label className="block text-xs font-semibold text-zinc-600">
          Ism (ixtiyoriy)
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Kutilmoqda..." : "Yaratish"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        Allaqachon hisob bormi?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Kirish
        </Link>
      </p>
    </div>
  );
}
