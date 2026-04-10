import { z } from "zod";
import { getSession } from "@/server/auth/get-session";
import { createCategory, listCategoriesForUser } from "@/server/services/categories";

export const runtime = "nodejs";

const CreateBody = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["expense", "income"]),
  color: z.string().max(32).optional(),
  icon: z.string().max(32).optional(),
  keywords: z.array(z.string().max(80)).max(50).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const includeInactive = url.searchParams.get("includeInactive") === "1";

  const items = await listCategoriesForUser(session.sub, {
    type: type === "expense" || type === "income" ? type : undefined,
    includeInactive,
  });

  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const item = await createCategory({
      userId: session.sub,
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      icon: parsed.data.icon,
      keywords: parsed.data.keywords,
      isActive: parsed.data.isActive,
    });
    return Response.json({ item }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}
