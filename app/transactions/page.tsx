import { Suspense } from "react";
import { TransactionsClient } from "@/app/transactions/TransactionsClient";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Yuklanmoqda...</div>}>
      <TransactionsClient />
    </Suspense>
  );
}
