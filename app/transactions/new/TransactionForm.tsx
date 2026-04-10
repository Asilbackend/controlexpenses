"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatSom } from "@/lib/money";
import { CategoryPicker, type CategoryOption } from "@/components/category-picker";

type TxType = "expense" | "income";

export function TransactionForm(props: { defaultMonth: string; defaultMode?: "manual" | "voice" }) {
  const nowIso = useMemo(() => new Date().toISOString(), []);
  const [mode, setMode] = useState<"manual" | "voice">(props.defaultMode ?? "manual");

  const [type, setType] = useState<TxType>("expense");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [occurredAt, setOccurredAt] = useState(nowIso.slice(0, 16));
  const [description, setDescription] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState<{
    type: TxType;
    categoryId: string;
    categoryName: string;
    amount: number | null;
    transcript: string;
    categoryUncertain?: boolean;
  } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [newCatIcon, setNewCatIcon] = useState("📁");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  async function loadCategories() {
    const res = await fetch("/api/categories?includeInactive=1", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Kategoriyalar yuklanmadi");
    const items = (data.items ?? []) as CategoryOption[];
    setCategories(items);
    return items;
  }

  useEffect(() => {
    void (async () => {
      try {
        const items = await loadCategories();
        const first = items.find((c) => c.type === type && c.isActive);
        setCategoryId((id) => id ?? first?.id ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xatolik");
      }
    })();
  }, []);

  useEffect(() => {
    const first = categories.find((c) => c.type === type && c.isActive);
    if (first && !categories.find((c) => c.id === categoryId && c.type === type)) {
      setCategoryId(first.id);
    }
  }, [type, categories, categoryId]);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      if (!categoryId) throw new Error("Kategoriya tanlang");
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type,
          categoryId,
          amount,
          description: description || null,
          occurredAt: new Date(occurredAt).toISOString(),
          source: mode,
          transcript: mode === "voice" ? voiceTranscript : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Saqlashda xatolik");

      setToast("Saqlandi");
      window.setTimeout(() => setToast(null), 2000);
      window.location.href = `/dashboard?month=${encodeURIComponent(props.defaultMonth)}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function handleVoiceFile(file: File) {
    setError(null);
    setBusy(true);
    setVoiceTranscript(null);
    try {
      const fd = new FormData();
      fd.set("audio", file);
      const res = await fetch("/api/voice", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Ovozdan aniqlashda xatolik");

      setVoiceTranscript(data.transcript ?? null);

      const suggested = data.suggested ?? {};
      const nextType = (suggested.type as TxType) || "expense";
      const nextCategoryId = typeof suggested.categoryId === "string" ? suggested.categoryId : null;
      const nextCategoryName = (suggested.categoryName as string) || "Boshqa";
      const nextAmount = typeof suggested.amount === "number" ? suggested.amount : null;
      const nextTranscript = (suggested.transcript as string) || (data.transcript as string) || "";
      const uncertain = Boolean(suggested.categoryUncertain);

      setConfirmInfo({
        type: nextType,
        categoryId: nextCategoryId ?? "",
        categoryName: nextCategoryName,
        amount: nextAmount,
        transcript: nextTranscript,
        categoryUncertain: uncertain,
      });
      setConfirmOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  async function startRecording() {
    setError(null);
    recordedChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (evt) => {
      if (evt.data.size > 0) recordedChunksRef.current.push(evt.data);
    };
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(recordedChunksRef.current, { type: mr.mimeType || "audio/webm" });
      const file = new File([blob], "record.webm", { type: blob.type });
      await handleVoiceFile(file);
    };
    mr.start();
    setRecording(true);
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    mr.stop();
    setRecording(false);
  }

  async function quickAddCategory(forType: TxType) {
    const name = newCatName.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          type: forType,
          color: newCatColor,
          icon: newCatIcon,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Qo‘shilmadi");
      const items = await loadCategories();
      const created = items.find((c) => c.id === data.item?.id);
      if (created) setCategoryId(created.id);
      setAddOpen(false);
      setNewCatName("");
      if (confirmInfo) {
        setConfirmInfo({ ...confirmInfo, categoryId: data.item.id, categoryName: name, categoryUncertain: false });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      {toast && (
        <div className="fixed bottom-4 right-4 z-[60] rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button className={tabClass(mode === "manual")} onClick={() => setMode("manual")} type="button">
          Qo‘lda kiritish
        </button>
        <button className={tabClass(mode === "voice")} onClick={() => setMode("voice")} type="button">
          Ovozli kiritish
        </button>
      </div>

      {mode === "voice" && (
        <div className="mt-4 rounded-xl border border-black/10 bg-zinc-50 p-3">
          <p className="text-sm font-medium">Ovoz yuboring</p>
          <p className="mt-1 text-xs text-zinc-600">
            Qo‘llab-quvvatlanadi: mp3, wav, m4a, ogg, webm. Masalan: “taksi 45 ming”, “oylik 5 million”.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
              Fayl tanlash
              <input
                className="hidden"
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleVoiceFile(f);
                }}
              />
            </label>

            {!recording ? (
              <button
                type="button"
                className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                onClick={() => void startRecording()}
              >
                Mikrofon orqali yozish
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={() => stopRecording()}
              >
                To‘xtatish va yuborish
              </button>
            )}
          </div>

          {voiceTranscript && (
            <div className="mt-3 text-sm">
              <p className="text-xs font-semibold text-zinc-600">Transkripsiya</p>
              <p className="mt-1 rounded-xl border border-black/10 bg-white p-2">{voiceTranscript}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Tur">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as TxType)}>
            <option value="expense">Harajat</option>
            <option value="income">Tushum</option>
          </select>
        </Field>
        <Field label="Kategoriya">
          <div className="flex flex-col gap-2">
            <CategoryPicker
              type={type}
              categories={categories}
              valueId={categoryId}
              onChange={setCategoryId}
              disabled={busy}
            />
            <button
              type="button"
              className="self-start text-xs font-medium text-zinc-700 underline"
              onClick={() => setAddOpen(true)}
            >
              + Yangi kategoriya
            </button>
          </div>
        </Field>
        <Field label="Summa (so‘m)">
          <input
            className={inputClass}
            type="number"
            min={1}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-zinc-500">{amount > 0 ? formatSom(amount) : ""}</p>
        </Field>
        <Field label="Sana/vaqt">
          <input className={inputClass} type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </Field>
        <Field label="Izoh" className="md:col-span-2">
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={busy || amount <= 0 || !categoryId}
          onClick={() => void submit()}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Saqlash
        </button>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold">Yangi kategoriya</h3>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <label className="text-xs font-semibold text-zinc-600">
                Nomi
                <input className={inputClass} value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-zinc-600">
                  Rang
                  <input className={inputClass} type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} />
                </label>
                <label className="text-xs font-semibold text-zinc-600">
                  Ikonka (emoji)
                  <input className={inputClass} value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} />
                </label>
              </div>
              <p className="text-xs text-zinc-500">Tur: {type === "income" ? "Tushum" : "Harajat"}</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-xl border px-3 py-2 text-sm" onClick={() => setAddOpen(false)}>
                Bekor
              </button>
              <button
                type="button"
                className="rounded-xl bg-black px-3 py-2 text-sm text-white"
                onClick={() => void quickAddCategory(type)}
              >
                Qo‘shish
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && confirmInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold">Ovozli aniqlash natijasi</h3>
            <p className="mt-1 text-xs text-zinc-600">
              Iltimos, tekshiring. Kategoriya aniqlanmagan bo‘lsa, tezda yangi kategoriya qo‘shing.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-xl border border-black/10 bg-zinc-50 p-3">
                <p className="text-xs font-semibold text-zinc-600">Transkripsiya</p>
                <p className="mt-1">{confirmInfo.transcript}</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-black/10 p-3">
                  <p className="text-xs font-semibold text-zinc-600">Tur</p>
                  <p className="mt-1">{confirmInfo.type === "income" ? "Tushum" : "Harajat"}</p>
                </div>
                <div className="rounded-xl border border-black/10 p-3">
                  <p className="text-xs font-semibold text-zinc-600">Kategoriya</p>
                  <p className="mt-1">{confirmInfo.categoryName}</p>
                </div>
                <div className="rounded-xl border border-black/10 p-3">
                  <p className="text-xs font-semibold text-zinc-600">Summa</p>
                  <p className="mt-1">
                    {typeof confirmInfo.amount === "number" ? formatSom(confirmInfo.amount) : "Topilmadi"}
                  </p>
                </div>
              </div>
            </div>

            {confirmInfo.categoryUncertain && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                Kategoriya ishonchsiz — yangi kategoriya qo‘shish yoki forma orqali tanlash mumkin.
                <button
                  type="button"
                  className="ml-2 font-semibold underline"
                  onClick={() => {
                    setNewCatName("");
                    setAddOpen(true);
                  }}
                >
                  Kategoriya qo‘shish
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={() => setConfirmOpen(false)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                onClick={() => {
                  setType(confirmInfo.type);
                  if (confirmInfo.categoryId) setCategoryId(confirmInfo.categoryId);
                  if (typeof confirmInfo.amount === "number") setAmount(confirmInfo.amount);
                  setDescription(confirmInfo.transcript);
                  setConfirmOpen(false);
                }}
              >
                Formaga qo‘llash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={props.className}>
      <span className="text-xs font-semibold text-zinc-600">{props.label}</span>
      <div className="mt-1">{props.children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10";

function tabClass(active: boolean) {
  return active
    ? "rounded-xl bg-black px-3 py-2 text-sm font-medium text-white"
    : "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50";
}
