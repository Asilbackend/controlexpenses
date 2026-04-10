import { z } from "zod";
import { getSession } from "@/server/auth/get-session";
import { createTransaction, listTransactionsByMonth } from "@/server/services/transactions";

export const runtime = "nodejs";

const CreateTransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  categoryId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().max(2000).optional().nullable(),
  occurredAt: z.string().datetime(),
  source: z.enum(["manual", "voice"]).default("manual"),
  transcript: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });

  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  if (!month) return Response.json({ error: "month kerak. Masalan: 2026-04" }, { status: 400 });

  try {
    const items = await listTransactionsByMonth(session.sub, month);
    return Response.json({ items });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = CreateTransactionSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }

  const dto = parsed.data;
  const occurredAt = new Date(dto.occurredAt);

  try {
    const saved = await createTransaction({
      userId: session.sub,
      type: dto.type,
      categoryId: dto.categoryId,
      amount: dto.amount,
      description: dto.description ?? null,
      occurredAt,
      source: dto.source,
      transcript: dto.transcript ?? null,
    });
    return Response.json({ item: saved }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}
