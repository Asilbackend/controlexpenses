import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/get-session";

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.admin) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-lg font-semibold">Kategoriyalar (admin)</h1>
          <p className="text-sm text-zinc-600">Har bir foydalanuvchining kategoriyalari alohida</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-3 px-4 py-6 text-sm">
        <p className="text-zinc-600">
          Standart kategoriyalar ro‘yxatdan o‘tganda avtomatik yaratiladi. O‘z kategoriyalaringizni boshqarish uchun umumiy{" "}
          <Link href="/categories" className="font-medium underline">
            Kategoriyalar
          </Link>{" "}
          sahifasiga o‘ting.
        </p>
      </main>
    </div>
  );
}
