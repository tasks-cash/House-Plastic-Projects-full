"use client";

import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-card backdrop-blur-xl",
            toast.type === "success" &&
              "border-emerald-500/30 bg-emerald-950/90 text-emerald-100",
            toast.type === "error" && "border-red-500/30 bg-red-950/90 text-red-100",
            toast.type === "info" && "border-zinc-700 bg-zinc-900/95 text-zinc-100"
          )}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          )}
          {toast.type === "error" && (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          )}
          {toast.type === "info" && (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
          )}
          <p className="flex-1 text-sm">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
