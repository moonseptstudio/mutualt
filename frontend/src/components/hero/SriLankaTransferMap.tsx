import React, { useEffect, useRef } from 'react';

/**
 * Interactive dotted map of Sri Lanka with animated mutual-transfer arcs.
 * - The island is a fine dot matrix; dots near the cursor light up and part slightly.
 * - Hovering a city highlights its transfers and shows its name; clicking a city starts a swap.
 * - 2-way swaps and 3-way cycles travel along curved arcs between cities.
 */

type LonLat = [number, number];

const OUTLINE: LonLat[] = [
  [80.28, 9.83], [80.12, 9.81], [79.98, 9.80], [79.88, 9.72], [79.95, 9.63], [80.10, 9.58],
  [80.15, 9.50], [80.05, 9.35], [79.95, 9.20], [79.72, 9.08], [79.88, 8.96], [79.93, 8.72], [79.86, 8.42], [79.78, 8.18],
  [79.82, 7.85], [79.84, 7.45], [79.86, 7.05], [79.90, 6.80], [79.98, 6.55], [80.06, 6.25],
  [80.18, 6.05], [80.38, 5.97], [80.58, 5.92], [80.85, 6.02], [81.12, 6.11], [81.38, 6.30],
  [81.62, 6.55], [81.82, 6.85], [81.86, 7.15], [81.78, 7.50], [81.62, 7.85], [81.45, 8.12],
  [81.28, 8.45], [81.15, 8.72], [80.98, 8.98], [80.82, 9.25], [80.62, 9.45], [80.45, 9.58], [80.38, 9.72],
];

const CITIES: { name: string; ll: LonLat }[] = [
  { name: 'Colombo', ll: [79.88, 6.93] },
  { name: 'Kandy', ll: [80.63, 7.29] },
  { name: 'Galle', ll: [80.24, 6.07] },
  { name: 'Jaffna', ll: [80.02, 9.66] },
  { name: 'Trincomalee', ll: [81.18, 8.57] },
  { name: 'Batticaloa', ll: [81.66, 7.72] },
  { name: 'Anuradhapura', ll: [80.40, 8.31] },
  { name: 'Kurunegala', ll: [80.36, 7.49] },
  { name: 'Ratnapura', ll: [80.40, 6.68] },
  { name: 'Matara', ll: [80.54, 5.99] },
  { name: 'Badulla', ll: [81.06, 6.99] },
  { name: 'Hambantota', ll: [81.11, 6.16] },
  { name: 'Polonnaruwa', ll: [81.00, 7.94] },
  { name: 'Vavuniya', ll: [80.50, 8.75] },
  { name: 'Mannar', ll: [79.93, 8.97] },
  { name: 'Puttalam', ll: [79.86, 8.03] },
  { name: 'Ampara', ll: [81.67, 7.30] },
  { name: 'Negombo', ll: [79.87, 7.21] },
  { name: 'Nuwara Eliya', ll: [80.78, 6.97] },
  { name: 'Kilinochchi', ll: [80.40, 9.38] },
  { name: 'Monaragala', ll: [81.35, 6.87] },
  { name: 'Kalutara', ll: [79.99, 6.58] },
];

const LON_MIN = 79.65, LON_MAX = 81.92, LAT_MIN = 5.88, LAT_MAX = 9.88;

// Default swell = south-west monsoon: waves travel from bottom-left toward top-right (screen y points down).
// While the cursor is over the hero, new waves come from the cursor's side instead.
const DEFAULT_WAVE_ANGLE = Math.atan2(-0.866, 0.5);

const PALETTE = [
  { core: '#2563eb', glow: '37, 99, 235' },
  { core: '#0ea5e9', glow: '14, 165, 233' },
  { core: '#6366f1', glow: '99, 102, 241' },
];

interface Dot { x: number; y: number; seed: number; edge: number; } // edge: 1 on the coastline, 0 inland
interface Transfer {
  cities: number[];          // 2 = mutual swap, 3 = three-way cycle
  t: number;                 // travel progress 0..1
  speed: number;
  life: number;              // fades out after arrival
  color: typeof PALETTE[number];
  arrived: boolean;
}

