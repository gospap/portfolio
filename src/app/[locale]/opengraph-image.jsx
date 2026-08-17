import { ImageResponse } from "next/og";
import { DEFAULT_LOCALE, getDict, isLocale } from "@/lib/content/i18n";
import { PROFILE } from "@/lib/content/profile";

/* ===========================================================================
   The social card.

   `summary_large_image` was already declared in the metadata with no image
   behind it, which is worse than declaring nothing: the card renders as an
   empty grey slab wherever the link is pasted.

   Drawn rather than shipped as a file, for the same reason the hero plates
   are: it stays correct when the palette or the job title moves, and it costs
   no asset to keep in sync. It is also the one surface where the NAME is the
   entire design — which is the point, since this is what appears when someone
   shares the link.

   Satori (what renders this) is not a browser. Every element with more than
   one child needs an explicit `display: flex`, there is no cascade worth
   relying on, and unitless shorthand is unsupported — hence the very literal
   style objects below.
   =========================================================================== */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);
  return [
    {
      id: loc,
      size,
      contentType,
      alt: `${PROFILE.name} — ${dict.hero.role}`,
    },
  ];
}

export default async function Image({ params }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = getDict(loc);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#050505",
          padding: "72px 80px",
        }}
      >
        {/* top rule — the one piece of accent, kept to a hairline so the card
            reads as the site rather than as a banner ad */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 64,
              height: 3,
              backgroundColor: "#06ffff",
              marginRight: 20,
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              color: "#06ffff",
              textTransform: "uppercase",
            }}
          >
            {PROFILE.handle}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.05,
              color: "#ffffff",
              letterSpacing: -2,
            }}
          >
            {PROFILE.name}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 34,
              color: "#8e8e97",
            }}
          >
            {dict.hero.role}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#5a5a63",
            letterSpacing: 1,
          }}
        >
          {PROFILE.location[loc] ?? PROFILE.location.en}
        </div>
      </div>
    ),
    size,
  );
}
