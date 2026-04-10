import argparse
import json
import os
import sys
import wave


def eprint(*args):
    print(*args, file=sys.stderr)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--wav", required=True, help="16kHz mono WAV fayl yo'li")
    parser.add_argument("--model", required=False, default="", help="Vosk model papkasi")
    args = parser.parse_args()

    model_path = args.model or os.environ.get("VOSK_MODEL_PATH", "")
    if not model_path:
        eprint("VOSK_MODEL_PATH berilmagan. --model yoki ENV orqali bering.")
        sys.exit(2)

    try:
        import vosk  # type: ignore
    except Exception:
        eprint("Python 'vosk' paketi topilmadi. O'rnatish: pip install vosk")
        sys.exit(2)

    if not os.path.isdir(model_path):
        eprint(f"Model papkasi topilmadi: {model_path}")
        sys.exit(2)

    wf = wave.open(args.wav, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        eprint("WAV formati noto'g'ri. ffmpeg bilan 16kHz mono s16le WAV qiling.")
        sys.exit(2)

    model = vosk.Model(model_path)
    rec = vosk.KaldiRecognizer(model, wf.getframerate())

    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        rec.AcceptWaveform(data)

    result = rec.FinalResult()
    try:
        obj = json.loads(result)
    except Exception:
        obj = {"text": ""}

    print(json.dumps({"text": obj.get("text", "")}, ensure_ascii=False))


if __name__ == "__main__":
    main()

