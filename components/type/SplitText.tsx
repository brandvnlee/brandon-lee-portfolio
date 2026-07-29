import { createElement, type ReactNode } from "react";

/**
 * Splits a string into animatable units. Rendered on the server, so the split
 * markup is in the HTML on first paint and there is no reflow when motion takes
 * over.
 *
 * Granularity is a craft decision, not a convenience:
 *
 *   "enter"      — split per CHARACTER. Display type, where the mechanical
 *                  cadence is the point. Uppercase neo-grotesque kerning is
 *                  nearly flat, and none of the pairs that carry real negative
 *                  kerns (AV, AW, AY, LT, TA, VA) occur in the project names,
 *                  so splitting costs nothing here.
 *
 *   "illuminate" — split per WORD. This runs on lowercase running copy, where
 *                  the kern pairs actually live ("ry", "va", "To"). Splitting
 *                  that per character disables kerning at reading size and
 *                  ships a DOM node per letter. A scrubbed brightening reveal
 *                  reads the same at word granularity — arguably better, since
 *                  the eye tracks words.
 *
 * Accessibility: splitting text makes a screen reader announce "M a n t r a".
 * The units are therefore hidden from the accessibility tree and the whole
 * string is restored with aria-label.
 */

type Variant = "enter" | "illuminate";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  variant?: Variant;
  className?: string;
};

export default function SplitText({
  text,
  as = "span",
  variant = "enter",
  className,
}: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  const perCharacter = variant === "enter";

  const children: ReactNode[] = [];
  words.forEach((word, wordIndex) => {
    if (wordIndex > 0) children.push(" ");
    children.push(
      <span className="word" key={wordIndex} aria-hidden="true">
        {perCharacter
          ? Array.from(word).map((char, charIndex) => (
              <span
                className="char"
                key={charIndex}
                /* Splitting into inline-blocks disables kerning. At display
                   sizes with tight tracking a few pairs collide, so the pair is
                   exposed here and corrected by hand in CSS. */
                data-pair={
                  charIndex > 0
                    ? (word[charIndex - 1] + char).toUpperCase()
                    : undefined
                }
              >
                {char}
              </span>
            ))
          : word}
      </span>,
    );
  });

  return createElement(
    as,
    {
      className,
      "data-split": variant,
      "aria-label": text,
    },
    ...children,
  );
}
