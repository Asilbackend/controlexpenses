import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/get-session";
import { listVoiceLogsAdmin } from "@/server/services/admin";

export default async function AdminVoiceLogsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.admin) redirect("/dashboard");

  const logs = await listVoiceLogsAdmin(200);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-lg font-semibold">Ovoz jurnali</h1>
          <p className="text-sm text-zinc-600">Transkripsiya va parser natijalari</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
        {logs.map((l) => (
          <article key={l.id} className="rounded-2xl border border-black/10 bg-white p-4 text-sm">
            <p className="text-xs text-zinc-500">
              {l.createdAt.toISOString()} · {l.user?.email ?? l.userId}
            </p>
            <p className="mt-2 font-medium">{l.transcript}</p>
            {l.fileName && <p className="mt-1 text-xs text-zinc-500">Fayl: {l.fileName}</p>}
            {l.parsed && (
              <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-zinc-50 p-2 text-xs">{JSON.stringify(l.parsed, null, 2)}</pre>
            )}
          </article>
        ))}
        {logs.length === 0 && <p className="text-sm text-zinc-500">Yozuvlar yo‘q</p>}
        <Link href="/admin/users" className="text-sm underline">
          ← Foydalanuvchilar
        </Link>
      </main>
    </div>
  );
}
