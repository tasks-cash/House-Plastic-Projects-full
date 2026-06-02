import type { ToastType } from "@/hooks/useToast";

type ShowToast = (message: string, type?: ToastType) => void;

let unsupportedNotified = false;

export function notifyVoiceUnsupported(showToast: ShowToast): void {
  if (unsupportedNotified) return;
  unsupportedNotified = true;
  showToast("Voice input is not supported in this browser.", "info");
}

export function notifyMicPermissionDenied(showToast: ShowToast): void {
  showToast("Microphone permission denied", "error");
}

export function isMicPermissionError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("denied") ||
    lower.includes("not-allowed") ||
    lower.includes("not allowed") ||
    lower.includes("permission")
  );
}
