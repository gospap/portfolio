import { DEFAULT_LOCALE, getDict, isLocale } from "@/lib/content/i18n";
import { PROFILE, socialLinks } from "@/lib/content/profile";
import ContactRows from "@/components/ContactRows";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: dict.contact.title, description: dict.contact.lead };
}

export default async function Contact({ params }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);
  const links = socialLinks();

  return (
    <>
      <header className="phead theme-silver">
        <div className="wrap">
          <p className="kicker">{PROFILE.location[loc] ?? PROFILE.location.en}</p>
          <h1 className="phead__title">{dict.contact.title}</h1>
          <p className="lead phead__lead">{dict.contact.lead}</p>
        </div>
      </header>

      <section className="wrap theme-silver">
        <Reveal>
          {links.length ? (
            <ContactRows links={links} dict={dict} />
          ) : (
            <p className="lead">{dict.contact.pending}</p>
          )}
        </Reveal>

        <Reveal index={1}>
          <p className="contact__note">{dict.contact.availability}</p>
          {PROFILE.cv ? (
            <a className="btn btn-ghost" href={PROFILE.cv} download style={{ marginTop: "1.5rem" }}>
              CV (PDF)
            </a>
          ) : null}
        </Reveal>
      </section>

      <div className="section-pad" />
    </>
  );
}
