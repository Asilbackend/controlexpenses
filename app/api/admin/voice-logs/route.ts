import { getSession } from "@/server/auth/get-session";
import { listVoiceLogsAdmin } from "@/server/services/admin";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });
  if (!session.admin) return Response.json({ error: "Ruxsat yo‘q" }, { status: 403 });

  const items = await listVoiceLogsAdmin(200);
  return Response.json({ items });
}
