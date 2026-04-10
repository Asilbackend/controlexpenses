import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/server/services/users";
import { signSessionToken } from "@/server/auth/session-token";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/server/auth/session-cookie";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email("Email noto‘g‘ri"),
  password: z.string().min(8, "Parol kamida 8 belgi bo‘lishi kerak"),
  displayName: z.string().max(200).optional(),
});

function adminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Validatsiya xatosi", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();
    const isAdmin = adminEmails().has(email);
    const user = await createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      displayName: parsed.data.displayName,
    });
    if (isAdmin && !user.isAdmin) {
      const { getDataSource } = await import("@/server/db/data-source");
      const { userRepo } = await import("@/server/db/repositories");
      const ds = await getDataSource();
      await userRepo(ds).update({ id: user.id }, { isAdmin: true });
      user.isAdmin = true;
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
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Xatolik" }, { status: 400 });
  }
}
