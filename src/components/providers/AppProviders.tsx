"use client";

import { ToastContainer } from "@/components/ui/Toast";
import { ToastProvider } from "@/hooks/useToast";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
