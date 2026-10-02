"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mail, Pause, Play, RotateCcw } from "lucide-react";

/**
 * A self-playing "video" of the publisher API Form flow: dashboard → API Form
 * → test caller → result. It's a scripted replica, not a recording:
 * everything is derived from one clock `t`, so it stays sharp at any size,
 * follows the site theme, can be scrubbed, and never sends a real ping.
 *
 * The stage is laid out in a fixed 800×500 design space and scaled to fit,
 * so the cursor coordinates below line up with the elements exactly.
 */

const DURATION = 19500;
const STAGE_W = 800;
const STAGE_H = 500;

// Scene timing
const SWITCH_START = 2900; // dashboard fades out…
const SWITCH_END = 3400; // …API Form is in
const END_START = 15800; // closing card

// API Form layout (design-space px)
const COL_R = 340;
const PHONE_Y = 182;
const ROW2_Y = 254;
const STATE_X = 562;
const FIELD_W = 190;
const BTN_Y = 314;

const PHONE_TEXT = "+15551234567";
const ZIP_TEXT = "90210";
const STATE_TEXT = "CA";

// [time, x, y] — the cursor eases between consecutive points.
const CURSOR: [number, number, number][] = [
  [0, 660, 440],
  [900, 660, 440],
  [2300, 108, 279],
  [3400, 108, 279],
  [3900, 560, 420],
  [4800, 560, 420],
  [5300, 420, PHONE_Y + 16],
  [7000, 420, PHONE_Y + 16],
  [7400, 420, ROW2_Y + 16],
  [8200, 420, ROW2_Y + 16],
  [8600, 640, ROW2_Y + 16],
  [9200, 640, ROW2_Y + 16],
  [9800, 455, BTN_Y + 20],
  [11600, 455, BTN_Y + 20],
  [12600, 690, 440],
];

const CLICKS = [2500, 5350, 7450, 8650, 9900];

