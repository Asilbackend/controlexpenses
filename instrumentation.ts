/**
 * Server jarayoni boshlanganda DB ulanishini bir marta “isitish”.
 * Bu synchronize ning birinchi marta ishlashini kafolatlaydi (har qanday sahifadan oldin).
 *
 * .env: DB_WARMUP_ON_BOOT=true
 * Next.js: bu fayl rootda bo‘lishi kerak (App Router).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.DB_WARMUP_ON_BOOT !== "true") return;

  const { getDataSource } = await import("@/server/db/data-source");
  await getDataSource().catch((err) => {
    console.error("[instrumentation] DB warmup xatosi:", err);
  });
}
