import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/get-session";
import { getDataSource } from "@/server/db/data-source";
import { userRepo } from "@/server/db/repositories";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const ds = await getDataSource();
  const user = await userRepo(ds).findOne({ where: { id: session.sub } });
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-lg font-semibold">Profil</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl space-y-3 px-4 py-6">
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm">
          <p>
            <span className="text-zinc-500">Email:</span> {user.email}
          </p>
          <p className="mt-2">
            <span className="text-zinc-500">Ism:</span> {user.displayName ?? "—"}
          </p>
          <p className="mt-2">
            <span className="text-zinc-500">Rol:</span> {user.isAdmin ? "Administrator" : "Foydalanuvchi"}
          </p>
        </div>
      </main>
    </div>
  );
}
