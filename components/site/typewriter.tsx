"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Types text out, holds it, erases it, and repeats — so the tagline stays in
 * motion rather than typing once and sitting still.
 *
 * Accessibility: the full string is always present for screen readers via a
 * visually-hidden copy, and reduced-motion users get the finished text
 * immediately with no looping. The text is never withheld, only revealed.
 *
 * A single chained timeout (no interval) drives it, so the phases can have
 * different speeds and nothing queues up if the tab is backgrounded.
 */
export function Typewriter({
  text,
  speed = 55,
  eraseSpeed = 28,
  holdFull = 2400,
  holdEmpty = 600,
  delay = 400,
  loop = true,
  className,
}: {
  text: string;
  speed?: number;
  eraseSpeed?: number;
  holdFull?: number;
  holdEmpty?: number;
  delay?: number;
  loop?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      setDone(true);
      return;
    }

    let i = 0;
    let erasing = false;

    function step() {
      if (!erasing) {
        i++;
        setShown(text.slice(0, i));
        if (i < text.length) {
          timer.current = setTimeout(step, speed);
        } else if (loop) {
          erasing = true;
          timer.current = setTimeout(step, holdFull);
        } else {
          setDone(true);
        }
      } else {
        i--;
        setShown(text.slice(0, i));
        if (i > 0) {
          timer.current = setTimeout(step, eraseSpeed);
        } else {
          erasing = false;
          timer.current = setTimeout(step, holdEmpty);
        }
      }
    }

    timer.current = setTimeout(step, delay);
    return () => clearTimeout(timer.current);
  }, [text, speed, eraseSpeed, holdFull, holdEmpty, delay, loop]);

  // The caret is glued to the last word so it can never wrap onto a line of
  // its own and sit over the copy below on narrow screens.
  const cut = shown.lastIndexOf(" ") + 1;
  const head = shown.slice(0, cut);
  const tail = shown.slice(cut);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {/* reserves the full width so surrounding layout never reflows */}
      <span className="relative">
        <span className="invisible" aria-hidden="true">
          {text}
        </span>
        <span className="absolute inset-0" aria-hidden="true">
          {head}
          <span className="whitespace-nowrap">
            {tail}
            {!done && (
              <span className="-mr-[3px] ml-0.5 inline-block h-[1.1em] w-px animate-caret bg-gold align-[-0.15em]" />
            )}
          </span>
        </span>
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
