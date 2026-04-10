import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, verifyUserPassword } from "@/server/services/users";
import { signSessionToken } from "@/server/auth/session-token";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/server/auth/session-cookie";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email("Email noto‘g‘ri"),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !(await verifyUserPassword(user, parsed.data.password))) {
    return Response.json({ error: "Email yoki parol noto‘g‘ri" }, { status: 401 });
  }

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    admin: user.isAdmin,
  });
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin },
  });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  return res;
}
