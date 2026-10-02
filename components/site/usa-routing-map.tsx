"use client";

import { useEffect, useRef } from "react";

/**
 * Hero visual: a dotted map of the lower-48 with calls flying from publisher
 * cities to buyer call-centre hubs along gold arcs, landing with a ripple.
 * Illustrative — it shows what the network does, not live traffic.
 *
 * The outline is a simplified lon/lat trace of the contiguous US, projected
 * equirectangularly; the dot field is rendered once per size to an offscreen
 * canvas, so each frame only draws the moving arcs. Pauses off-screen and in
 * hidden tabs; one static frame under prefers-reduced-motion.
 */

type LonLat = [number, number];

const LON0 = -125;
const LON1 = -66.5;
const LAT0 = 24.3;
const LAT1 = 49.6;

// Simplified outline of the contiguous United States (clockwise from WA).
const OUTLINE: LonLat[] = [
  [-124.7, 48.4], [-123.1, 49.0], [-95.2, 49.0], [-94.8, 49.4], [-89.6, 48.0],
  [-84.8, 46.5], [-82.5, 43.0], [-83.1, 42.0], [-78.9, 42.9], [-76.3, 44.2],
  [-74.7, 45.0], [-71.5, 45.0], [-70.0, 46.7], [-69.2, 47.4], [-67.8, 47.1],
  [-67.8, 45.2], [-67.0, 44.8], [-70.2, 43.6], [-70.8, 42.6], [-70.0, 41.8],
  [-71.4, 41.4], [-73.7, 40.9], [-74.0, 40.5], [-74.9, 38.9], [-75.1, 38.0],
  [-76.0, 36.9], [-75.5, 35.2], [-77.9, 33.9], [-79.2, 33.2], [-81.0, 31.9],
  [-81.4, 30.3], [-80.6, 28.4], [-80.0, 26.7], [-80.4, 25.2], [-81.1, 25.1],
  [-81.8, 26.2], [-82.7, 27.8], [-83.7, 29.9], [-85.3, 29.7], [-86.5, 30.4],
  [-88.0, 30.7], [-89.6, 30.2], [-89.4, 29.0], [-90.5, 29.1], [-92.0, 29.6],
  [-93.8, 29.7], [-94.8, 29.3], [-96.7, 28.3], [-97.4, 27.2], [-97.2, 25.9],
  [-99.5, 27.5], [-101.4, 29.8], [-103.2, 29.0], [-104.5, 29.6], [-106.5, 31.8],
  [-108.2, 31.8], [-108.2, 31.3], [-111.1, 31.3], [-114.8, 32.5], [-117.1, 32.5],
  [-118.5, 34.0], [-120.6, 34.6], [-121.9, 36.6], [-122.5, 37.8], [-123.8, 39.7],
  [-124.4, 40.4], [-124.2, 42.0], [-124.1, 43.7], [-123.9, 46.2],
];

// Lake Michigan, cut out of the dot field.
const LAKE: LonLat[] = [
  [-87.8, 41.6], [-87.0, 41.7], [-86.2, 42.8], [-86.5, 44.5], [-85.6, 45.8],
  [-87.0, 45.9], [-87.6, 44.5], [-87.9, 43.0],
];

// Where calls come from (publisher traffic) …
const SOURCES: LonLat[] = [
  [-122.3, 47.6], [-118.2, 34.1], [-111.9, 40.8], [-104.9, 39.7], [-94.6, 39.1],
  [-87.6, 41.9], [-83.0, 42.3], [-75.2, 40.0], [-74.0, 40.7], [-86.8, 36.2],
  [-80.8, 35.2], [-84.4, 33.7], [-95.4, 29.8], [-80.2, 25.8], [-90.1, 29.95],
  [-93.3, 45.0], [-112.1, 33.4], [-71.1, 42.4],
];

// … and the buyer hubs they're routed to.
const HUBS: { at: LonLat; code: string }[] = [
  { at: [-96.8, 32.8], code: "TX" },
  { at: [-82.5, 28.0], code: "FL" },
  { at: [-83.0, 40.0], code: "OH" },
  { at: [-112.1, 33.4], code: "AZ" },
  { at: [-78.6, 35.8], code: "NC" },
];

const VERTICALS = ["Medicare", "Final Expense", "ACA", "Auto", "Home Warranty", "Solar", "Debt Relief"];

type Flight = { from: LonLat; hub: number; t: number; label: string; landed?: boolean };

