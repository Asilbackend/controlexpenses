import { SignJWT, jwtVerify } from "jose";
import { getJwtSecretBytes } from "@/server/auth/jwt-secret";

export type SessionPayload = {
  sub: string;
  email: string;
  admin: boolean;
};

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecretBytes();
  return await new SignJWT({
    email: payload.email,
    admin: payload.admin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecretBytes();
    const { payload } = await jwtVerify(token, secret);
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    const admin = Boolean(payload.admin);
    if (!sub || !email) return null;
    return { sub, email, admin };
  } catch {
    return null;
  }
}
