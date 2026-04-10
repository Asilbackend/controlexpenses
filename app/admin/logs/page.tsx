import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/get-session";

export default async function AdminLogsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.admin) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-lg font-semibold">Tizim jurnali</h1>
          <p className="text-sm text-zinc-600">Tez orada: audit va xatoliklar</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 text-sm text-zinc-600">
        Hozircha markazlashtirilgan loglar yo‘q. Ovozli so‘rovlar uchun{" "}
        <a className="underline" href="/admin/voice-logs">
          Ovoz jurnali
        </a>{" "}
        sahifasiga qarang.
      </main>
    </div>
  );
}
