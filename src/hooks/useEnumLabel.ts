"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

/** Translate enum/status values stored in the database */
export function useEnumLabel() {
  const t = useTranslations("enums");

  return useCallback(
    (group: string, value: string) => {
      try {
        return t(`${group}.${value}` as Parameters<typeof t>[0]);
      } catch {
        return value;
      }
    },
    [t]
  );
}
