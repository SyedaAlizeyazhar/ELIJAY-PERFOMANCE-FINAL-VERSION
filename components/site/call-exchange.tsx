"use client";

import { useEffect, useRef } from "react";
import { useIsDarkRef } from "@/components/theme/theme-provider";

/**
 * Buy / sell call exchange — the two-sided marketplace, animated.
 *
 * No boxes: publishers and buyers are glowing nodes, joined to ELIJAY by fine
 * gold threads. ELIJAY is an orbital core — a rotating dashed ring (SCREEN)
 * around a solid inner ring (MATCH).
 *
 * A call is a gold particle that rides its thread into the core, circles the
 * screening ring, then either flies off in rust with its rejection reason, or
 * drops into the match ring and rides out along a thread to a buyer, landing
 * with a ripple. SOLD / DISQUALIFIED are tallied as bare numerals.
 *
 * Wide screens flow left-to-right; phones (below VERTICAL_BELOW px) flow
 * top-to-bottom so everything stays full size.
 *
 * Canvas 2D, no dependencies. Pauses off-screen / in hidden tabs, draws one
 * static frame under prefers-reduced-motion, and is time-based so every
 * refresh rate runs at the same speed.
 *
 * NOTE: payouts, verticals and the ~1-in-4 rejection rate are illustrative,
 * not network statistics.
 */

const PUB_LANES = ["Medicare", "ACA", "Final Expense", "Auto"];
const BUY_LANES = ["Buyer A", "Buyer B", "Buyer C", "Buyer D"];
const REASONS = ["Duplicate", "Out of geo", "Short duration", "No consent"];
const PRICE_BASE = 26;
const VERTICAL_BELOW = 560;

type RGB = [number, number, number];
const GOLD: RGB = [214, 163, 67];
const LIGHT: RGB = [245, 210, 122];
const TEAL: RGB = [0, 138, 112];
const EM: RGB = [0, 59, 50];
const WARM: RGB = [244, 241, 232];
const INK: RGB = [5, 6, 7];
const WHITE: RGB = [255, 255, 255];
const DEEP_GOLD: RGB = [184, 128, 30];
const RUST: RGB = [194, 72, 60];

const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Timeline of one call (t runs 0 -> LANDED).
const T_ARRIVE = 0.35; // reaches the screening ring
const T_SCREENED = 0.52; // finished circling the ring
const T_MATCHED = 0.62; // reached the centre
const T_EXIT = 0.7; // back out at the ring edge
const AT_BUYER = 1;
const LANDED = 1.15;
const ORBIT = 0.95; // radians travelled around the ring while screening

type Pt = { x: number; y: number };

type Call = {
  t: number;
  lane: number;
  buyLane: number;
  price: number;
  fail: boolean;
  reason: string;
  fy: number;
  fv: number;
};

type Thread = { node: Pt; ring: Pt; ctrl: Pt; angle: number };

type Layout = {
  vertical: boolean;
  core: Pt;
  R: number;
  pubs: Pt[];
  buys: Pt[];
  pubThreads: Thread[];
  buyThreads: Thread[];
  titles: [Pt, Pt];
  titleAlign: CanvasTextAlign;
  counterY: number;
};

function quad(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}

function spread(count: number, from: number, to: number) {
  const gap = (to - from) / count;
  return Array.from({ length: count }, (_, i) => from + gap * i + gap / 2);
}

function thread(node: Pt, core: Pt, R: number, vertical: boolean): Thread {
  const angle = Math.atan2(node.y - core.y, node.x - core.x);
  const ring = { x: core.x + R * Math.cos(angle), y: core.y + R * Math.sin(angle) };
  const ctrl = vertical
    ? { x: node.x, y: (node.y + ring.y) / 2 }
    : { x: (node.x + ring.x) / 2, y: node.y };
  return { node, ring, ctrl, angle };
}

