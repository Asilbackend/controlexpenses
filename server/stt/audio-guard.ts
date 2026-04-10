const ALLOWED_EXT = new Set(["mp3", "wav", "m4a", "aac", "ogg", "webm", "flac", "opus"]);

export function assertAudioAllowed(input: { originalName: string; byteLength: number }) {
  const maxMb = Number(process.env.AUDIO_MAX_MB ?? "12");
  const maxBytes = (Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 12) * 1024 * 1024;
  if (input.byteLength <= 0) throw new Error("Audio fayl bo‘sh.");
  if (input.byteLength > maxBytes) {
    throw new Error(`Audio hajmi juda katta (maks. ${Math.round(maxBytes / (1024 * 1024))} MB).`);
  }

  const ext = extractExt(input.originalName);
  if (!ext || !ALLOWED_EXT.has(ext)) {
    throw new Error(
      "Qo‘llab-quvvatlanmaydigan format. Ruxsat: mp3, wav, m4a, ogg, webm (va ba’zi boshqa konteynerlar)."
    );
  }
}

function extractExt(name: string): string | null {
  const base = name.split(/[/\\]/).pop() ?? "";
  const i = base.lastIndexOf(".");
  if (i < 0) return null;
  return base.slice(i + 1).toLowerCase();
}
