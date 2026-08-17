import Reveal from "@/components/Reveal";

/*
 * The stack, as a plain grid of cards.
 *
 * No canvas and no scroll runway: this section is a list of things someone
 * needs to be able to read and leave. It was a sphere for a while and the
 * sphere was the wrong instrument — a reader scanning for "do they know
 * Postgres" should not have to scroll four viewports to find out.
 *
 * Everything here is a server component and one stylesheet. The only motion is
 * the entrance stagger and a hover state, both CSS.
 */
export default function SkillGrid({ items }) {
  return (
    <div className="skills">
      {items.map((s, i) => (
        <Reveal key={s.slug} index={i % 3} className="skill roll-host">
          <span className="mono-note skill__num">
            {String(i + 1).padStart(2, "0")}
          </span>
          {/* The title is in the DOM twice on purpose — see .roll. The second
              copy is the one that arrives from below on hover, and it is
              hidden from assistive tech so the name is announced once. */}
          <h3 className="skill__title">
            <span className="roll">
              <span>{s.title}</span>
              <span aria-hidden>{s.title}</span>
            </span>
          </h3>
          <p className="mono-note skill__kicker">{s.kicker}</p>
          <p className="skill__body">{s.body}</p>
        </Reveal>
      ))}
    </div>
  );
}
