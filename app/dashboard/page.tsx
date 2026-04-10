import Link from "next/link";
import { redirect } from "next/navigation";
import { formatSom } from "@/lib/money";
import { getSession } from "@/server/auth/get-session";
import { categoryColorMap, getDashboardByMonth } from "@/server/services/transactions";
import { DashboardCharts } from "@/app/dashboard/DashboardCharts";

function currentMonthUtc() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default async function DashboardPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = (await props.searchParams) ?? {};
  const month = typeof sp.month === "string" ? sp.month : currentMonthUtc();

  const data = await getDashboardByMonth(session.sub, month);
  const colors = await categoryColorMap(session.sub);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Bosh sahifa</h1>
            <p className="text-sm text-zinc-600">Oy: {data.month}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MonthPicker month={month} />
            <Link
              href={`/transactions/new?month=${encodeURIComponent(month)}`}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              + Yangi yozuv
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Tushum" value={formatSom(data.totals.income)} tone="green" />
          <Card title="Harajat" value={formatSom(data.totals.expense)} tone="red" />
          <Card title="Sof natija" value={formatSom(data.totals.net)} tone="zinc" />
        </section>

        <DashboardCharts daySeries={data.daySeries} categorySeries={data.categorySeries} categoryColors={colors} />

        <section className="rounded-2xl border border-black/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Oxirgi yozuvlar</h3>
            <Link href={`/transactions?month=${encodeURIComponent(month)}`} className="text-xs font-medium text-zinc-700 underline">
              Barchasi
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-500">
                <tr>
                  <th className="py-2 pr-3">Sana</th>
                  <th className="py-2 pr-3">Tur</th>
                  <th className="py-2 pr-3">Kategoriya</th>
                  <th className="py-2 pr-3">Summa</th>
                  <th className="py-2 pr-3">Izoh</th>
                  <th className="py-2 pr-3">Manba</th>
                </tr>
              </thead>
              <tbody>
                {data.items.slice(0, 20).map((t) => (
                  <tr key={t.id} className="border-t border-black/5">
                    <td className="py-2 pr-3 whitespace-nowrap">{t.occurredAt.toISOString().slice(0, 10)}</td>
                    <td className="py-2 pr-3">{t.type === "income" ? "Tushum" : "Harajat"}</td>
                    <td className="py-2 pr-3">{t.category?.name ?? "—"}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatSom(t.amount)}</td>
                    <td className="py-2 pr-3 max-w-[420px] truncate">{t.description ?? ""}</td>
                    <td className="py-2 pr-3">{t.source === "voice" ? "Ovoz" : "Qo‘lda"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function MonthPicker(props: { month: string }) {
  return (
    <form className="flex items-center gap-2" action="/dashboard" method="get">
      <label className="text-xs text-zinc-600">
        Oy
        <input
          className="ml-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
          type="month"
          name="month"
          defaultValue={props.month}
        />
      </label>
      <button className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-zinc-50" type="submit">
        Ko‘rish
      </button>
    </form>
  );
}

function Card(props: { title: string; value: string; tone: "red" | "green" | "zinc" }) {
  const tone =
    props.tone === "red"
      ? "bg-red-50 text-red-700 border-red-200"
      : props.tone === "green"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-zinc-50 text-zinc-700 border-zinc-200";

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-xs font-medium opacity-80">{props.title}</p>
      <p className="mt-1 text-lg font-semibold">{props.value}</p>
    </div>
  );
}
