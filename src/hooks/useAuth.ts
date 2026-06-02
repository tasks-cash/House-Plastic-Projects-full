"use client";

import { useRouter } from "@/i18n/navigation";
import { isMockAuthenticated } from "@/lib/mock-auth-client";
import { useEffect, useState } from "react";

type AuthMode = "public" | "protected";

/**
 * Client auth gate using localStorage mock session (agropulse_auth=true).
 */
export function useAuthGate(mode: AuthMode) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const authed = isMockAuthenticated();

    if (mode === "public") {
      if (authed) {
        router.replace("/dashboard");
        return;
      }
      setReady(true);
      return;
    }

    if (!authed) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [mounted, mode, router]);

  return { mounted, ready };
}
