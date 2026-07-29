import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import SplitText from "@/components/type/SplitText";
import { asset, projects } from "@/lib/projects";

/**
 * The landing page is the index. No loading screen, no separate hero — the work
 * arrives first and the titles are the interface.
 *
 * Two things govern the layout.
 *
 * The titles are fitted to a MEASURE, not set to a size: each one's font size
 * falls out of its letter count so that every title's right edge lands on the
 * same vertical datum. Four words of different lengths, two flush edges. The
 * per-title unit values live in globals.css.
 *
 * The only rule in the list is the horizontal one on each row's leading edge.
 * Verticals were tried here and cut: at this type size a hairline crossing the
 * letterforms reads as a scratch on the page, not as registration.
 *
 * Hover is a CSS-only affair, which is why this is a server component with no
 * client JavaScript: the render comes up behind the title and every OTHER row
 * drops back. Selecting one thing by quieting the rest reads better than
 * lighting up the target, and unlike a colour flip it survives on a dark page.
 */

/**
 * Hand-broken. A rag this visible is worth setting by hand rather than leaving
 * to `text-wrap: balance`, and the lines are tuned to set almost solid.
 */
const statement = [
  "Vehicle design, Visualization and",
  "Art Direction. Form, function and",
  "emotion resolved as one system.",
];

export default function WorkIndex() {
  return (
    <section className="work" id="work">
      <header className="work__masthead">
        <p className="micro work__label">
          <span>By Brandon Lee</span>
          <span className="work__count">
            01—{String(projects.length).padStart(2, "0")}
          </span>
        </p>

        <div className="work__statement">
          {statement.map((line, index) => (
            <Fragment key={index}>
              {/* Kept so the lines still separate correctly on narrow screens,
                  where they run inline and rag themselves rather than holding
                  breaks that no longer fit. */}
              {index > 0 ? " " : null}
              <SplitText
                as="span"
                variant="enter"
                className="work__statementLine"
                text={line}
              />
            </Fragment>
          ))}
        </div>
      </header>

      <ul className="work__list">
        {projects.map((project, index) => {
          const hero = asset(project.hero);
          return (
            <li
              className="work__row"
              key={project.slug}
              data-slug={project.slug}
              data-restricted={project.restricted ? "true" : undefined}
            >
              <Link href={`/work/${project.slug}`} className="work__link">
                <span className="rule work__edge" data-rule aria-hidden="true" />

                <span className="work__media" aria-hidden="true">
                  {hero ? (
                    <Image
                      src={hero.src}
                      alt=""
                      width={hero.width}
                      height={hero.height}
                      sizes="100vw"
                      priority={index === 0}
                    />
                  ) : (
                    /* A tint block, not the black panel this used to be — on a
                       black page that was invisible. The withholding is stated
                       by the spec line reading 00 PL., which is a fact rather
                       than a joke about redaction. */
                    <span className="work__redacted" />
                  )}
                </span>

                <span className="work__num micro">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="work__sub micro">
                  {project.subtitle}
                  {project.restricted ? (
                    <span className="work__tag">Restricted</span>
                  ) : null}
                </span>

                <SplitText
                  as="h2"
                  className="work__title"
                  text={project.title}
                  variant="enter"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Closes the list, since the rows carry their rule on the leading edge. */}
      <span className="rule work__end" data-rule aria-hidden="true" />
    </section>
  );
}
