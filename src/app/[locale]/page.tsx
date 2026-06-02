import { HomeRedirect } from "@/components/HomeRedirect";
import { setRequestLocale } from "next-intl/server";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeRedirect />;
}