export const SriLankaTransferMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0, height = 0, dpr = 1;
    let scale = 1, originX = 0, originY = 0;
    let dots: Dot[] = [];
    let cityPts: { x: number; y: number }[] = [];
    let islandPath = new Path2D();
    let isMobile = false;
    // Ocean waves: every wave is a set of circular crests expanding from a point out at sea.
    // The parts of a crest that hit the island stop there (their energy breaks as surf); only the
    // parts that miss the island carry on, so nothing re-appears on the far side of a coast that was hit.
    let coast: { x: number; y: number; nx: number; ny: number }[] = [];
    let islandC = { x: 0, y: 0 };
    let waveAngle = DEFAULT_WAVE_ANGLE; // travel direction of new default waves; eases toward the cursor's side
    let contourClip = { top: 0, bottom: 0 };
    const N_ANG = 360; // angular resolution of the island shadow
    interface SeaWave {
      x: number; y: number;   // origin
      t0: number;             // birth time
      speed: number;          // px per frame
      crests: number;
      gap: number;            // px between crests
      strength: number;       // visual energy
      reach: number;          // radius once every crest has passed the island
      hit: Float32Array;      // per angle: distance from the origin to the first coast it hits
      toIsland: number;       // angle from origin toward the island
      fade: number;           // how much the ring fades on the side facing away from the island
      fadeIn: number;         // radius over which a new ring fades in (large = birth point stays invisible)
      foamDecay: number;
    }
    let waves: SeaWave[] = [];
    let wavesReady = false;
    let nextWaveAt = 0;
    let setLeft = 0;
    let kickAngle = DEFAULT_WAVE_ANGLE; // direction of the last cursor-triggered wave
    let lastKick = -10;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // Cast a ray per angle from the origin and record where it first meets the coastline
    const shadowFrom = (ox: number, oy: number) => {
      const hit = new Float32Array(N_ANG);
      const n = coast.length;
      for (let i = 0; i < N_ANG; i++) {
        const a = (i / N_ANG) * Math.PI * 2;
        const dx = Math.cos(a), dy = Math.sin(a);
        let best = 1e9;
        for (let k = 0; k < n; k++) {
          const A = coast[k], B = coast[(k + 1) % n];
          const ex = B.x - A.x, ey = B.y - A.y;
          const den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-9) continue;
          const wx = A.x - ox, wy = A.y - oy;
          const t = (wx * ey - wy * ex) / den;
          const u = (wx * dy - wy * dx) / den;
          if (t > 0 && u >= 0 && u <= 1 && t < best) best = t;
        }
        hit[i] = best;
      }
      return hit;
    };
    // Energy loss as a ring spreads out: full strength once it has faded in, then steadily weaker
    const decay = (wv: SeaWave, rad: number) => Math.exp(-Math.max(0, rad - wv.fadeIn) / (isMobile ? 260 : 520));
    const hitAt = (wv: SeaWave, ang: number) => {
      const idx = ((Math.round((ang / (Math.PI * 2)) * N_ANG) % N_ANG) + N_ANG) % N_ANG;
      return wv.hit[idx];
    };
    const addWave = (ox: number, oy: number, o: { speed: number; crests: number; gap: number; strength: number; fade: number; fadeIn: number; foamDecay: number; progress?: number; lead0?: number }) => {
      let far = 0;
      for (const c of coast) far = Math.max(far, Math.hypot(c.x - ox, c.y - oy));
      const reach = far + 40;
      waves.push({
        x: ox, y: oy,
        t0: time - ((o.lead0 ?? 0) / o.speed + (o.progress ?? 0) * (reach / o.speed)) * 0.016, // speed is px per frame
        speed: o.speed, crests: o.crests, gap: o.gap, strength: o.strength,
        reach, hit: shadowFrom(ox, oy),
        toIsland: Math.atan2(islandC.y - oy, islandC.x - ox),
        fade: o.fade, fadeIn: o.fadeIn, foamDecay: o.foamDecay,
      });
      if (waves.length > 18) waves.shift();
    };
    // A default wave: born far out at sea on the side the swell is coming from
    const onLand = (x: number, y: number) => {
      let inside = false;
      for (let i = 0, j = coast.length - 1; i < coast.length; j = i++) {
        const a = coast[i], b = coast[j];
        if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
      }
      return inside;
    };
    const spawnSwell = (big: boolean, progress = 0, kick?: { angle: number; lead0: number }) => {
      // Cursor over the sea (desktop): the wave is born right next to the cursor
      const cx = mouse.sx - tilt.x, cy = mouse.sy - tilt.y;
      if (mouse.active && !isMobile && !onLand(cx, cy) && Math.hypot(cx - islandC.x, cy - islandC.y) > 80) {
        addWave(cx + rand(-25, 25), cy + rand(-25, 25), {
          speed: rand(1.0, 1.2),
          crests: big ? 2 + Math.floor(Math.random() * 2) : 1,
          gap: rand(11, 17),
          strength: big ? rand(0.7, 1) : rand(0.3, 0.55),
          fade: 0.8,
          fadeIn: 50,
          foamDecay: 10,
        });
        return;
      }
      const ang = kick ? kick.angle + rand(-0.04, 0.04) : waveAngle + rand(-0.14, 0.14);
      const dx = Math.cos(ang), dy = Math.sin(ang);
      const R = isMobile ? rand(240, 320) : rand(500, 650);
      const j = rand(-1, 1) * (kick ? 40 : isMobile ? 90 : 210);
      addWave(islandC.x - dx * R - dy * j, islandC.y - dy * R + dx * j, {
        speed: isMobile ? rand(0.5, 0.62) : rand(0.7, 0.85),
        crests: big ? 2 + Math.floor(Math.random() * 2) : 1,
        gap: rand(11, 17),
        strength: big ? rand(0.7, 1) : rand(0.3, 0.55),
        fade: 0.8,
        fadeIn: isMobile ? 120 : 240,
        foamDecay: 9,
        progress,
        lead0: kick?.lead0,
      });
    };
    // Cursor ripples bend crests they pass through
    const ripples: { x: number; y: number; t: number }[] = [];
    const rippleDisp = (x: number, y: number) => {
      let disp = 0;
      for (const rp of ripples) {
        const age = time - rp.t;
        const dd = Math.hypot(x - rp.x, y - rp.y);
        const band = (dd - age * 140) / 22;
        disp += Math.exp(-band * band) * Math.sin(band * 2.4) * 8 * (1 - age / 2.4);
      }
      return disp;
    };
    let lastRipple = { x: -9999, y: -9999, t: 0 };

    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, active: false };
    const tilt = { x: 0, y: 0 };
    let hovered = -1;
    let hoverAmt = 0;
    let lastHoverSpawn = 0;
    let time = 0;
    let spawnTimer = 0;
    const transfers: Transfer[] = [];

    const project = ([lon, lat]: LonLat) => ({
      x: originX + (lon - LON_MIN) * scale,
      y: originY + (LAT_MAX - lat) * scale,
    });

    const layout = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      isMobile = width < 1024;

      // Fit the island: right column on desktop, above the headline on smaller screens
      let boxX: number, boxY: number, boxW: number, boxH: number;
      if (!isMobile) {
        const containerWidth = Math.min(width - 64, 1280);
        const containerLeft = (width - containerWidth) / 2;
        const colWidth = (containerWidth - 48) / 2;
        boxH = Math.min(height * 0.8, 660);
        boxW = colWidth * 0.85;
        boxX = containerLeft + colWidth + 48 + (colWidth - boxW) / 2;
        boxY = (height - boxH) / 2 + 20;
      } else {
        boxH = width < 640 ? 275 : 300;
        boxW = width - 32;
        boxX = 16;
        boxY = width < 640 ? 76 : 100;
      }
      scale = Math.min(boxW / (LON_MAX - LON_MIN), boxH / (LAT_MAX - LAT_MIN));
      originX = boxX + (boxW - (LON_MAX - LON_MIN) * scale) / 2;
      originY = boxY + (boxH - (LAT_MAX - LAT_MIN) * scale) / 2;

      islandPath = new Path2D();
      OUTLINE.forEach((p, i) => {
        const { x, y } = project(p);
        if (i === 0) islandPath.moveTo(x, y); else islandPath.lineTo(x, y);
      });
      islandPath.closePath();

      // Sample a dot matrix inside the island
      const gap = isMobile ? 5.5 : 7;
      const mapW = (LON_MAX - LON_MIN) * scale;
      const mapH = (LAT_MAX - LAT_MIN) * scale;
      dots = [];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (let y = originY; y <= originY + mapH; y += gap) {
        for (let x = originX; x <= originX + mapW; x += gap) {
          if (ctx.isPointInPath(islandPath, x, y)) dots.push({ x, y, seed: Math.random() * Math.PI * 2, edge: 0 });
        }
      }
      cityPts = CITIES.map(c => project(c.ll));

      // Resample the coastline evenly so contours can be displaced point by point
      const pts = OUTLINE.map(project);
      const segLens = pts.map((p, i) => {
        const q = pts[(i + 1) % pts.length];
        return Math.hypot(q.x - p.x, q.y - p.y);
      });
      const total = segLens.reduce((a, b) => a + b, 0);
      const samples = isMobile ? 140 : 220;
      coast = [];
      let seg = 0, acc = 0;
      for (let k = 0; k < samples; k++) {
        const target = (k / samples) * total;
        while (acc + segLens[seg] < target) { acc += segLens[seg]; seg++; }
        const p = pts[seg], q = pts[(seg + 1) % pts.length];
        const f = segLens[seg] ? (target - acc) / segLens[seg] : 0;
        coast.push({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, nx: 0, ny: 0 });
      }
      // Outward normals (for which side of the coast faces the swell) + projection on the wave axis
      const cx0 = coast.reduce((a, c) => a + c.x, 0) / coast.length;
      const cy0 = coast.reduce((a, c) => a + c.y, 0) / coast.length;
      coast = coast.map((c, k) => {
        const a = coast[(k - 2 + samples) % samples], b = coast[(k + 2) % samples];
        let nx = b.y - a.y, ny = -(b.x - a.x);
        const nl = Math.hypot(nx, ny) || 1;
        nx /= nl; ny /= nl;
        if (nx * (c.x - cx0) + ny * (c.y - cy0) < 0) { nx = -nx; ny = -ny; }
        return { x: c.x, y: c.y, nx, ny };
      });
      islandC = { x: cx0, y: cy0 };
      // Mark the outermost rows of dots so the coastline reads clearly
      const edgeBand = gap * 1.6;
      for (const d of dots) {
        let md = Infinity;
        for (const c of coast) md = Math.min(md, Math.hypot(c.x - d.x, c.y - d.y));
        d.edge = Math.max(0, 1 - md / edgeBand);
      }
      waves = [];
      wavesReady = false;
      // Keep waves out of the nav bar and (on small screens) away from the headline
      contourClip = { top: isMobile ? 72 : 86, bottom: isMobile ? boxY + boxH + 30 : height };
    };

    const spawn = (from?: number) => {
      const n = CITIES.length;
      const a = from ?? Math.floor(Math.random() * n);
      const pick = (exclude: number[]) => {
        let c: number;
        do { c = Math.floor(Math.random() * n); } while (exclude.includes(c));
        return c;
      };
      const b = pick([a]);
      const threeWay = Math.random() < 0.3;
      const cities = threeWay ? [a, b, pick([a, b])] : [a, b];
      transfers.push({
        cities,
        t: 0,
        speed: 0.0045 + Math.random() * 0.002,
        life: 1,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        arrived: false,
      });
      if (transfers.length > 7) transfers.shift();
    };

    // Quadratic arc bent to the left of travel direction, so A→B and B→A never overlap
    const arcPoint = (ax: number, ay: number, bx: number, by: number, t: number) => {
      const dx = bx - ax, dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const bend = Math.min(len * 0.28, 70);
      const cx = (ax + bx) / 2 - (dy / len) * bend;
      const cy = (ay + by) / 2 + (dx / len) * bend;
      const u = 1 - t;
      return { x: u * u * ax + 2 * u * t * cx + t * t * bx, y: u * u * ay + 2 * u * t * cy + t * t * by, cx, cy };
    };

    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (!mouse.active) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
      mouse.active = true;
      if (!isMobile && !reduceMotion) {
        const moved = Math.hypot(mouse.x - lastRipple.x, mouse.y - lastRipple.y);
        if (moved > 40 && time - lastRipple.t > 0.18) {
          lastRipple = { x: mouse.x, y: mouse.y, t: time };
          ripples.push({ x: mouse.x - tilt.x, y: mouse.y - tilt.y, t: time });
          if (ripples.length > 6) ripples.shift();
        }
      }
    };
    const onLeave = () => { mouse.active = false; };
    const onClick = (e: MouseEvent) => {
      if (hovered >= 0) { spawn(hovered); return; }
      if (reduceMotion || (e.target as HTMLElement | null)?.closest('a, button, input, select, textarea')) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left - tilt.x;
      const y = e.clientY - r.top - tilt.y;
      if (onLand(x, y)) return; // clicks on land don't make waves
      addWave(x, y, { speed: 1.55, crests: 3, gap: 13, strength: 1.15, fade: 0.85, fadeIn: 40, foamDecay: 14 });
    };

    let animId = 0;
    let running = false;

    const render = () => {
      time += 0.016;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Smoothed cursor + gentle parallax
      mouse.sx += (mouse.x - mouse.sx) * 0.14;
      mouse.sy += (mouse.y - mouse.sy) * 0.14;
      const tx = mouse.active ? (mouse.x / width - 0.5) * 14 : 0;
      const ty = mouse.active ? (mouse.y / height - 0.5) * 10 : 0;
      tilt.x += (tx - tilt.x) * 0.05;
      tilt.y += (ty - tilt.y) * 0.05;
      ctx.translate(tilt.x, tilt.y);
      const mx = mouse.active ? mouse.sx - tilt.x : -9999;
      const my = mouse.active ? mouse.sy - tilt.y : -9999;

      // Hover detection on cities (desktop only)
      let near = -1, best = isMobile ? 0 : 30;
      if (mouse.active) {
        cityPts.forEach((p, i) => {
          const d = Math.hypot(p.x - mx, p.y - my);
          if (d < best) { best = d; near = i; }
        });
      }
      if (near !== hovered) { hovered = near; hoverAmt = 0; }
      hoverAmt = Math.min(1, hoverAmt + 0.08);
      parent.style.cursor = hovered >= 0 ? 'pointer' : '';
      if (hovered >= 0 && time - lastHoverSpawn > 1.6 && !transfers.some(tr => !tr.arrived && tr.cities.includes(hovered))) {
        spawn(hovered);
        lastHoverSpawn = time;
      }

      // Ocean waves: circular crests roll toward the island and stop where they hit it
      for (let r = ripples.length - 1; r >= 0; r--) if (time - ripples[r].t > 2.4) ripples.splice(r, 1);

      // Default waves come from the cursor's side (south-west monsoon when there is no cursor)
      let targetAngle = DEFAULT_WAVE_ANGLE;
      if (mouse.active && !isMobile) {
        const vx = islandC.x - mx, vy = islandC.y - my;
        if (Math.hypot(vx, vy) > 80) targetAngle = Math.atan2(vy, vx);
      }
      const dAng = Math.atan2(Math.sin(targetAngle - waveAngle), Math.cos(targetAngle - waveAngle));
      waveAngle += dAng * 0.04;

      // Cursor moved to a clearly different side: send a big wave from there right away, with a head
      // start so it is already visible and reaches the coast within a couple of seconds
      if (mouse.active && !isMobile && !reduceMotion && wavesReady && time - lastKick > 1.0) {
        const dKick = Math.atan2(Math.sin(targetAngle - kickAngle), Math.cos(targetAngle - kickAngle));
        if (Math.abs(dKick) > 0.5) {
          kickAngle = targetAngle;
          lastKick = time;
          spawnSwell(true, 0, { angle: targetAngle, lead0: 260 });
          setLeft = 2 + Math.floor(Math.random() * 3); // the rest of this set follows from the same side
          nextWaveAt = time + rand(1.2, 1.8);
        }
      }

      // Sea already in motion on first frame; then sets of bigger waves separated by lulls
      if (!wavesReady && coast.length) {
        for (let i = 0; i < 7; i++) spawnSwell(Math.random() < 0.45, i / 7 + rand(0, 0.08));
        wavesReady = true;
        nextWaveAt = time + rand(0.8, 1.6);
      }
      if (!reduceMotion && time >= nextWaveAt) {
        if (setLeft > 0) {
          spawnSwell(true);
          setLeft--;
          nextWaveAt = time + (setLeft > 0 ? rand(1.3, 2.0) : rand(2.4, 3.4));
        } else {
          spawnSwell(false);
          if (Math.random() < 0.4) setLeft = 3 + Math.floor(Math.random() * 4);
          nextWaveAt = time + rand(1.5, 2.6);
        }
      }
      waves = waves.filter(wv => ((time - wv.t0) / 0.016) * wv.speed - (wv.crests - 1) * wv.gap <= wv.reach + 20);

      ctx.save();
      ctx.beginPath();
      ctx.rect(-50, contourClip.top - tilt.y, width + 100, contourClip.bottom - contourClip.top);
      ctx.clip();
      const sea = new Path2D();
      sea.rect(-100, -100, width + 200, height + 200);
      sea.addPath(islandPath);
      ctx.clip(sea, 'evenodd');

      const BINS = isMobile ? 120 : 200;
      const step = (Math.PI * 2) / BINS;
      ctx.lineCap = 'round';
      for (const wv of waves) {
        const lead = ((time - wv.t0) / 0.016) * wv.speed;
        for (let c = 0; c < wv.crests; c++) {
          const rad = lead - c * wv.gap;
          if (rad <= 2) continue;
          const life = Math.min(1, rad / wv.fadeIn) * Math.max(0, Math.min(1, (wv.reach + 20 - rad) / 140));
          const dec = decay(wv, rad);
          const base = (isMobile ? 0.4 : 0.5) * wv.strength * (1 - c * 0.28) * life * dec;
          if (base < 0.01) continue;
          ctx.lineWidth = (c === 0 ? 1 + 0.8 * wv.strength : 0.8) * (0.55 + 0.45 * dec);
          for (let b = 0; b < BINS; b++) {
            const a0 = b * step, a1 = a0 + step;
            const facing = (Math.cos(a0 + step / 2 - wv.toIsland) + 1) / 2;
            let alpha = base * (1 - wv.fade + wv.fade * facing * facing);
            if (alpha < 0.01) continue;
            // The part of the crest that already hit the island is gone
            const h = Math.min(hitAt(wv, a0), hitAt(wv, a1));
            if (rad >= h) continue;
            alpha *= Math.min(1, (h - rad) / 6);
            // Gentle irregularity, only once a ring is big enough that it doesn't look wobbly
            const wobAmp = 1.3 * wv.strength * Math.min(1, rad / 220);
            const wob0 = Math.sin(a0 * 9 + time * 0.8 + wv.t0) * wobAmp;
            const wob1 = Math.sin(a1 * 9 + time * 0.8 + wv.t0) * wobAmp;
            let x0 = wv.x + Math.cos(a0) * rad, y0 = wv.y + Math.sin(a0) * rad;
            let x1 = wv.x + Math.cos(a1) * rad, y1 = wv.y + Math.sin(a1) * rad;
            const r0 = rad + wob0 + (ripples.length ? rippleDisp(x0, y0) : 0);
            const r1 = rad + wob1 + (ripples.length ? rippleDisp(x1, y1) : 0);
            x0 = wv.x + Math.cos(a0) * r0; y0 = wv.y + Math.sin(a0) * r0;
            x1 = wv.x + Math.cos(a1) * r1; y1 = wv.y + Math.sin(a1) * r1;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Breaking surf: foam where a crest hits the shore, then a weak backwash ripple travels back
      // out to sea. Only coast that a crest actually reaches first can break (not the shadowed side).
      const BACK_RANGE = isMobile ? 45 : 70; // px a reflected ripple travels before it dies out
      ctx.save();
      ctx.lineCap = 'round';
      for (let k = 0; k < coast.length; k++) {
        const c = coast[k], n = coast[(k + 1) % coast.length];
        let strength = 0, u = 0;
        let back = 0, backDist = 0;
        const consider = (since: number, energy: number, foamDecay: number) => {
          const f = Math.exp(-since / foamDecay) * energy;
          if (f > strength) { strength = f; u = since; }
          if (since < BACK_RANGE) {
            // Backwash builds up just after the break, then weakens as it spreads out
            const b = energy * Math.sin(Math.min(1, since / 10) * Math.PI / 2) * (1 - since / BACK_RANGE);
            if (b > back) { back = b; backDist = since; }
          }
        };
        for (const wv of waves) {
          const dx = wv.x - c.x, dy = wv.y - c.y;
          const d = Math.hypot(dx, dy) || 1;
          const after = ((time - wv.t0) / 0.016) * wv.speed - d; // px the lead crest has gone past this point
          if (after < 0 || after > BACK_RANGE + (wv.crests - 1) * wv.gap) continue;
          const ang = Math.atan2(-dy, -dx);
          const da = (Math.PI * 2) / N_ANG;
          const firstHit = Math.max(hitAt(wv, ang - da), hitAt(wv, ang), hitAt(wv, ang + da));
          if (d > firstHit + 6) continue; // this coast is in the island's own shadow
          const face = (c.nx * dx + c.ny * dy) / d;
          const energy = wv.strength * (0.25 + 0.75 * Math.max(0, face)) * decay(wv, d);
          for (let ci = 0; ci < wv.crests; ci++) {
            const sc = after - ci * wv.gap;
            if (sc < 0 || sc > BACK_RANGE) continue;
            consider(sc, energy * (1 - ci * 0.3), wv.foamDecay);
          }
        }

        // Reflected backwash ripple moving away from the shore
        if (back > 0.03) {
          const r = 3 + backDist * 0.6;
          ctx.beginPath();
          ctx.moveTo(c.x + c.nx * r, c.y + c.ny * r);
          ctx.lineTo(n.x + n.nx * r, n.y + n.ny * r);
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.min(0.7, back * 0.75)})`;
          ctx.lineWidth = 0.9 + back * 0.9;
          ctx.stroke();
        }

        if (strength < 0.03) continue;
        const spread = Math.min(u, 14) * 0.35;
        ctx.beginPath();
        ctx.moveTo(c.x + c.nx * spread, c.y + c.ny * spread);
        ctx.lineTo(n.x + n.nx * spread, n.y + n.ny * spread);
        ctx.strokeStyle = `rgba(125, 211, 252, ${Math.min(0.85, strength * 0.9)})`;
        ctx.lineWidth = 1.2 + strength * 2.2;
        ctx.stroke();
      }
      ctx.restore();

      // Island soft glow underlay
      ctx.save();
      ctx.shadowColor = 'rgba(37, 99, 235, 0.26)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = 'rgba(219, 234, 254, 0.6)';
      ctx.fill(islandPath);
      ctx.restore();

      // Dot matrix: cursor spotlight + slow diagonal shimmer
      const spot = isMobile ? 0 : 110;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let x = d.x, y = d.y;
        let a = 0.38 + d.edge * 0.32 + Math.max(0, Math.sin((d.x + d.y) * 0.012 - time * 1.2)) * 0.12 + Math.sin(time * 1.5 + d.seed) * 0.04;
        let r = isMobile ? 1.1 : 1.35;
        if (spot) {
          const dx = d.x - mx, dy = d.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < spot) {
            const f = 1 - dist / spot;
            const ff = f * f;
            a += ff * 0.7;
            r += ff * 1.3;
            const push = (ff * 5) / (dist || 1);
            x += dx * push;
            y += dy * push;
          }
        }
        ctx.fillStyle = `rgba(37, 99, 235, ${Math.min(a, 0.95)})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn ambient transfers
      if (!reduceMotion) {
        spawnTimer += 0.016;
        const active = transfers.filter(t => !t.arrived).length;
        if (spawnTimer > 1.1 && active < (isMobile ? 2 : 4)) { spawn(); spawnTimer = 0; }
      }

      for (let k = transfers.length - 1; k >= 0; k--) {
        const tr = transfers[k];
        if (!tr.arrived) {
          tr.t += reduceMotion ? 1 : tr.speed;
          if (tr.t >= 1) { tr.t = 1; tr.arrived = true; }
        } else {
          tr.life -= reduceMotion ? 0 : 0.012;
          if (tr.life <= 0) { transfers.splice(k, 1); continue; }
        }

        const involvesHover = hovered >= 0 && tr.cities.includes(hovered);
        const dim = hovered >= 0 && !involvesHover ? 0.3 : 1;
        const emph = involvesHover ? 1 + hoverAmt * 0.6 : 1;
        const p = ease(tr.t);
        const glow = tr.color.glow;

        // Each leg: city[s] → city[s+1]; a 2-city swap therefore draws A→B and B→A
        for (let s = 0; s < tr.cities.length; s++) {
          const A = cityPts[tr.cities[s]];
          const B = cityPts[tr.cities[(s + 1) % tr.cities.length]];

          // Faint full track
          const ctl = arcPoint(A.x, A.y, B.x, B.y, 0.5);
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.quadraticCurveTo(ctl.cx, ctl.cy, B.x, B.y);
          ctx.strokeStyle = `rgba(${glow}, ${0.12 * tr.life * dim * emph})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Drawn trail up to the head
          const steps = 28;
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const q = arcPoint(A.x, A.y, B.x, B.y, (i / steps) * p);
            if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          }
          ctx.strokeStyle = `rgba(${glow}, ${Math.min(1, 0.55 * tr.life * dim * emph)})`;
          ctx.lineWidth = 1.6 * emph;
          ctx.lineCap = 'round';
          ctx.stroke();

          if (!tr.arrived) {
            // Comet head
            const h = arcPoint(A.x, A.y, B.x, B.y, p);
            const hr = (isMobile ? 2.2 : 2.8) * emph;
            const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, hr * 4);
            g.addColorStop(0, `rgba(${glow}, ${0.55 * dim})`);
            g.addColorStop(1, `rgba(${glow}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(h.x, h.y, hr * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = dim;
            ctx.fillStyle = tr.color.core;
            ctx.beginPath();
            ctx.arc(h.x, h.y, hr, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(h.x, h.y, hr * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          } else {
            // Arrival ripple at destination
            const rip = 1 - tr.life;
            ctx.beginPath();
            ctx.arc(B.x, B.y, 4 + rip * 18, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(16, 185, 129, ${tr.life * 0.7 * dim})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // City nodes
      cityPts.forEach((c, i) => {
        const isHover = i === hovered;
        const busy = transfers.some(tr => tr.cities.includes(i));
        const pulse = (Math.sin(time * 2 + i) + 1) / 2;
        const base = isMobile ? 2.2 : 2.8;
        const r = base + (busy ? 0.6 : 0) + (isHover ? hoverAmt * 2 : 0);

        if (busy || isHover) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, r + 4 + pulse * 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(37, 99, 235, ${0.28 - pulse * 0.16})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(c.x, c.y, r + 1.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(37, 99, 235, 0.35)';
        ctx.shadowBlur = isHover ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? '#1d4ed8' : busy ? '#2563eb' : '#60a5fa';
        ctx.fill();
      });

      // Hover label
      if (hovered >= 0) {
        const c = cityPts[hovered];
        const label = CITIES[hovered].name;
        ctx.font = '600 12px Poppins, ui-sans-serif, system-ui, sans-serif';
        const tw = ctx.measureText(label).width;
        const lx = c.x + 12, ly = c.y - 28;
        ctx.globalAlpha = hoverAmt;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(lx, ly, tw + 18, 24, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillText(label, lx + 9, ly + 16);
        ctx.globalAlpha = 1;
      }

      if (running) animId = requestAnimationFrame(render);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      animId = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animId);
    };

    layout();
    if (reduceMotion) {
      // Static frame: a few completed transfers
      spawn(0); spawn(3); spawn(4);
      render();
    }

    const onResize = () => { layout(); if (reduceMotion) render(); };
    window.addEventListener('resize', onResize);
    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    parent.addEventListener('click', onClick);

    // Pause when the hero is off-screen or the tab is hidden
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    });
    io.observe(parent);
    const onVis = () => (document.hidden || !visible ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      io.disconnect();
      parent.style.cursor = '';
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseleave', onLeave);
      parent.removeEventListener('click', onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" aria-hidden="true" />;
};

export default SriLankaTransferMap;
