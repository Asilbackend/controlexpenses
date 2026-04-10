import { parseVoiceTranscript } from "@/server/nlp/parse-voice";
import { transcribeAudioToText } from "@/server/stt/transcribe";
import { getSession } from "@/server/auth/get-session";
import { listCategoriesForUser } from "@/server/services/categories";
import { createVoiceLog } from "@/server/services/voice-logs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Kirish talab qilinadi" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("audio");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "`audio` fayl yuboring (multipart/form-data)." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const { transcript } = await transcribeAudioToText({
      bytes,
      originalName: file.name || "audio",
    });

    const categories = await listCategoriesForUser(session.sub, { includeInactive: false });
    const parsed = parseVoiceTranscript(transcript, categories);

    await createVoiceLog({
      userId: session.sub,
      transcript,
      parsed: parsed as unknown as Record<string, unknown>,
      fileName: file.name || null,
    });

    return Response.json({
      transcript,
      parsed,
      suggested: {
        type: parsed.type,
        categoryId: parsed.categoryId,
        categoryName: parsed.categoryName,
        amount: parsed.amount,
        description: transcript,
        categoryUncertain: parsed.categoryUncertain,
        transcript,
      },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Xatolik" },
      { status: 500 }
    );
  }
}
