import Link from "next/link";
import { TransactionForm } from "@/app/transactions/new/TransactionForm";

function currentMonthUtc() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default async function NewTransactionPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await props.searchParams) ?? {};
  const month = typeof sp.month === "string" ? sp.month : currentMonthUtc();
  const modeRaw = sp.mode;
  const modeStr = Array.isArray(modeRaw) ? modeRaw[0] : modeRaw;
  const defaultMode = modeStr === "voice" ? "voice" : "manual";

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Yangi yozuv</h1>
            <p className="text-sm text-zinc-600">Oy: {month}</p>
          </div>
          <Link
            href={`/dashboard?month=${encodeURIComponent(month)}`}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
          >
            Orqaga
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-6">
        <TransactionForm defaultMonth={month} defaultMode={defaultMode} />
      </main>
    </div>
  );
}

