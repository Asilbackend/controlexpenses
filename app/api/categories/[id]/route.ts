import { z } from "zod";
import { getSession } from "@/server/auth/get-session";
import { deleteCategory, getCategoryForUser, updateCategory } from "@/server/services/categories";

export const runtime = "nodejs";

const PatchBody = z
  .object({
    name: z.string().min(1).max(120).optional(),
    type: z.enum(["expense", "income"]).optional(),
    color: z.string().max(32).optional(),
    icon: z.string().max(32).optional(),
    isActive: z.boolean().optional(),
    keywords: z.array(z.string().max(80)).max(50).optional(),
  })
  .strict();

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });

  const { id } = await ctx.params;
  const json = await request.json().catch(() => null);
  const parsed = PatchBody.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const item = await updateCategory(session.sub, id, parsed.data);
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
    await deleteCategory(session.sub, id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  const { id } = await ctx.params;
  const item = await getCategoryForUser(session.sub, id);
  if (!item) return Response.json({ error: "Topilmadi" }, { status: 404 });
  return Response.json({ item });
}
