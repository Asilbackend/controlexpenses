import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { Transaction } from "../entities/Transaction";
import { VoiceLog } from "../entities/VoiceLog";

/**
 * Next.js + TypeORM
 *
 * - synchronize faqat dataSource.initialize() vaqtida ishlaydi.
 * - Agar entities ro‘yxati bo‘sh yoki noto‘g‘ri path bo‘lsa, jadval yaratilmaydi.
 * - Production’da "server/entities/*.js" glob ko‘pincha Next bundle bilan mos kelmaydi —
 *   shuning uchun entitylar har doim class sifatida beriladi.
 */

declare global {
  var __appDataSource: DataSource | undefined;
}

const entityClasses = [User, Category, Transaction, VoiceLog] as const;

function isSyncEnabled(): boolean {
  const v = (process.env.TYPEORM_SYNC ?? "").toLowerCase().trim();
  return v === "true" || v === "1" || v === "yes";
}

function buildDataSource() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL topilmadi. Masalan: postgresql://postgres:postgres@localhost:5432/controlexpenses"
    );
  }

  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [...entityClasses],
    synchronize: isSyncEnabled(),
    logging: process.env.TYPEORM_LOGGING === "true",
  });
}

let initPromise: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
  const cached = globalThis.__appDataSource;
  if (cached?.isInitialized) {
    return cached;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        if (!globalThis.__appDataSource) {
          globalThis.__appDataSource = buildDataSource();
        }
        const ds = globalThis.__appDataSource;
        if (!ds.isInitialized) {
          await ds.initialize();
        }
        return ds;
      } catch (err) {
        initPromise = null;
        globalThis.__appDataSource = undefined;
        throw err;
      }
    })();
  }

  return initPromise;
}

export async function destroyDataSource(): Promise<void> {
  const ds = globalThis.__appDataSource;
  if (ds?.isInitialized) {
    await ds.destroy();
  }
  globalThis.__appDataSource = undefined;
  initPromise = null;
}
