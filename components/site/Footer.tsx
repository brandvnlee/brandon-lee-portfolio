import { contact, links } from "@/lib/projects";
import ContactLink from "@/components/site/ContactLink";

/**
 * The stacked wordmark is gone. What is left is a colophon: contact, year, and
 * numbered links, set at the same weight as every other label on the site.
 */
export default function Footer() {
  return (
    <footer className="footer">
      {/* The strongest break on the page, so it carries the heaviest weight in
          the system. */}
      <span className="rule rule--heavy" data-rule aria-hidden="true" />

      <div className="footer__cols">
        <div className="footer__list">
          <ContactLink className="micro" label={contact.email} />
          <span className="micro footer__quiet">
            &copy; {new Date().getFullYear()}
          </span>
        </div>

        <div className="footer__list">
          {links.map((link, i) => (
            <a
              className="footer__link micro"
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={
                link.href.startsWith("http") ? "noreferrer noopener" : undefined
              }
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