function makeLayout(w: number, h: number): Layout {
  if (w < VERTICAL_BELOW) {
    const pad = 34;
    const topY = 58;
    const botY = h - 104;
    const core = { x: w / 2, y: (topY + botY) / 2 };
    const R = Math.min(62, w * 0.18);
    const xs = spread(4, pad - 20, w - pad + 20);
    const pubs = xs.map((x) => ({ x, y: topY }));
    const buys = xs.map((x) => ({ x, y: botY }));
    return {
      vertical: true,
      core,
      R,
      pubs,
      buys,
      pubThreads: pubs.map((p) => thread(p, core, R, true)),
      buyThreads: buys.map((p) => thread(p, core, R, true)),
      titles: [{ x: w / 2, y: 18 }, { x: w / 2, y: botY + 44 }],
      titleAlign: "center",
      counterY: h - 22,
    };
  }

  const top = 60;
  const bottom = h - 96;
  const midY = (top + bottom) / 2;
  const half = (bottom - top) / 2;
  const core = { x: w / 2, y: midY };
  const R = Math.min(78, (bottom - top) * 0.3);
  const pubX = Math.max(118, w * 0.17);
  const buyX = w - pubX;
  const bulge = Math.min(34, w * 0.03);
  const arc = (y: number) => bulge * (1 - Math.pow((y - midY) / half, 2));
  const ys = spread(4, top, bottom);
  const pubs = ys.map((y) => ({ x: pubX + arc(y), y }));
  const buys = ys.map((y) => ({ x: buyX - arc(y), y }));
  return {
    vertical: false,
    core,
    R,
    pubs,
    buys,
    pubThreads: pubs.map((p) => thread(p, core, R, false)),
    buyThreads: buys.map((p) => thread(p, core, R, false)),
    titles: [{ x: pubX - 16, y: top - 30 }, { x: buyX + 16, y: top - 30 }],
    titleAlign: "center",
    counterY: h - 26,
  };
}

