import { getDataSource } from "@/server/db/data-source";
import { userRepo, voiceLogRepo } from "@/server/db/repositories";

export async function listUsersForAdmin(limit: number) {
  const ds = await getDataSource();
  return userRepo(ds).find({
    order: { createdAt: "DESC" },
    take: limit,
    select: ["id", "email", "displayName", "isAdmin", "createdAt"],
  });
}

export async function listVoiceLogsAdmin(limit: number) {
  const ds = await getDataSource();
  return voiceLogRepo(ds).find({
    order: { createdAt: "DESC" },
    take: limit,
    relations: { user: true },
  });
}
