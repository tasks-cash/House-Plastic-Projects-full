"use client";

import { useRouter } from "@/i18n/navigation";
import { isMockAuthenticated } from "@/lib/mock-auth-client";
import { useEffect } from "react";

export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isMockAuthenticated() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
    </div>
  );
}