function inside(pt: [number, number], poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export function UsaRoutingMap({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let field: HTMLCanvasElement | null = null;
    let flights: Flight[] = [];
    let spawned = 0;
    let clock = 0;
    let last = 0;
    let running = true;
    let rafId = 0;
    const landed: { hub: number; age: number }[] = [];

    // lon/lat -> canvas px, keeping the map's aspect and centring it
    let scale = 1;
    let ox = 0;
    let oy = 0;
    const project = ([lon, lat]: LonLat): [number, number] => [
      ox + (lon - LON0) * scale,
      oy + (LAT1 - lat) * scale * 1.22,
    ];

    function buildField() {
      field = document.createElement("canvas");
      field.width = width * dpr;
      field.height = height * dpr;
      const f = field.getContext("2d")!;
      f.setTransform(dpr, 0, 0, dpr, 0, 0);
      const outline = OUTLINE.map(project);
      const lake = LAKE.map(project);
      const gap = Math.max(7, width / 90);
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          if (!inside([x, y], outline) || inside([x, y], lake)) continue;
          // a faint east-to-west emerald → gold drift across the field
          const k = x / width;
          f.fillStyle = k > 0.55 ? "rgba(214, 163, 67, 0.5)" : "rgba(20, 176, 142, 0.55)";
          f.beginPath();
          f.arc(x, y, gap * 0.2, 0, Math.PI * 2);
          f.fill();
        }
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      if (rect.width === width && rect.height === height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mapW = LON1 - LON0;
      const mapH = (LAT1 - LAT0) * 1.22;
      scale = Math.min(width / mapW, height / mapH) * 0.96;
      ox = (width - mapW * scale) / 2;
      // sit the map on the bottom edge; the spare strip up top is headroom
      // for the flight arcs
      oy = height - mapH * scale - 2;
      buildField();
      if (reduceMotion) draw(0);
    }

    function arcPoint(a: [number, number], b: [number, number], t: number): [number, number] {
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.2;
      const u = 1 - t;
      return [u * u * a[0] + 2 * u * t * mx + t * t * b[0], u * u * a[1] + 2 * u * t * my + t * t * b[1]];
    }

    function draw(dt: number) {
      // The map is display:none below lg, so the canvas has no size there.
      if (!width || !height) return;
      ctx!.clearRect(0, 0, width, height);
      if (field) ctx!.drawImage(field, 0, 0, width, height);
      clock += dt;

      // spawn a call roughly every 0.6s
      if (clock >= spawned * 36 && flights.length < 9) {
        const n = spawned++;
        flights.push({
          from: SOURCES[(n * 7) % SOURCES.length],
          hub: (n * 3) % HUBS.length,
          t: 0,
          label: VERTICALS[(n * 5) % VERTICALS.length],
        });
      }

      // hubs
      HUBS.forEach((h) => {
        const [x, y] = project(h.at);
        const g = ctx!.createRadialGradient(x, y, 0, x, y, 16);
        g.addColorStop(0, "rgba(245, 210, 122, 0.45)");
        g.addColorStop(1, "rgba(245, 210, 122, 0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, 16, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = "#F5D27A";
        ctx!.beginPath();
        ctx!.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.font = "600 10px Inter, sans-serif";
        ctx!.fillStyle = "rgba(245, 210, 122, 0.85)";
        ctx!.textAlign = "left";
        ctx!.fillText(h.code, x + 8, y - 6);
      });

      // flights
      flights.forEach((f) => {
        f.t += 0.009 * dt;
        const a = project(f.from);
        const b = project(HUBS[f.hub].at);
        const t = Math.min(1, f.t);

        // origin blip
        if (f.t < 0.25) {
          ctx!.strokeStyle = `rgba(20, 176, 142, ${0.7 * (1 - f.t * 4)})`;
          ctx!.beginPath();
          ctx!.arc(a[0], a[1], 3 + f.t * 40, 0, Math.PI * 2);
          ctx!.stroke();
        }

        if (f.t < 1) {
          const [x, y] = arcPoint(a, b, t);
          const g = ctx!.createRadialGradient(x, y, 0, x, y, 9);
          g.addColorStop(0, "rgba(245, 210, 122, 0.9)");
          g.addColorStop(1, "rgba(245, 210, 122, 0)");
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(x, y, 9, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.fillStyle = "#FFF3C9";
          ctx!.beginPath();
          ctx!.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx!.fill();
          // label mid-flight only, and never on top of a hub's state code
          const nearHub = HUBS.some((h) => {
            const [hx, hy] = project(h.at);
            return Math.hypot(hx - x, hy - y) < 48;
          });
          if (f.t > 0.2 && f.t < 0.75 && !nearHub) {
            ctx!.font = "500 10px Inter, sans-serif";
            ctx!.fillStyle = `rgba(244, 241, 232, ${0.55 * Math.sin(Math.PI * f.t)})`;
            ctx!.textAlign = "center";
            ctx!.fillText(f.label, x, y - 12);
          }
        }
      });

      flights = flights.filter((f) => {
        if (f.t >= 1 && !f.landed) {
          f.landed = true;
          landed.push({ hub: f.hub, age: 0 });
        }
        return f.t < 1.25;
      });

      // landing ripples at the hubs
      for (let i = landed.length - 1; i >= 0; i--) {
        const l = landed[i];
        l.age += dt;
        const k = l.age / 45;
        if (k >= 1) {
          landed.splice(i, 1);
          continue;
        }
        const [x, y] = project(HUBS[l.hub].at);
        ctx!.strokeStyle = `rgba(245, 210, 122, ${0.7 * (1 - k)})`;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.arc(x, y, 4 + k * 26, 0, Math.PI * 2);
        ctx!.stroke();
      }
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

    // A hidden (zero-size) canvas never intersects, so phones don't run the loop.
    const observer = new IntersectionObserver(([entry]) => {
      const was = running;
      running = entry.isIntersecting && !document.hidden && !reduceMotion;
      if (running && !was) start();
    });
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
  }, []);

  return (
    <div className={className}>
      <canvas ref={canvasRef} aria-hidden="true" className="block aspect-[1000/560] w-full" />
      <div className="mt-3 flex items-center gap-4">
        <span className="thread flex-1" />
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-emerald-teal">
          Calls routed coast to coast
        </span>
        <span className="thread flex-1" />
      </div>
    </div>
  );
}
