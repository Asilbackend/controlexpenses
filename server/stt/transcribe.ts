import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { assertAudioAllowed } from "@/server/stt/audio-guard";

type RunResult = { code: number; stdout: string; stderr: string };

async function run(cmd: string, args: string[], opts: { cwd?: string } = {}): Promise<RunResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += String(d)));
    child.stderr.on("data", (d) => (stderr += String(d)));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));
  });
}

export async function transcribeAudioToText(input: {
  bytes: Buffer;
  originalName: string;
}): Promise<{ transcript: string }> {
  const workDir = join(tmpdir(), "controlexpenses-stt", randomUUID());
  await mkdir(workDir, { recursive: true });

  const inPath = join(workDir, sanitizeName(input.originalName || "audio"));
  const wavPath = join(workDir, "audio.wav");

  try {
    assertAudioAllowed({
      originalName: input.originalName || "audio",
      byteLength: input.bytes.byteLength,
    });
    await writeFile(inPath, input.bytes);

    // ffmpeg: mono, 16kHz, signed 16-bit little-endian PCM
    const ff = await run("ffmpeg", [
      "-y",
      "-i",
      inPath,
      "-ac",
      "1",
      "-ar",
      "16000",
      "-f",
      "wav",
      wavPath,
    ]);
    if (ff.code !== 0) {
      throw new Error(
        "ffmpeg xatoligi. Lokal kompyuterda ffmpeg o‘rnatilgan va PATH’da ekanini tekshiring.\n" +
          (ff.stderr || ff.stdout)
      );
    }

    const python = process.env.PYTHON_BIN || "python";
    const script = process.env.STT_SCRIPT || "stt/transcribe.py";
    const modelPath = process.env.VOSK_MODEL_PATH || "";

    const py = await run(python, [script, "--wav", wavPath, "--model", modelPath]);
    if (py.code !== 0) {
      throw new Error("STT (Python/Vosk) xatoligi:\n" + (py.stderr || py.stdout));
    }

    const out = safeJson<{ text?: string }>(py.stdout);
    const transcript = (out?.text ?? "").toString().trim();

    if (!transcript) {
      throw new Error("Transkripsiya bo‘sh qaytdi (audio juda qisqa yoki model topilmadi).");
    }
    return { transcript };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

function sanitizeName(name: string) {
  const base = name.replace(/[^\w.\-]+/g, "_");
  return base.length ? base : "audio";
}

function safeJson<T>(s: string): T | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

