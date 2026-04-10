import { getSession } from "@/server/auth/get-session";
import { listUsersForAdmin } from "@/server/services/admin";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  if (!session.admin) return Response.json({ error: "Ruxsat yo‘q" }, { status: 403 });

  const items = await listUsersForAdmin(500);
  return Response.json({ items });
}
