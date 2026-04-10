import { Suspense } from "react";
import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Yuklanmoqda...</div>}>
      <LoginForm />
    </Suspense>
  );
}
