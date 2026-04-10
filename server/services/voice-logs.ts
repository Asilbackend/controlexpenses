import { getDataSource } from "@/server/db/data-source";
import { voiceLogRepo } from "@/server/db/repositories";
import type { VoiceLog } from "@/server/entities/VoiceLog";

export async function createVoiceLog(input: {
  userId: string;
  transcript: string;
  parsed: Record<string, unknown> | null;
  fileName: string | null;
}): Promise<VoiceLog> {
  const ds = await getDataSource();
  const repo = voiceLogRepo(ds);
  const row = repo.create({
    userId: input.userId,
    transcript: input.transcript,
    parsed: input.parsed,
    fileName: input.fileName,
  });
  return repo.save(row);
}
