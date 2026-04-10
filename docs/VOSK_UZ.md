# Vosk (O‘zbekcha) — juda yengil Speech-to-Text

Bu loyiha “resurs kam, tez ishlasin” talabi uchun **Vosk**’dan foydalanadi.

Arxitektura:

- Foydalanuvchi audio yuboradi (`/api/voice`)
- Backend audio’ni **ffmpeg** orqali `16kHz mono WAV` ga o‘tkazadi
- Python skript (`stt/transcribe.py`) Vosk modeli bilan transkripsiya qiladi
- Matndan summa/kategoriya oddiy parser + regex + keyword rule bilan ajratiladi
- Foydalanuvchiga tasdiqlash oynasi chiqadi, tasdiqlansa DB’ga saqlanadi

## 1) Modelni yuklab olish

Vosk Uzbek modeli (small) ni yuklab oling va unzip qiling:

- Model papkasi misol: `vosk-model-small-uz-0.22/`

Modelni shu repoda `models/` ichiga qo‘ying:

- `models/vosk-model-small-uz-0.22/`

## 2) Lokal kompyuterda ishlatish (Windows)

Talablar:

- **Python 3**
- **ffmpeg** (PATH’da bo‘lishi kerak)

Python paket:

```bash
pip install vosk
```

`.env` yarating (yoki `.env.example` dan nusxa oling) va `VOSK_MODEL_PATH` ni ko‘rsating:

Misol:

- `VOSK_MODEL_PATH=C:\models\vosk-model-small-uz-0.22`

So‘ng ishga tushiring:

```bash
npm run dev
```

## 3) Docker’da ishlatish

Bu holatda Python, ffmpeg va vosk paketi konteyner ichida bo‘ladi.
Siz faqat modelni `./models` ichiga joylaysiz.

```bash
docker compose up --build
```

`docker-compose.yml` ichida `VOSK_MODEL_PATH=/models/vosk-model-small-uz-0.22` qilib berilgan.

## 4) Tekshirish

UI’da `Yangi yozuv` → `Ovozli kiritish` bo‘limidan audio yuboring.

Matn misollari:

- `taksi 45 ming`
- `supermarket 120 ming`
- `ijara bir million`

**Eslatma**: STT sifatiga audio sifati, shovqin, talaffuz kuchli ta’sir qiladi. Modellar “small” bo‘lgani uchun ba’zi so‘zlarni xato tanishi mumkin.

