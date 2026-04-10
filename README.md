## ControlExpenses — oylik harajatlarni nazorat qilish

Bu web-ilova **oylik harajatlar va tushumlarni kiritish**, **dashboard statistikalar** (chart/diagramma) va **ovozli kiritish** (STT) orqali avtomatik aniqlash funksiyasiga ega.

### Nimalar mavjud?

- **Harajat/Tushum yozuvlari**
  - Qo‘lda kiritish
  - Ovozli kiritish (audio → transkripsiya → summa/kategoriya aniqlash)
- **Dashboard**
  - Oylik tushum/harajat/sof natija
  - Kunlar bo‘yicha grafik
  - Kategoriya bo‘yicha diagramma (harajat)
- **Backend API**: Next.js `route.ts` (ortiqcha alohida backend yo‘q)
- **DB**: PostgreSQL + TypeORM

### Qanday ishlaydi (ovozli kiritish)?

1. Foydalanuvchi audio yuboradi (`/api/voice`)
2. Backend `ffmpeg` bilan audio’ni `16kHz mono wav` ga o‘tkazadi
3. Lokal Vosk modeli bilan transkripsiya qiladi (`stt/transcribe.py`)
4. Matndan **summa** (masalan: `120 ming`, `45 ming`, `bir million`) ajratiladi
5. Keyword rule orqali **kategoriya** topiladi:
   - `taksi` → Transport
   - `supermarket` → Oziq-ovqat
   - `ijara` → Uy-joy
6. UI’da **tasdiqlash oynasi** chiqadi, keyin saqlanadi

### “Prediction” (aniqlash) nimalar chiqaradi?

- **type**: `expense` yoki `income` (tushumga oid keyword’lar orqali)
- **category**: keyword rule orqali (Transport/Oziq-ovqat/Uy-joy/…)
- **amount**: regex + oddiy parser orqali (raqamli va so‘zli qiymatlar)

## Ishga tushirish (Docker tavsiya qilinadi)

Talab:

- Docker Desktop

1) Modelni qo‘ying:

- `models/vosk-model-small-uz-0.22/` (unzip qilingan papka)

2) Start:

```bash
docker compose up --build
```

So‘ng brauzerda `http://localhost:3000` ni oching.

## Lokal kompyuterda ishlatish

Talab:

- Node.js
- PostgreSQL
- Python 3
- ffmpeg (PATH’da)

1) `.env` tayyorlang:

- `.env.example` dan nusxa oling va `DATABASE_URL` hamda `VOSK_MODEL_PATH` ni sozlang

2) Dependency:

```bash
npm install
```

3) DB (PostgreSQL) ishga tushgan bo‘lsin.

4) Dev server:

```bash
npm run dev
```

## Vosk Uzbek modeli bo‘yicha qo‘llanma

`docs/VOSK_UZ.md` ni o‘qing.
