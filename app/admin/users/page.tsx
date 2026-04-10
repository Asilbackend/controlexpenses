import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/get-session";
import { listUsersForAdmin } from "@/server/services/admin";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.admin) redirect("/dashboard");

  const users = await listUsersForAdmin(500);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-lg font-semibold">Foydalanuvchilar</h1>
          <p className="text-sm text-zinc-600">Administrator ko‘rinishi</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs text-zinc-500">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Ism</th>
                <th className="p-3">Admin</th>
                <th className="p-3">Ro‘yxatdan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-black/5">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.displayName ?? "—"}</td>
                  <td className="p-3">{u.isAdmin ? "Ha" : "Yo‘q"}</td>
                  <td className="p-3 whitespace-nowrap">{u.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
