import { getSession } from "@/server/auth/get-session";
import { listTransactionsByMonth } from "@/server/services/transactions";

export const runtime = "nodejs";

function csvEscape(s: string) {
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });

  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  if (!month) return Response.json({ error: "month kerak (YYYY-MM)" }, { status: 400 });

  try {
    const items = await listTransactionsByMonth(session.sub, month);
    const lines = [
      ["Sana", "Tur", "Kategoriya", "Summa", "Izoh", "Manba", "Transkripsiya"].join(","),
      ...items.map((t) =>
        [
          csvEscape(t.occurredAt.toISOString()),
          csvEscape(t.type),
          csvEscape(t.category?.name ?? ""),
          String(t.amount),
          csvEscape(t.description ?? ""),
          csvEscape(t.source),
          csvEscape(t.transcript ?? ""),
        ].join(",")
      ),
    ];
    const bom = "\uFEFF";
    const body = bom + lines.join("\n");
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-${month}.csv"`,
      },
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}
