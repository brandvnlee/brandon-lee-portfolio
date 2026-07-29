"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/lib/projects";

/**
 * A `mailto:` link only opens something if the machine has a mail client
 * registered as the protocol handler. Plenty of people — probably most of the
 * ones looking at this — use webmail in a tab, and for them a bare mailto link
 * appears to do absolutely nothing.
 *
 * So the href stays, because it is correct semantics and it does work wherever
 * a handler exists, but the click always produces a visible result too: the
 * address is copied, and if copying is refused the label reveals the address so
 * it can be read or selected by hand. There is no way to detect whether the
 * mailto actually opened anything, so the fallback is unconditional.
 *
 * `aria-label` is deliberately fixed, so a screen reader always announces the
 * address rather than a label that changes under it.
 */

/**
 * The async Clipboard API needs transient user activation and can be refused
 * outright by permissions policy, so the deprecated path is kept as a fallback.
 * It is markedly more permissive and this is exactly the case it still earns.
 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* Fall through. */
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

type State = "idle" | "copied" | "revealed";

export default function ContactLink({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const onClick = () => {
    void copyText(contact.email).then((ok) => {
      setState(ok ? "copied" : "revealed");
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState("idle"), 3200);
    });
  };

  return (
    <a
      className={className}
      href={`mailto:${contact.email}`}
      onClick={onClick}
      aria-label={`Email ${contact.email}`}
    >
      {state === "copied"
        ? "Address copied"
        : state === "revealed"
          ? contact.email
          : label}
    </a>
  );
}
