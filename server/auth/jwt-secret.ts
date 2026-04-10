export function getJwtSecretBytes(): Uint8Array {
  const raw = process.env.AUTH_SECRET ?? "";
  if (raw.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET kamida 32 belgi bo‘lishi kerak (production).");
    }
    return new TextEncoder().encode("controlexpenses-dev-secret-min-32-chars!");
  }
  return new TextEncoder().encode(raw);
}