export function CallExchange({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = useIsDarkRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let L: Layout = makeLayout(1, 1);
    let clock = 0; // 60fps-frame units
    let spawned = 0;
    let last = 0;
    let running = true;
    let rafId = 0;
    let calls: Call[] = [];
    let sold = 0;
    let rejected = 0;
    let soldFlash = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      // Mobile browsers fire resize when the URL bar shows/hides; only reset
      // on a real size change.
      if (rect.width === width && rect.height === height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      L = makeLayout(width, height);
      if (reduceMotion) draw(0);
    }

    function dot(p: Pt, r: number, col: RGB, alpha: number, glow = 0) {
      if (glow > 0) {
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
        g.addColorStop(0, rgba(col, 0.55 * alpha));
        g.addColorStop(1, rgba(col, 0));
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, glow, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.fillStyle = rgba(col, alpha);
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw(dt: number) {
      ctx!.clearRect(0, 0, width, height);
      clock += dt;

      const dark = isDark.current;
      const TEXT = dark ? WARM : INK;
      const CORE_FILL = dark ? EM : WHITE;
      const SPARK = dark ? LIGHT : DEEP_GOLD;
      const PARTICLE = dark ? GOLD : DEEP_GOLD;
      const { core, R } = L;

      // --- threads (always visible, faint) ---
      const strokeThread = (th: Thread, col: RGB, a: number) => {
        ctx!.strokeStyle = rgba(col, a);
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(th.node.x, th.node.y);
        ctx!.quadraticCurveTo(th.ctrl.x, th.ctrl.y, th.ring.x, th.ring.y);
        ctx!.stroke();
      };
      L.pubThreads.forEach((th) => strokeThread(th, TEAL, 0.22));
      L.buyThreads.forEach((th) => strokeThread(th, GOLD, 0.18));

      // --- core: glow, rotating screening ring, match ring ---
      const glow = ctx!.createRadialGradient(core.x, core.y, 0, core.x, core.y, R * 2.3);
      glow.addColorStop(0, rgba(GOLD, 0.13));
      glow.addColorStop(1, rgba(GOLD, 0));
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(core.x, core.y, R * 2.3, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.save();
      ctx!.setLineDash([3, 7]);
      ctx!.lineDashOffset = -clock * 0.35;
      ctx!.strokeStyle = rgba(TEAL, 0.7);
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      ctx!.arc(core.x, core.y, R, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      // a brighter arc sweeping round the screening ring
      const sweep = clock * 0.02;
      ctx!.strokeStyle = rgba(GOLD, 0.8);
      ctx!.lineWidth = 1.6;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.arc(core.x, core.y, R, sweep, sweep + 0.7);
      ctx!.stroke();

      const inner = R * 0.52;
      const pulse = 1 + Math.sin(clock * 0.05) * 0.025;
      ctx!.fillStyle = rgba(CORE_FILL, 0.9);
      ctx!.beginPath();
      ctx!.arc(core.x, core.y, inner * pulse, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = rgba(GOLD, 0.85);
      ctx!.lineWidth = 1.3;
      ctx!.stroke();

      ctx!.textAlign = "center";
      ctx!.fillStyle = rgba(SPARK, 0.95);
      ctx!.font = "700 10px Inter, sans-serif";
      ctx!.fillText("ELIJAY", core.x, core.y + 1);
      ctx!.fillStyle = rgba(TEXT, 0.45);
      ctx!.font = "600 7.5px Inter, sans-serif";
      ctx!.fillText("MATCH", core.x, core.y + 12);

      ctx!.font = "600 8.5px Inter, sans-serif";
      ctx!.fillStyle = rgba(TEAL, 0.95);
      if (L.vertical) {
        ctx!.textAlign = "left";
        ctx!.fillText("SCREEN", core.x + R + 8, core.y - 2);
        ctx!.fillStyle = rgba(TEXT, 0.35);
        ctx!.font = "500 7.5px Inter, sans-serif";
        ctx!.fillText("consent · dupe", core.x + R + 8, core.y + 9);
        ctx!.fillText("geo · duration", core.x + R + 8, core.y + 19);
      } else {
        ctx!.fillText("SCREEN", core.x, core.y - R - 12);
        ctx!.fillStyle = rgba(TEXT, 0.35);
        ctx!.font = "500 8px Inter, sans-serif";
        ctx!.fillText("consent · dupe · geo · duration", core.x, core.y + R + 18);
      }

      // --- nodes + labels ---
      const drawNodes = (pts: Pt[], labels: string[], col: RGB, side: 0 | 1) => {
        pts.forEach((p, i) => {
          const hot = calls.some((c) =>
            side === 0 ? c.lane === i && c.t < 0.12 : c.buyLane === i && c.t > 0.9 && !c.fail
          );
          if (hot) {
            ctx!.strokeStyle = rgba(col, 0.5);
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, 11 + Math.sin(clock * 0.3) * 1.5, 0, Math.PI * 2);
            ctx!.stroke();
          }
          dot(p, hot ? 5 : 4, col, hot ? 1 : 0.8, hot ? 22 : 12);
          ctx!.fillStyle = rgba(CORE_FILL, 1);
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          ctx!.fill();

          ctx!.fillStyle = rgba(TEXT, hot ? 0.95 : 0.6);
          if (L.vertical) {
            ctx!.font = "500 9.5px Inter, sans-serif";
            ctx!.textAlign = "center";
            ctx!.fillText(labels[i], p.x, side === 0 ? p.y - 14 : p.y + 20);
          } else {
            ctx!.font = "500 11px Inter, sans-serif";
            ctx!.textAlign = side === 0 ? "right" : "left";
            ctx!.fillText(labels[i], p.x + (side === 0 ? -14 : 14), p.y + 4);
          }
        });
      };
      drawNodes(L.pubs, PUB_LANES, TEAL, 0);
      drawNodes(L.buys, BUY_LANES, GOLD, 1);

      ctx!.font = "600 9px Inter, sans-serif";
      ctx!.textAlign = L.titleAlign;
      ctx!.fillStyle = rgba(TEAL, 0.95);
      ctx!.fillText("PUBLISHERS  ·  SELL CALLS", L.titles[0].x, L.titles[0].y);
      ctx!.fillStyle = rgba(GOLD, 0.95);
      ctx!.fillText("BUYERS  ·  BUY CALLS", L.titles[1].x, L.titles[1].y);

      // --- spawn: one call every 30 frames (half a second) ---
      if (clock >= spawned * 30 && calls.length < 10) {
        const n = spawned++;
        calls.push({
          t: 0,
          lane: n % PUB_LANES.length,
          buyLane: (n * 3) % BUY_LANES.length,
          price: PRICE_BASE + ((n * 13) % 44),
          fail: n % 4 === 2,
          reason: REASONS[n % REASONS.length],
          fy: 0,
          fv: 0,
        });
      }

      // --- calls ---
      calls.forEach((c) => {
        const inTh = L.pubThreads[c.lane];
        const outTh = L.buyThreads[c.buyLane];
        c.t += 0.0075 * dt;

        let p: Pt;
        let col: RGB = PARTICLE;
        let alpha = 1;
        const orbitAngle = inTh.angle + ORBIT * easeInOut(clamp01((c.t - T_ARRIVE) / (T_SCREENED - T_ARRIVE)));
        const orbitPt = { x: core.x + R * Math.cos(orbitAngle), y: core.y + R * Math.sin(orbitAngle) };

        if (c.t < T_ARRIVE) {
          // ride the thread in (node -> ring)
          p = quad(inTh.node, inTh.ctrl, inTh.ring, easeInOut(c.t / T_ARRIVE));
        } else if (c.t < T_SCREENED) {
          p = orbitPt; // circling the screening ring
        } else if (c.fail) {
          // flung off the ring, falling away in rust
          c.fv += 0.5 * dt;
          c.fy += c.fv * dt;
          const out = { x: Math.cos(orbitAngle), y: Math.sin(orbitAngle) };
          p = L.vertical
            ? { x: orbitPt.x + c.fy * 0.9, y: orbitPt.y + out.y * c.fy * 0.3 }
            : { x: orbitPt.x + out.x * c.fy * 0.35, y: orbitPt.y + c.fy };
          col = RUST;
          alpha = Math.max(0, 1 - c.fy / 150);
        } else if (c.t < T_MATCHED) {
          const k = easeOut((c.t - T_SCREENED) / (T_MATCHED - T_SCREENED));
          p = { x: lerp(orbitPt.x, core.x, k), y: lerp(orbitPt.y, core.y, k) };
          col = SPARK;
        } else if (c.t < T_EXIT) {
          const k = (c.t - T_MATCHED) / (T_EXIT - T_MATCHED);
          p = { x: lerp(core.x, outTh.ring.x, k), y: lerp(core.y, outTh.ring.y, k) };
          col = SPARK;
        } else if (c.t < AT_BUYER) {
          // ride the buyer's thread out (ring -> node)
          p = quad(outTh.ring, outTh.ctrl, outTh.node, easeOut((c.t - T_EXIT) / (AT_BUYER - T_EXIT)));
          col = SPARK;
        } else {
          const k = clamp01((c.t - AT_BUYER) / (LANDED - AT_BUYER));
          p = outTh.node;
          col = SPARK;
          alpha = 1 - k;
          ctx!.strokeStyle = rgba(PARTICLE, 0.6 * (1 - k));
          ctx!.lineWidth = 1.4;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 5 + k * 20, 0, Math.PI * 2);
          ctx!.stroke();
        }

        // Inside the MATCH ring the call is "absorbed" — drawing it there
        // would put a spark over the ELIJAY / MATCH lettering.
        const absorbed = Math.hypot(p.x - core.x, p.y - core.y) < inner;
        ctx!.globalAlpha = alpha;
        if (!absorbed) dot(p, 2.6, col, 0.95, 11);

        if (c.fail && c.t > T_SCREENED) {
          ctx!.fillStyle = rgba(RUST, alpha * 0.95);
          ctx!.font = "600 10px Inter, sans-serif";
          ctx!.textAlign = L.vertical ? "center" : "left";
          if (L.vertical) ctx!.fillText(c.reason, p.x, p.y - 12);
          else ctx!.fillText(c.reason, p.x + 10, p.y + 3);
        } else if (!c.fail && c.t > T_EXIT && (!L.vertical || c.t < AT_BUYER)) {
          // Stacked (phone) layout: the price rides beside the call and fades
          // as it lands, so it never sits on the buyer's node and label.
          const landing = L.vertical ? 1 - clamp01((c.t - (AT_BUYER - 0.04)) / 0.04) : 1;
          ctx!.fillStyle = rgba(PARTICLE, alpha * landing * clamp01((c.t - T_EXIT) * 6));
          ctx!.font = "600 10px Inter, sans-serif";
          ctx!.textAlign = L.vertical ? "left" : "center";
          if (L.vertical) ctx!.fillText("$" + c.price, p.x + 12, p.y + 3);
          else ctx!.fillText("$" + c.price, p.x, p.y - 12);
        }
        ctx!.globalAlpha = 1;
      });

      calls = calls.filter((c) => {
        if (c.fail && c.fy > 150) {
          rejected++;
          return false;
        }
        if (!c.fail && c.t >= LANDED) {
          sold++;
          soldFlash = 1;
          return false;
        }
        return true;
      });

      // --- tallies: bare numerals split by a thread, no boxes ---
      soldFlash = Math.max(0, soldFlash - 0.035 * dt);
      const cy = L.counterY;
      const cx = width / 2;
      const vline = ctx!.createLinearGradient(0, cy - 34, 0, cy + 6);
      vline.addColorStop(0, rgba(GOLD, 0));
      vline.addColorStop(0.5, rgba(GOLD, 0.5));
      vline.addColorStop(1, rgba(GOLD, 0));
      ctx!.fillStyle = vline;
      ctx!.fillRect(cx - 0.5, cy - 34, 1, 40);

      if (soldFlash > 0) {
        const halo = ctx!.createRadialGradient(cx - 50, cy - 8, 0, cx - 50, cy - 8, 70);
        halo.addColorStop(0, rgba(GOLD, 0.3 * soldFlash));
        halo.addColorStop(1, rgba(GOLD, 0));
        ctx!.fillStyle = halo;
        ctx!.beginPath();
        ctx!.arc(cx - 50, cy - 8, 70, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.font = "600 8.5px Inter, sans-serif";
      ctx!.fillStyle = rgba(TEXT, 0.45);
      ctx!.textAlign = "right";
      ctx!.fillText("SOLD", cx - 20, cy - 22);
      ctx!.textAlign = "left";
      ctx!.fillText("DISQUALIFIED", cx + 20, cy - 22);

      ctx!.font = "600 24px Montserrat, Inter, sans-serif";
      ctx!.textAlign = "right";
      ctx!.fillStyle = rgba(soldFlash > 0 ? LIGHT : GOLD, 0.95);
      ctx!.fillText(String(sold), cx - 20, cy + 4);
      ctx!.textAlign = "left";
      ctx!.fillStyle = rgba(RUST, 0.95);
      ctx!.fillText(String(rejected), cx + 20, cy + 4);
    }

    function loop(now: number) {
      if (!running) return;
      const dt = last ? Math.min(3, (now - last) / (1000 / 60)) : 1;
      last = now;
      draw(dt);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      last = 0;
      rafId = requestAnimationFrame(loop);
    }

    resize();
    draw(0);
    if (!reduceMotion) start();

    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const was = running;
        running = entry.isIntersecting && !document.hidden && !reduceMotion;
        if (running && !was) start();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    function onVisibility() {
      const was = running;
      running = !document.hidden && !reduceMotion;
      if (running && !was) start();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, [isDark]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
