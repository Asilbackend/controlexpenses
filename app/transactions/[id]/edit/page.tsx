import { Suspense } from "react";
import { EditTransactionForm } from "@/app/transactions/[id]/edit/EditTransactionForm";

export default function EditTransactionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Yuklanmoqda...</div>}>
      <EditTransactionForm />
    </Suspense>
  );
}
