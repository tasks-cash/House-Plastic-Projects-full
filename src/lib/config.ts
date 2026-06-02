/** Public app settings (NEXT_PUBLIC_* only — frontend prototype). */
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "AgroPulse",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4070",
  currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "DZD",
  weightUnit: process.env.NEXT_PUBLIC_DEFAULT_WEIGHT_UNIT ?? "quintal",
  locale: "fr-DZ",
  timeZone: process.env.TZ ?? "Africa/Algiers",
} as const;
