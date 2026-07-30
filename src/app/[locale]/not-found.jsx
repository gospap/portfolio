import Link from "next/link";

/* Deliberately plain: a 404 is the one page that must render even if
   everything clever on this site has failed. No canvas, no scroll machinery. */
export default function NotFound() {
  return (
    <section className="phead">
      <div className="wrap">
        <p className="kicker">404</p>
        <h1 className="phead__title">This page does not exist.</h1>
        <p className="lead phead__lead">
          The link may be old, or the address mistyped.
        </p>
        <p style={{ marginTop: "2rem" }}>
          <Link className="btn" href="/">
            Back to the start
          </Link>
        </p>
      </div>
    </section>
  );
}
