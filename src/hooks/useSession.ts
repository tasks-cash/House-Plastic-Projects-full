"use client";

import { isMockAuthenticated, MOCK_USER } from "@/lib/mock-auth-client";
import type { MappedUser } from "@/lib/mappers";
import { useCallback, useEffect, useState } from "react";

export function useSession() {
  const [user, setUser] = useState<MappedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (isMockAuthenticated()) {
      setUser(MOCK_USER);
      setLoading(false);
      return MOCK_USER;
    }

    setUser(null);
    setLoading(false);
    return null;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh };
}