const CAPTIONS: [number, string][] = [
  [0, "Log in and open your Publisher Dashboard"],
  [1200, "Step 1 — Click API Form on your active offer"],
  [3400, "Step 2 — Your platform and RTB ID are already filled in"],
  [5000, "Step 3 — Enter a test caller's phone, zip and state"],
  [9400, "Step 4 — Send the test ping"],
  [11300, "Step 5 — SUCCESS · 200 means your routing works"],
  [END_START, "Retreaver or CallGrid? Your dashboard shows the right ID for you"],
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const typed = (t: number, a: number, b: number, text: string) =>
  text.slice(0, Math.round(span(t, a, b) * text.length));

function cursorAt(t: number) {
  for (let i = 0; i < CURSOR.length - 1; i++) {
    const [t0, x0, y0] = CURSOR[i];
    const [t1, x1, y1] = CURSOR[i + 1];
    if (t <= t1) {
      const p = ease(span(t, t0, t1));
      return { x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p };
    }
  }
  const last = CURSOR[CURSOR.length - 1];
  return { x: last[1], y: last[2] };
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `0:${String(s).padStart(2, "0")}`;
}

/** Small-caps field label, as on the real pages. */
function Cap({ x, y, children, gold }: { x: number; y: number; children: string; gold?: boolean }) {
  return (
    <p
      className={`absolute whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] ${gold ? "text-gold" : "text-muted"}`}
      style={{ left: x, top: y }}
    >
      {children}
    </p>
  );
}

/** Section heading with the gold thread underneath. */
function Heading({ x, y, w, children }: { x: number; y: number; w: number; children: string }) {
  return (
    <>
      <p className="absolute font-display text-[17px] font-semibold text-foreground" style={{ left: x, top: y }}>
        {children}
      </p>
      <div className="thread absolute" style={{ left: x, top: y + 30, width: w }} />
    </>
  );
}

export function ApiTesterDemo() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [scale, setScale] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);

  // Scale the fixed design stage to the frame width.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Autoplay while on screen, unless the viewer paused it or prefers less motion.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(13000); // a still of the finished test
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (userPaused.current) return;
      setPlaying(entry.isIntersecting);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      setT((prev) => (prev + (now - last)) % DURATION);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  function toggle() {
    userPaused.current = playing;
    setPlaying(!playing);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setT(clamp01((e.clientX - r.left) / r.width) * DURATION);
  }

  // --- derived frame state ---
  const cursor = cursorAt(t);
  const click = CLICKS.find((c) => t >= c && t < c + 450);
  const clickP = click === undefined ? 0 : span(t, click, click + 450);

  const dashP = 1 - ease(span(t, SWITCH_START, SWITCH_END)); // dashboard opacity
  const formP = ease(span(t, SWITCH_START + 200, SWITCH_END + 200)); // form opacity
  const btnHover = t >= 2200 && t < SWITCH_START;
  const btnPressed = t >= 2500 && t < 2650;

  const focus =
    t >= 5350 && t < 7450 ? "phone"
    : t >= 7450 && t < 8650 ? "zip"
    : t >= 8650 && t < 9900 ? "state"
    : null;
  const phone = typed(t, 5600, 6900, PHONE_TEXT);
  const zip = typed(t, 7600, 8100, ZIP_TEXT);
  const state = typed(t, 8800, 9100, STATE_TEXT);

  const sendPressed = t >= 9900 && t < 10060;
  const loading = t >= 9900 && t < 11300;
  const resultP = ease(span(t, 11300, 11800));
  const endP = ease(span(t, END_START, END_START + 600));
  const caretOn = Math.floor(t / 450) % 2 === 0;

  const caption = [...CAPTIONS].reverse().find(([start]) => t >= start)?.[1] ?? "";
  const path = t < SWITCH_END ? "/publisher" : "/publisher/api-form/medicare-inbound";

  const field = (id: string, x: number, y: number, w: number, value: string, placeholder: string) => (
    <div className="absolute" style={{ left: x, top: y, width: w, height: 36 }}>
      <div className="flex h-full items-center whitespace-nowrap text-[15px]">
        {value ? (
          <span className="text-foreground">{value}</span>
        ) : (
          <span className="text-muted/45">{placeholder}</span>
        )}
        {focus === id && caretOn && <span className="ml-px inline-block h-4 w-px bg-gold" />}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/15" />
      <div
        className="absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-gold-gradient transition-[width] duration-500"
        style={{ width: focus === id ? "100%" : "0%" }}
      />
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-panel">
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <p className="min-w-0 truncate rounded-full bg-foreground/5 px-3 py-1 font-mono text-[11px] text-muted">
          {path}
        </p>
      </div>

      {/* stage */}
      <div
        ref={frameRef}
        className="relative w-full cursor-pointer overflow-hidden bg-background"
        style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
        onClick={toggle}
        role="img"
        aria-label="Demo: opening the API Form from the publisher dashboard and sending a test ping"
      >
        <div
          className="absolute left-0 top-0 origin-top-left select-none"
          style={{
            width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`,
            background: "radial-gradient(ellipse 70% 60% at 85% 0%, rgba(214,163,67,0.10), transparent 70%)",
          }}
        >
          {/* ---------- Scene 1: dashboard ---------- */}
          {dashP > 0 && (
            <div className="absolute inset-0" style={{ opacity: dashP }}>
              <p className="absolute inline-flex items-center gap-2 rounded-full border border-emerald-teal/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-teal" style={{ left: 48, top: 36 }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-teal" />
                Publisher Dashboard
              </p>
              <p className="absolute font-display text-[32px] font-semibold text-foreground" style={{ left: 48, top: 66 }}>
                Welcome, <span className="text-gold-gradient">Acme Media</span>
              </p>

              <Heading x={48} y={138} w={704}>Your Active Offers</Heading>

              <p className="absolute inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-teal" style={{ left: 48, top: 192 }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-teal" />
                Active <span className="text-muted">· Ringba</span>
              </p>
              <p className="absolute font-display text-[20px] font-semibold text-foreground" style={{ left: 48, top: 210 }}>
                Medicare Inbound
              </p>
              <p className="absolute text-[12px] text-gold/80" style={{ left: 48, top: 240 }}>
                View offer details
              </p>
              <div
                className="absolute flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-[12px] font-semibold text-ink shadow-gold"
                style={{
                  left: 48, top: 262, width: 120, height: 34,
                  transform: btnPressed ? "scale(0.95)" : btnHover ? "scale(1.04)" : "none",
                  filter: btnHover ? "brightness(1.08)" : "none",
                }}
              >
                API Form →
              </div>

              <Cap x={COL_R} y={194}>DID</Cap>
              <p className="absolute font-mono text-[14px] text-foreground" style={{ left: COL_R, top: 212 }}>
                +1 (888) 555-0142
              </p>
              <Cap x={560} y={194}>RTB ID for this offer</Cap>
              <p className="absolute font-mono text-[14px] text-foreground" style={{ left: 560, top: 212 }}>
                CA9d1b2c3d4e5f6a
              </p>
              <p className="absolute inline-flex items-center gap-2 whitespace-nowrap text-[13px] text-muted" style={{ left: COL_R, top: 256 }}>
                <Mail className="h-4 w-4 text-gold/80" />
                Ringba reporting access sent to{" "}
                <span className="text-foreground">reports@acmemedia.com</span>
              </p>
              <div className="absolute h-px bg-gold/15" style={{ left: 48, top: 322, width: 704 }} />
            </div>
          )}

          {/* ---------- Scene 2: API Form ---------- */}
          {formP > 0 && (
            <div className="absolute inset-0" style={{ opacity: formP, transform: `translateY(${(1 - formP) * 10}px)` }}>
              <p className="absolute inline-flex items-center gap-1.5 text-[12px] text-gold/80" style={{ left: 48, top: 30 }}>
                <ArrowLeft className="h-3.5 w-3.5" /> My Dashboard
              </p>
              <p className="absolute whitespace-nowrap font-display text-[28px] font-semibold text-foreground" style={{ left: 48, top: 56 }}>
                Test your <span className="text-gold-gradient">Medicare Inbound</span> ping
              </p>

              <Heading x={48} y={116} w={240}>Your Routing</Heading>
              <Cap x={48} y={166}>Platform</Cap>
              <p className="absolute font-display text-[18px] font-semibold text-gold" style={{ left: 48, top: 182 }}>
                Ringba
              </p>
              <Cap x={48} y={226}>RTB ID for this offer</Cap>
              <p className="absolute font-mono text-[14px] text-foreground" style={{ left: 48, top: 244 }}>
                CA9d1b2c3d4e5f6a
              </p>
              <Cap x={48} y={284}>DID</Cap>
              <p className="absolute font-mono text-[14px] text-foreground" style={{ left: 48, top: 302 }}>
                +1 (888) 555-0142
              </p>

              <Heading x={COL_R} y={116} w={412}>Test Caller</Heading>
              <Cap x={COL_R} y={166} gold={focus === "phone"}>Caller Phone Number</Cap>
              {field("phone", COL_R, PHONE_Y, 412, phone, "+1 555 123 4567")}
              <Cap x={COL_R} y={238} gold={focus === "zip"}>Zip Code</Cap>
              {field("zip", COL_R, ROW2_Y, FIELD_W, zip, "90210")}
              <Cap x={STATE_X} y={238} gold={focus === "state"}>State</Cap>
              {field("state", STATE_X, ROW2_Y, FIELD_W, state, "CA")}

              <div
                className="absolute flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-[13px] font-semibold text-ink shadow-gold"
                style={{
                  left: COL_R, top: BTN_Y, width: 230, height: 40,
                  transform: sendPressed ? "scale(0.96)" : "none",
                }}
              >
                {loading && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                )}
                {loading ? "Sending ping…" : "Send Test Ping to Ringba →"}
              </div>

              {resultP > 0 && (
                <div
                  className="absolute"
                  style={{
                    left: COL_R, top: 376, width: 412,
                    opacity: resultP, transform: `translateY(${(1 - resultP) * 8}px)`,
                  }}
                >
                  <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-teal">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-teal" />
                    Success · 200
                  </p>
                  <div className="thread mt-2" />
                  <pre className="mt-2 font-mono text-[11px] leading-[1.6] text-muted">
{`"body": {
  "bidAmount": 18.5,
  "phoneNumber": "+18885550199"
}`}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ---------- Closing card ---------- */}
          {endP > 0 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/90"
              style={{ opacity: endP, backdropFilter: `blur(${endP * 4}px)` }}
            >
              <p className="font-display text-[28px] font-semibold text-foreground">
                Same flow on <span className="text-gold-gradient">every platform</span>
              </p>
              <div className="thread mt-5 w-[560px]" />
              <div className="mt-8 grid grid-cols-3 gap-10">
                {[
                  ["Ringba", "RTB ID"],
                  ["Retreaver", "API Key + Publisher ID"],
                  ["CallGrid", "Grid ID"],
                ].map(([name, id]) => (
                  <div key={name} className="w-[170px] text-center">
                    <p className="font-display text-[18px] font-semibold text-gold">{name}</p>
                    <p className="mt-1 text-[12px] text-muted">{id}</p>
                  </div>
                ))}
              </div>
              <p className="mt-9 text-[13px] text-muted">
                Filled in for you — just add a test caller and send.
              </p>
            </div>
          )}

          {/* cursor */}
          <div className="pointer-events-none absolute" style={{ left: cursor.x, top: cursor.y, opacity: 1 - endP }}>
            {clickP > 0 && (
              <span
                className="absolute rounded-full border-2 border-gold"
                style={{
                  width: 34, height: 34, left: -17, top: -17,
                  opacity: 1 - clickP, transform: `scale(${0.3 + clickP})`,
                }}
              />
            )}
            <svg width="20" height="24" viewBox="0 0 20 24" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
              <path d="M2 1 L2 19 L7 14.5 L10.5 22 L13.5 20.6 L10 13.3 L17 13.3 Z" fill="white" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient text-ink shadow-gold">
              <Play className="ml-1 h-7 w-7" fill="currentColor" />
            </span>
          </div>
        )}
      </div>

      {/* caption + controls */}
      <div className="border-t border-border px-4 pb-3 pt-3">
        <p className="min-h-[2.5rem] text-sm font-medium leading-snug text-foreground" aria-live="polite">
          {caption}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause demo" : "Play demo"}
            className="text-gold transition-colors hover:text-foreground"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => { setT(0); userPaused.current = false; setPlaying(true); }}
            aria-label="Restart demo"
            className="text-gold transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="relative h-4 flex-1 cursor-pointer" onClick={seek}>
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/10" />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold"
              style={{ width: `${(t / DURATION) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-muted">
            {fmt(t)} / {fmt(DURATION)}
          </span>
        </div>
      </div>
    </div>
  );
}
