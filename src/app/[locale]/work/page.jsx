import ProjectsRoute from "@/components/ProjectsRoute";
import { DEFAULT_LOCALE, getDict, isLocale } from "@/lib/content/i18n";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: dict.pages.work.title, description: dict.pages.work.lead };
}

export default async function Work({ params }) {
  const { locale } = await params;
  return <ProjectsRoute locale={locale} kind="web" pageKey="work" />;
}
