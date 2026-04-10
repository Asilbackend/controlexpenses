"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

export function ConditionalChrome(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPaths = pathname === "/login" || pathname === "/register";
  return (
    <>
      {!publicPaths && <SiteHeader />}
      {props.children}
    </>
  );
}
