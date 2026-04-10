export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-lg font-semibold">Sozlamalar</h1>
          <p className="text-sm text-zinc-600">Tez orada: til, valyuta, bildirishnomalar</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 text-sm text-zinc-600">Hozircha sozlamalar o‘zgartirilmaydi.</main>
    </div>
  );
}
