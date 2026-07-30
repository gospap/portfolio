import ProjectsRoute from "@/components/ProjectsRoute";
import { DEFAULT_LOCALE, getDict, isLocale } from "@/lib/content/i18n";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return {
    title: dict.pages.hardware.title,
    description: dict.pages.hardware.lead,
  };
}

export default async function Hardware({ params }) {
  const { locale } = await params;
  return <ProjectsRoute locale={locale} kind="hardware" pageKey="hardware" />;
}
