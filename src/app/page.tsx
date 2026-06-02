import { routing } from "@/i18n/routing";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function detectLocaleFromHeaders(): Promise<(typeof routing.locales)[number]> {
  const headerStore = await headers();
  const accept = headerStore.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("ar") ? "ar" : routing.defaultLocale;
}

export default async function RootPage() {
  const locale = await detectLocaleFromHeaders();
  redirect(`/${locale}/login`);
}
