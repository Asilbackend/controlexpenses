import type { DataSource, Repository } from "typeorm";
import type { User } from "@/server/entities/User";
import type { Category } from "@/server/entities/Category";
import type { Transaction } from "@/server/entities/Transaction";
import type { VoiceLog } from "@/server/entities/VoiceLog";

/**
 * Next.js server bundle ba’zan bir xil entity klassining turli chunk nusxalarini yuklaydi.
 * TypeORM metadata klass referensi bo‘yicha bog‘langan — boshqa nusxa bilan getRepository() xato beradi.
 * Entity nomi (string) bitta metadata qatoriga bog‘lanadi.
 */
export function userRepo(ds: DataSource): Repository<User> {
  return ds.getRepository("User");
}

export function categoryRepo(ds: DataSource): Repository<Category> {
  return ds.getRepository("Category");
}

export function transactionRepo(ds: DataSource): Repository<Transaction> {
  return ds.getRepository("Transaction");
}

export function voiceLogRepo(ds: DataSource): Repository<VoiceLog> {
  return ds.getRepository("VoiceLog");
}
