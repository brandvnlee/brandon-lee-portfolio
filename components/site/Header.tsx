import ContactLink from "@/components/site/ContactLink";
import HomeLink from "@/components/site/HomeLink";

/**
 * Functional, not a logo. The wordmark treatment is gone: the left slot is a
 * plain index link, so nothing here competes with the work.
 *
 * No rule at the foot of it. A fixed hairline across the full width tracked
 * down the page as you scrolled and cut across whatever was passing under it,
 * which is the same complaint the schematic grid earned.
 */
export default function Header() {
  return (
    <header className="header">
      <HomeLink className="micro" />

      {/* Contact only. A "Work" link pointing at the index was redundant when
          the index is the page you are already on. */}
      <nav className="header__nav">
        <ContactLink className="micro" label="Contact" />
      </nav>
    </header>
  );
}
