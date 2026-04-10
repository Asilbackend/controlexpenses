import { z } from "zod";
import { getSession } from "@/server/auth/get-session";
import { deleteTransaction, getTransaction, updateTransaction } from "@/server/services/transactions";

export const runtime = "nodejs";

const PatchBody = z
  .object({
    type: z.enum(["expense", "income"]).optional(),
    categoryId: z.string().uuid().optional(),
    amount: z.number().int().positive().optional(),
    description: z.string().max(2000).nullable().optional(),
    occurredAt: z.string().datetime().optional(),
  })
  .strict();

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  const { id } = await ctx.params;
  const item = await getTransaction(session.sub, id);
  if (!item) return Response.json({ error: "Topilmadi" }, { status: 404 });
  return Response.json({ item });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  const { id } = await ctx.params;
  const json = await request.json().catch(() => null);
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }
  const p = parsed.data;
  try {
    const item = await updateTransaction(session.sub, id, {
      type: p.type,
      categoryId: p.categoryId,
      amount: p.amount,
      description: p.description,
      occurredAt: p.occurredAt ? new Date(p.occurredAt) : undefined,
    });
    return Response.json({ item });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    await deleteTransaction(session.sub, id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}
