import { appConfig } from "./config";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency: appConfig.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(appConfig.locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: appConfig.timeZone,
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString(appConfig.locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: appConfig.timeZone,
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString(appConfig.locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: appConfig.timeZone,
  });
}

export function formatWeight(weight: number, unit?: string): string {
  return `${weight.toLocaleString(appConfig.locale)} ${unit ?? appConfig.weightUnit}`;
}
