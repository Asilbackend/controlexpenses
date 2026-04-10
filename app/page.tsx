import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/get-session";

export default async function Home() {
  const s = await getSession();
  redirect(s ? "/dashboard" : "/login");
}
