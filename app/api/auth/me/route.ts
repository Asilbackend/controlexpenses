import { getSession } from "@/server/auth/get-session";
import { getDataSource } from "@/server/db/data-source";
import { userRepo } from "@/server/db/repositories";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null }, { status: 401 });

  const ds = await getDataSource();
  const user = await userRepo(ds).findOne({ where: { id: session.sub } });
  if (!user) return Response.json({ user: null }, { status: 401 });

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
    },
  });
}
