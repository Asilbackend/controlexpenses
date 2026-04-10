import { cookies } from "next/headers";
import { verifySessionToken } from "@/server/auth/session-token";
import { SESSION_COOKIE_NAME } from "@/server/auth/session-cookie";

export async function getSession(): Promise<
  import("@/server/auth/session-token").SessionPayload | null
> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession() {
  const s = await getSession();
  if (!s) {
    const err = new Error("UNAUTHORIZED") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return s;
}
