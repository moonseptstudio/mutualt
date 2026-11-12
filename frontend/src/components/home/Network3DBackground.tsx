import React, { useEffect, useRef } from 'react';
import logoImg from '../../assets/logos/logo.jpg';

interface Station {
  id: number;
  type: 'hospital' | 'school' | 'ministry' | 'clinic' | 'secretariat' | 'college' | 'service';
  angle: number;
  glowColor: string;
  themeColor: string;
  driftSpeed: number;
  phaseX: number;
  phaseY: number;
  clickPop?: number;
}

interface StationScreenInfo {
  id: number;
  screenX: number;
  screenY: number;
  radius: number;
  themeColor: string;
}

interface ActiveTransfer {
  id: number;
  avatarIndex: number;
  roleType: 'doctor' | 'nurse' | 'teacher';
  glowColor: string;
  originStation: number;
  destStation: number;
  phase: 'SPAWN' | 'INBOUND' | 'AT_HUB' | 'OUTBOUND' | 'ARRIVED';
  progress: number;
  speed: number;
  opacity: number;
  hubWait: number;
  arrivalTimer: number;
  arrivalPulse: number;
}

interface AmbientNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseAlpha: number;
}

export const Network3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // ── 1. Load Official Logo ──
    const logoImage = new Image();
    let logoLoaded = false;
    logoImage.onload = () => {
      logoLoaded = true;
    };
    logoImage.src = logoImg;

    // ── 2. Pre-render 6 Stylized Professional Avatars (Doctors, Nurses, Teachers) ──
    const avatarCanvases: HTMLCanvasElement[] = [];
    const professions = [
      { type: 'doctor' as const, bg1: '#0284c7', bg2: '#0369a1', skin: '#fed7aa', hair: '#1f2937', glow: 'rgba(2, 132, 199, 0.45)' },
      { type: 'nurse' as const, bg1: '#0ea5e9', bg2: '#0284c7', skin: '#fef08a', hair: '#78350f', glow: 'rgba(14, 165, 233, 0.45)' },
      { type: 'teacher' as const, bg1: '#3b82f6', bg2: '#1d4ed8', skin: '#fcd34d', hair: '#451a03', glow: 'rgba(59, 130, 246, 0.45)' },
      { type: 'doctor' as const, bg1: '#2563eb', bg2: '#1d4ed8', skin: '#fed7aa', hair: '#374151', glow: 'rgba(37, 99, 235, 0.45)' },
      { type: 'nurse' as const, bg1: '#1d4ed8', bg2: '#1e3a8a', skin: '#ffedd5', hair: '#111827', glow: 'rgba(29, 78, 216, 0.45)' },
      { type: 'teacher' as const, bg1: '#0284c7', bg2: '#1d4ed8', skin: '#fde68a', hair: '#92400e', glow: 'rgba(2, 132, 199, 0.45)' },
    ];

    const createAvatars = () => {
      avatarCanvases.length = 0;
      const size = 120;

      for (let k = 0; k < professions.length; k++) {
        const prof = professions[k];
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d');
        if (!octx) continue;

        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 3;

        octx.save();
        octx.beginPath();
        octx.arc(cx, cy, r, 0, Math.PI * 2);
        octx.clip();

        // Background Gradient
        const bgGrad = octx.createLinearGradient(0, 0, 0, size);
        bgGrad.addColorStop(0, prof.bg1);
        bgGrad.addColorStop(1, prof.bg2);
        octx.fillStyle = bgGrad;
        octx.fillRect(0, 0, size, size);

        // Head Aura
        const aura = octx.createRadialGradient(cx, cy - 6, 8, cx, cy - 6, 42);
        aura.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        octx.fillStyle = aura;
        octx.beginPath();
        octx.arc(cx, cy - 6, 42, 0, Math.PI * 2);
        octx.fill();

        // Uniform body
        octx.fillStyle = prof.type === 'doctor' ? '#ffffff' : (prof.type === 'nurse' ? '#0d9488' : '#1e3a8a');
        octx.beginPath();
        octx.ellipse(cx, size + 8, 36, 40, 0, 0, Math.PI * 2);
        octx.fill();

        // Neck
        octx.fillStyle = prof.skin;
        octx.fillRect(cx - 9, cy + 9, 18, 16);

        // Head
        octx.beginPath();
        octx.arc(cx, cy - 3, 24, 0, Math.PI * 2);
        octx.fill();

        // Hair
        octx.fillStyle = prof.hair;
        octx.beginPath();
        octx.arc(cx, cy - 10, 26, Math.PI, 2 * Math.PI);
        octx.lineTo(cx + 26, cy + 4);
        octx.lineTo(cx + 20, cy - 6);
        octx.lineTo(cx - 20, cy - 6);
        octx.lineTo(cx - 26, cy + 4);
        octx.closePath();
        octx.fill();

        // Eyes
        octx.fillStyle = '#1e293b';
        octx.beginPath();
        octx.arc(cx - 8, cy - 3, 2.6, 0, Math.PI * 2);
        octx.arc(cx + 8, cy - 3, 2.6, 0, Math.PI * 2);
        octx.fill();

        // Smile
        octx.strokeStyle = '#7c2d12';
        octx.lineWidth = 1.8;
        octx.beginPath();
        octx.arc(cx, cy + 4, 6, 0.15 * Math.PI, 0.85 * Math.PI);
        octx.stroke();

        // Glint highlight
        const glint = octx.createLinearGradient(0, 0, 0, size * 0.5);
        glint.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        glint.addColorStop(1, 'rgba(255, 255, 255, 0)');
        octx.fillStyle = glint;
        octx.beginPath();
        octx.ellipse(cx, 22, 38, 18, 0, 0, Math.PI * 2);
        octx.fill();

        octx.restore();

        // Pod Rim
        octx.beginPath();
        octx.arc(cx, cy, r, 0, Math.PI * 2);
        octx.lineWidth = 3;
        octx.strokeStyle = '#ffffff';
        octx.stroke();

        avatarCanvases.push(off);
      }
    };

    createAvatars();

    // ── 3. Ambient 2D Floating Mesh (Identical to About Us Page) ──
    const ambientColors = [
      'rgba(37, 99, 235,',
      'rgba(59, 130, 246,',
      'rgba(14, 165, 233,',
      'rgba(99, 102, 241,',
    ];

    const ambientNodes: AmbientNode[] = [];
    const ambientCount = 32;

    const initAmbientNodes = (w: number, h: number) => {
      ambientNodes.length = 0;
      for (let i = 0; i < ambientCount; i++) {
        ambientNodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.40,
          vy: (Math.random() - 0.5) * 0.40,
          radius: 1.6 + Math.random() * 1.8,
          color: ambientColors[Math.floor(Math.random() * ambientColors.length)],
          baseAlpha: 0.18 + Math.random() * 0.22,
        });
      }
    };

    // ── 4. 7 Public Sector Workplace Stations in 3D Space ──
    const stations: Station[] = [
      { id: 0, type: 'hospital',    angle: (0 * 2 * Math.PI) / 7, glowColor: 'rgba(37, 99, 235, 0.28)',  themeColor: '#2563eb', driftSpeed: 0.65, phaseX: 0.2, phaseY: 1.5 },
      { id: 1, type: 'school',      angle: (1 * 2 * Math.PI) / 7, glowColor: 'rgba(59, 130, 246, 0.28)',  themeColor: '#3b82f6', driftSpeed: 0.58, phaseX: 2.1, phaseY: 0.8 },
      { id: 2, type: 'ministry',    angle: (2 * 2 * Math.PI) / 7, glowColor: 'rgba(2, 132, 199, 0.28)',   themeColor: '#0284c7', driftSpeed: 0.62, phaseX: 4.0, phaseY: 3.2 },
      { id: 3, type: 'clinic',      angle: (3 * 2 * Math.PI) / 7, glowColor: 'rgba(14, 165, 233, 0.28)',  themeColor: '#0ea5e9', driftSpeed: 0.60, phaseX: 1.8, phaseY: 4.1 },
      { id: 4, type: 'secretariat', angle: (4 * 2 * Math.PI) / 7, glowColor: 'rgba(30, 58, 138, 0.26)',  themeColor: '#1e40af', driftSpeed: 0.55, phaseX: 1.1, phaseY: 4.8 },
      { id: 5, type: 'college',     angle: (5 * 2 * Math.PI) / 7, glowColor: 'rgba(79, 70, 229, 0.26)',  themeColor: '#4f46e5', driftSpeed: 0.62, phaseX: 3.4, phaseY: 1.9 },
      { id: 6, type: 'service',     angle: (6 * 2 * Math.PI) / 7, glowColor: 'rgba(37, 99, 235, 0.28)',  themeColor: '#2563eb', driftSpeed: 0.68, phaseX: 5.3, phaseY: 2.4 },
    ];

    // Traveling photons on the 7 3D spokes
    const spokePhotons = [
      { progress: 0.10, speed: 0.0014 },
      { progress: 0.45, speed: 0.0016 },
      { progress: 0.80, speed: 0.0013 },
      { progress: 0.30, speed: 0.0015 },
      { progress: 0.65, speed: 0.0014 },
      { progress: 0.18, speed: 0.0016 },
      { progress: 0.55, speed: 0.0012 },
    ];

    // ── 5. Active Transfers (Gentle, Slow Glide in 3D) ──
    const activeTransfers: ActiveTransfer[] = [
      {
        id: 1,
        avatarIndex: 0,
        roleType: 'doctor',
        glowColor: professions[0].glow,
        originStation: 0,
        destStation: 3,
        phase: 'INBOUND',
        progress: 0.35,
        speed: 0.0014,
        opacity: 1.0,
        hubWait: 0,
        arrivalTimer: 0,
        arrivalPulse: 0,
      },
      {
        id: 2,
        avatarIndex: 1,
        roleType: 'nurse',
        glowColor: professions[1].glow,
        originStation: 2,
        destStation: 4,
        phase: 'OUTBOUND',
        progress: 0.65,
        speed: 0.0015,
        opacity: 1.0,
        hubWait: 0,
        arrivalTimer: 0,
        arrivalPulse: 0,
      },
    ];

    let nextAvatarIdx = 2;
    let spawnTimer = 0;

    // ── 6. Interactive Click-to-Launch Station Transfers ──
    let latestStationCoords: StationScreenInfo[] = [];
    let latestHubCoord = { screenX: 0, screenY: 0, radius: 45 };
    const destinationCounters: number[] = [0, 0, 0, 0, 0, 0, 0];

    const triggerStationTransfer = (stationId: number) => {
      // Cycle through other 6 stations so multiple clicks naturally distribute across network
      const otherStations = [0, 1, 2, 3, 4, 5, 6].filter((s) => s !== stationId);
      const dest = otherStations[destinationCounters[stationId] % otherStations.length];
      destinationCounters[stationId]++;

      const aIdx = nextAvatarIdx % professions.length;
      nextAvatarIdx++;
      const prof = professions[aIdx];

      // Responsive, fluid transfer speed
      const speed = 0.0022 + Math.random() * 0.0004;

      activeTransfers.push({
        id: Math.random(),
        avatarIndex: aIdx,
        roleType: prof.type,
        glowColor: prof.glow,
        originStation: stationId,
        destStation: dest,
        phase: 'INBOUND',
        progress: 0.0,
        speed,
        opacity: 1.0,
        hubWait: 22,
        arrivalTimer: 0,
        arrivalPulse: 0,
      });

      // Keep array bounded under rapid continuous clicking
      if (activeTransfers.length > 30) {
        activeTransfers.shift();
      }

      // Gentle tactile spring bounce on clicked station
      if (stations[stationId]) {
        stations[stationId].clickPop = 0.25;
      }
    };

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      if (!canvas) return;

      // Prevent interfering with actual buttons, links, or form controls
      const target = e.target as HTMLElement | null;
      if (target && target.closest('a, button, input, textarea, select, [role="button"]')) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 1. Check if clicking central hub
      const hubDist = Math.hypot(clickX - latestHubCoord.screenX, clickY - latestHubCoord.screenY);
      if (hubDist <= latestHubCoord.radius + 12) {
        const randomOrigin = Math.floor(Math.random() * 7);
        triggerStationTransfer(randomOrigin);
        return;
      }

      // 2. Find closest station within generous hit radius (supports rapid/continuous clicks)
      let closestSt: StationScreenInfo | null = null;
      let minDist = Infinity;

      for (let i = 0; i < latestStationCoords.length; i++) {
        const st = latestStationCoords[i];
        const dist = Math.hypot(clickX - st.screenX, clickY - st.screenY);
        const hitRadius = Math.max(40, st.radius * 2.2);
        if (dist <= hitRadius && dist < minDist) {
          minDist = dist;
          closestSt = st;
        }
      }

      if (closestSt) {
        triggerStationTransfer(closestSt.id);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    // ── 7. Interactive Mouse Tracking & 3D Tilt Orbit ──
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let rawMouseX = -9999;
    let rawMouseY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      rawMouseX = e.clientX - rect.left;
      rawMouseY = e.clientY - rect.top;
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
      rawMouseX = -9999;
      rawMouseY = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      if (ambientNodes.length === 0) {
        initAmbientNodes(width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let time = 0;

    // ── 7. Render Loop with Bulletproof Safety ──
    const render = () => {
      try {
        time += 0.009; // Calm time step
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse interpolation for 3D camera gyro tilt
        mouseX += (targetMouseX - mouseX) * 0.045;
        mouseY += (targetMouseY - mouseY) * 0.045;

        const isMobile = width < 768;

        // Layout geometry: Keeps constellation anchored in the showcase area
        const containerWidth = Math.min(width - 64, 1280);
        const containerLeft = (width - containerWidth) / 2;
        const colWidth = (containerWidth - 48) / 2;

        // Central Hub Screen Position
        const hubBaseX = isMobile
          ? width * 0.5
          : containerLeft + colWidth + colWidth * 0.52;
        const hubBaseY = isMobile
          ? Math.max(190, Math.min(height * 0.26, 220))
          : height * 0.47;
        const hubRadius = isMobile ? 26 : 45;
        const safeHubR = Math.max(5, hubRadius);

        // Majestic ocean sway of the central hub
        const hubFloatX = Math.sin(time * 0.45) * 6;
        const hubFloatY = Math.cos(time * 0.40) * 5;
        const hubX = hubBaseX + hubFloatX;
        const hubY = hubBaseY + hubFloatY;

        // ── 3D CAMERA ORIENTATION & ELEVATED ISOMETRIC PITCH ANGLE ──
        // Continuous calm 3D revolution around Y-axis (orbital spin)
        const baseOrbitalRotation = time * 0.24;
        // Elevated perspective tilt angled gracefully from above (~42 degrees pitch)
        const baseTiltX = isMobile ? 0.60 : 0.72;
        // Mouse interaction tilts the entire 3D space with spring-damped parallax
        const rotX = baseTiltX + mouseY * 0.24;
        const rotY = baseOrbitalRotation + mouseX * 0.35;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        // Bulletproof 3D Perspective Projection Function (Never produces NaN or negative scales)
        const fov = 650;
        const project3D = (px: number, py: number, pz: number) => {
          const x1 = px * cosY - pz * sinY;
          const z1 = px * sinY + pz * cosY;

          const y2 = py * cosX - z1 * sinX;
          const z2 = py * sinX + z1 * cosX;

          const denom = Math.max(80, fov + z2);
          const scale = Math.max(0.35, Math.min(2.2, fov / denom));
          const screenX = hubX + x1 * scale;
          const screenY = hubY + y2 * scale;

          return {
            screenX,
            screenY,
            scale,
            depthZ: z2,
            alpha: Math.min(1.0, Math.max(0.35, (scale - 0.45) * 1.4)),
          };
        };

        // ── Layer A: Ambient 2D Floating Mesh (Background Atmosphere, Zero 3D distortion) ──
        for (let i = 0; i < ambientNodes.length; i++) {
          const node = ambientNodes[i];
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;

          // Mouse fluid repulsion
          if (rawMouseX > 0 && rawMouseY > 0) {
            const mdx = rawMouseX - node.x;
            const mdy = rawMouseY - node.y;
            const mDist = Math.hypot(mdx, mdy);
            if (mDist < 130 && mDist > 0) {
              node.x -= (mdx / mDist) * 0.4;
              node.y -= (mdy / mDist) * 0.4;
            }
          }

          // Draw connections between close ambient particles
          for (let j = i + 1; j < ambientNodes.length; j++) {
            const other = ambientNodes[j];
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 115) {
              const lineAlpha = (1 - dist / 115) * 0.12;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(0.5, node.radius), 0, Math.PI * 2);
          ctx.fillStyle = `${node.color} ${node.baseAlpha})`;
          ctx.fill();
        }

        // ── Layer B: Calculate 3D Station Coordinates ──
        const orbitR = isMobile ? 135 : 265;

        const station3DCoords = stations.map((st) => {
          const theta = st.angle;
          const rawX = Math.cos(theta) * orbitR;
          const rawZ = Math.sin(theta) * orbitR;
          // 3D elevation saddle wave: gives realistic celestial curvature
          const rawY = Math.sin(theta * 2) * (isMobile ? 22 : 44);

          // Organic 3D harmonic wander
          const wanderX = Math.sin(time * st.driftSpeed + st.phaseX) * 18;
          const wanderY = Math.cos(time * 0.45 + st.phaseY) * 14;
          const wanderZ = Math.sin(time * 0.35 + st.phaseY) * 18;

          const ptX = rawX + wanderX;
          const ptY = rawY + wanderY;
          const ptZ = rawZ + wanderZ;

          const proj = project3D(ptX, ptY, ptZ);

          // Mouse proximity interaction on screen
          const distToMouse = Math.hypot(rawMouseX - proj.screenX, rawMouseY - proj.screenY);
          let hoverFactor = 0;
          if (distToMouse < 140) {
            hoverFactor = 1 - distToMouse / 140;
          }

          // Smoothly decay click pop bounce
          if (st.clickPop && st.clickPop > 0.01) {
            st.clickPop *= 0.86;
          } else {
            st.clickPop = 0;
          }

          const baseRadius = Math.max(3, (isMobile ? 9.5 : 16.5) * proj.scale * (1 + hoverFactor * 0.15 + (st.clickPop || 0)));

          // Quadratic Bezier 3D Midpoint for spokes (Hub <-> Station)
          const midX = ptX * 0.52 - ptZ * 0.15;
          const midY = ptY * 0.50 + Math.sin(theta) * 18;
          const midZ = ptZ * 0.52 + ptX * 0.15;
          const ctrlProj = project3D(midX, midY, midZ);

          return {
            ...st,
            ptX,
            ptY,
            ptZ,
            midX,
            midY,
            midZ,
            screenX: proj.screenX,
            screenY: proj.screenY,
            scale: proj.scale,
            depthZ: proj.depthZ,
            alpha: proj.alpha,
            radius: baseRadius,
            hoverFactor,
            ctrlProj,
          };
        });

        // Update latest screen coordinates for click hit testing
        latestStationCoords = station3DCoords.map((s) => ({
          id: s.id,
          screenX: s.screenX,
          screenY: s.screenY,
          radius: s.radius,
          themeColor: s.themeColor,
        }));
        latestHubCoord = {
          screenX: hubX,
          screenY: hubY,
          radius: safeHubR,
        };

        // Interactive Cursor Affordance: pointer if hovering any station or central hub
        const isHoverHub = Math.hypot(rawMouseX - hubX, rawMouseY - hubY) <= safeHubR + 10;
        const isHoverStation = latestStationCoords.some((s) => {
          return Math.hypot(rawMouseX - s.screenX, rawMouseY - s.screenY) <= Math.max(38, s.radius * 2.0);
        });

        if (isHoverStation || isHoverHub) {
          if (canvas.style.cursor !== 'pointer') {
            canvas.style.cursor = 'pointer';
            document.body.style.cursor = 'pointer';
          }
        } else {
          if (canvas.style.cursor === 'pointer') {
            canvas.style.cursor = 'default';
            document.body.style.cursor = '';
          }
        }

        // ── Layer C: 3D Inter-Station Constellation Web Lines ──
        for (let i = 0; i < 7; i++) {
          for (let j = i + 1; j < 7; j++) {
            const stA = station3DCoords[i];
            const stB = station3DCoords[j];
            const dx = stB.ptX - stA.ptX;
            const dy = stB.ptY - stA.ptY;
            const dz = stB.ptZ - stA.ptZ;
            const dist3D = Math.hypot(dx, dy, dz);

            const maxDist = isMobile ? 190 : 350;
            if (dist3D < maxDist) {
              const lineAlpha = (1 - dist3D / maxDist) * 0.22 * Math.min(stA.alpha, stB.alpha);
              ctx.beginPath();
              ctx.moveTo(stA.screenX, stA.screenY);
              ctx.lineTo(stB.screenX, stB.screenY);
              ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`;
              ctx.lineWidth = 1.0;
              ctx.stroke();
            }
          }
        }

        // ── Layer D: 3D Curved Spokes (Hub <-> Stations) ──
        for (let i = 0; i < 7; i++) {
          const st = station3DCoords[i];
          const ctrl = st.ctrlProj;

          ctx.save();
          // Base curved glow spoke
          ctx.beginPath();
          ctx.moveTo(hubX, hubY);
          ctx.quadraticCurveTo(ctrl.screenX, ctrl.screenY, st.screenX, st.screenY);
          ctx.strokeStyle = `rgba(147, 197, 253, ${0.18 * st.alpha})`;
          ctx.lineWidth = isMobile ? 1.2 : 1.8;
          ctx.stroke();

          // Gradient overlay spoke
          const spokeGrad = ctx.createLinearGradient(hubX, hubY, st.screenX, st.screenY);
          spokeGrad.addColorStop(0, `rgba(59, 130, 246, ${0.35 * st.alpha})`);
          spokeGrad.addColorStop(0.5, `rgba(99, 102, 241, ${0.22 * st.alpha})`);
          spokeGrad.addColorStop(1, `rgba(14, 165, 233, ${0.30 * st.alpha})`);

          ctx.beginPath();
          ctx.moveTo(hubX, hubY);
          ctx.quadraticCurveTo(ctrl.screenX, ctrl.screenY, st.screenX, st.screenY);
          ctx.strokeStyle = spokeGrad;
          ctx.lineWidth = Math.max(0.6, (isMobile ? 1.4 : 2.2) * st.scale);
          ctx.stroke();
          ctx.restore();

          // 3D Traveling Photon along the curved spoke
          const photon = spokePhotons[i];
          photon.progress += photon.speed;
          if (photon.progress > 1) photon.progress = 0;

          const u = photon.progress;
          const invU = 1 - u;
          const phX = invU * invU * 0 + 2 * invU * u * st.midX + u * u * st.ptX;
          const phY = invU * invU * 0 + 2 * invU * u * st.midY + u * u * st.ptY;
          const phZ = invU * invU * 0 + 2 * invU * u * st.midZ + u * u * st.ptZ;
          const phProj = project3D(phX, phY, phZ);

          ctx.save();
          ctx.beginPath();
          ctx.arc(phProj.screenX, phProj.screenY, Math.max(0.5, (isMobile ? 4.5 : 6.0) * phProj.scale), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${0.35 * phProj.alpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(phProj.screenX, phProj.screenY, Math.max(0.5, (isMobile ? 2.2 : 3.0) * phProj.scale), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }

        // ── Layer E: Render 3D Station Nodes with Depth-Sorting ──
        const renderStationNode = (st: typeof station3DCoords[0]) => {
          const sr = Math.max(3, st.radius);
          ctx.save();
          ctx.globalAlpha = Math.min(1.0, Math.max(0.1, st.alpha));

          // 1. Soft 3D Ground/Atmosphere Shadow
          const shadowGrad = ctx.createRadialGradient(st.screenX, st.screenY + sr * 0.4, 1, st.screenX, st.screenY + sr * 0.4, Math.max(2, sr * 1.8));
          shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.14)');
          shadowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.beginPath();
          ctx.ellipse(st.screenX, st.screenY + sr * 0.4, Math.max(1, sr * 1.8), Math.max(1, sr * 0.65), 0, 0, Math.PI * 2);
          ctx.fillStyle = shadowGrad;
          ctx.fill();

          // 2. Ambient Theme Aura (Breathing)
          const auraBreath = 1 + 0.14 * Math.sin(time * 2.2 + st.phaseX);
          const auraRadius = Math.max(3, sr * 3.2 * auraBreath);
          const auraGrad = ctx.createRadialGradient(st.screenX, st.screenY, Math.max(1, sr * 0.3), st.screenX, st.screenY, auraRadius);
          auraGrad.addColorStop(0, st.glowColor);
          auraGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
          auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.beginPath();
          ctx.arc(st.screenX, st.screenY, auraRadius, 0, Math.PI * 2);
          ctx.fillStyle = auraGrad;
          ctx.fill();

          // 3. Dual Concentric Sonar Waves (Signal Broadcasting)
          for (let w = 0; w < 2; w++) {
            const waveProg = ((time * 0.32 + (st.id * 0.14) + w * 0.5) % 1);
            const waveRadius = Math.max(2, sr + waveProg * (sr * 2.8));
            const waveAlpha = Math.max(0, (1 - waveProg) * 0.36 * st.alpha);
            ctx.beginPath();
            ctx.arc(st.screenX, st.screenY, waveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59, 130, 246, ${waveAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // 4. 3D Tilted Orbital Gyro Ring & Micro-Satellite
          const orbitRx = Math.max(2, sr * 2.1);
          const orbitRy = Math.max(1, sr * 1.05);
          const tiltAngle = (st.id * Math.PI) / 3.5;

          ctx.save();
          ctx.translate(st.screenX, st.screenY);
          ctx.rotate(tiltAngle);

          ctx.beginPath();
          ctx.ellipse(0, 0, orbitRx, orbitRy, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(147, 197, 253, ${0.28 * st.alpha})`;
          ctx.lineWidth = 1.0;
          ctx.setLineDash([2, 4]);
          ctx.stroke();

          // Orbiting Micro-Satellite Photon
          const orbitSpeed = 1.6 + st.driftSpeed * 0.5;
          const orbitT = time * orbitSpeed + st.phaseY;
          const satX = Math.cos(orbitT) * orbitRx;
          const satY = Math.sin(orbitT) * orbitRy;

          ctx.beginPath();
          ctx.arc(satX, satY, Math.max(0.5, 2.8 * st.scale), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${0.40 * st.alpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(satX, satY, Math.max(0.5, 1.5 * st.scale), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();

          // 5. Solid Elevated Base Node Disc
          ctx.beginPath();
          ctx.arc(st.screenX, st.screenY, sr, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(37, 99, 235, 0.20)';
          ctx.shadowBlur = Math.max(1, 10 * st.scale);
          ctx.shadowOffsetY = Math.max(0.5, 2 * st.scale);
          ctx.fill();

          // Outer Glass Border in Theme Color
          ctx.beginPath();
          ctx.arc(st.screenX, st.screenY, sr, 0, Math.PI * 2);
          ctx.strokeStyle = st.themeColor;
          ctx.lineWidth = Math.max(0.5, 1.8 * st.scale);
          ctx.stroke();

          // 6. Radiant Inner Pulsing Core Bead
          const corePulse = 0.48 + 0.10 * Math.sin(time * 2.5 + st.phaseX);
          const coreRadius = Math.max(1, sr * corePulse);
          const coreGrad = ctx.createRadialGradient(st.screenX, st.screenY, 0, st.screenX, st.screenY, coreRadius);
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.5, st.themeColor);
          coreGrad.addColorStop(1, st.themeColor);

          ctx.beginPath();
          ctx.arc(st.screenX, st.screenY, coreRadius, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad;
          ctx.shadowColor = st.themeColor;
          ctx.shadowBlur = Math.max(1, 8 * st.scale);
          ctx.fill();

          // 7. Top Specular Glint Highlight
          const glint = ctx.createLinearGradient(st.screenX, st.screenY - sr, st.screenX, st.screenY);
          glint.addColorStop(0, 'rgba(255, 255, 255, 0.90)');
          glint.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glint;
          ctx.beginPath();
          ctx.ellipse(st.screenX, st.screenY - sr * 0.35, Math.max(1, sr * 0.70), Math.max(0.5, sr * 0.35), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        };

        // Separate stations into Back (depthZ > 0) and Front (depthZ <= 0)
        const backStations = station3DCoords.filter((s) => s.depthZ > 0).sort((a, b) => b.depthZ - a.depthZ);
        const frontStations = station3DCoords.filter((s) => s.depthZ <= 0).sort((a, b) => a.depthZ - b.depthZ);

        // Render Stations in the Back (behind the central hub)
        backStations.forEach(renderStationNode);

        // ── Layer F: Traveling Public Servants (Doctor, Nurse, Teacher) in 3D ──
        // Rendered BEFORE the Central Hub so avatars glide cleanly UNDERNEATH the Mutual logo!
        spawnTimer++;
        const maxTransfers = isMobile ? 1 : 2;

        if (activeTransfers.length < maxTransfers && spawnTimer > 180) {
          const occupiedInbound = new Set(activeTransfers.map((t) => t.originStation));
          const freeOrigins: number[] = [];
          for (let s = 0; s < 7; s++) {
            if (!occupiedInbound.has(s)) freeOrigins.push(s);
          }

          if (freeOrigins.length > 0) {
            const origin = freeOrigins[Math.floor(Math.random() * freeOrigins.length)];
            const freeDests: number[] = [];
            for (let d = 0; d < 7; d++) {
              if (d !== origin) freeDests.push(d);
            }

            if (freeDests.length > 0) {
              const dest = freeDests[Math.floor(Math.random() * freeDests.length)];
              const aIdx = nextAvatarIdx % professions.length;
              nextAvatarIdx++;
              const prof = professions[aIdx];

              activeTransfers.push({
                id: Math.random(),
                avatarIndex: aIdx,
                roleType: prof.type,
                glowColor: prof.glow,
                originStation: origin,
                destStation: dest,
                phase: 'SPAWN',
                progress: 0.0,
                speed: 0.0012 + Math.random() * 0.0003,
                opacity: 0.0,
                hubWait: 0,
                arrivalTimer: 0,
                arrivalPulse: 0,
              });
              spawnTimer = 0;
            }
          }
        }

        for (let i = activeTransfers.length - 1; i >= 0; i--) {
          const tr = activeTransfers[i];

          if (tr.phase === 'SPAWN') {
            tr.opacity += 0.025;
            if (tr.opacity >= 1.0) {
              tr.opacity = 1.0;
              tr.phase = 'INBOUND';
              tr.progress = 0.0;
            }
          } else if (tr.phase === 'INBOUND') {
            tr.progress += tr.speed;
            if (tr.progress >= 1.0) {
              tr.progress = 1.0;
              tr.phase = 'AT_HUB';
              tr.hubWait = 45; // Peaceful pause at central hub
            }
          } else if (tr.phase === 'AT_HUB') {
            tr.hubWait--;
            if (tr.hubWait <= 0) {
              tr.phase = 'OUTBOUND';
              tr.progress = 0.0;
            }
          } else if (tr.phase === 'OUTBOUND') {
            tr.progress += tr.speed;
            if (tr.progress >= 1.0) {
              tr.progress = 1.0;
              tr.phase = 'ARRIVED';
              tr.arrivalTimer = 35;
              tr.arrivalPulse = 1.0;
            }
          } else if (tr.phase === 'ARRIVED') {
            tr.arrivalTimer--;
            tr.opacity = Math.max(0, tr.arrivalTimer / 35);
            tr.arrivalPulse = Math.max(0, tr.arrivalPulse - 0.03);

            if (tr.arrivalTimer <= 0) {
              activeTransfers.splice(i, 1);
              continue;
            }
          }

          // Arrival celebration ripple at destination
          if (tr.phase === 'ARRIVED' && tr.arrivalPulse > 0) {
            const destSt = station3DCoords[tr.destStation];
            if (destSt) {
              const rippleR = Math.max(3, destSt.radius + (1.0 - tr.arrivalPulse) * 22);
              ctx.save();
              ctx.beginPath();
              ctx.arc(destSt.screenX, destSt.screenY, rippleR, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(16, 185, 129, ${tr.arrivalPulse * 0.75})`;
              ctx.lineWidth = 2.0 * tr.arrivalPulse;
              ctx.stroke();
              ctx.restore();
            }
          }

          // 3D Avatar Coordinates along the curved spoke
          let curX = hubX;
          let curY = hubY;
          let curScale = 1.0;

          if (tr.phase === 'SPAWN') {
            const st = station3DCoords[tr.originStation];
            if (st) {
              curX = st.screenX;
              curY = st.screenY;
              curScale = st.scale;
            }
          } else if (tr.phase === 'ARRIVED') {
            const st = station3DCoords[tr.destStation];
            if (st) {
              curX = st.screenX;
              curY = st.screenY;
              curScale = st.scale;
            }
          } else if (tr.phase === 'AT_HUB') {
            curX = hubX;
            curY = hubY;
            curScale = 1.0;
          } else {
            const spokeIdx = tr.phase === 'INBOUND' ? tr.originStation : tr.destStation;
            const st = station3DCoords[spokeIdx];

            if (st) {
              // Smooth sinusoidal ease in/out
              const easedProgress = 0.5 - 0.5 * Math.cos(tr.progress * Math.PI);
              const u = tr.phase === 'INBOUND' ? 1 - easedProgress : easedProgress;
              const invU = 1 - u;

              // 3D point along quadratic bezier
              const avPtX = invU * invU * 0 + 2 * invU * u * st.midX + u * u * st.ptX;
              const avPtY = invU * invU * 0 + 2 * invU * u * st.midY + u * u * st.ptY;
              const avPtZ = invU * invU * 0 + 2 * invU * u * st.midZ + u * u * st.ptZ;

              const avProj = project3D(avPtX, avPtY, avPtZ);
              curX = avProj.screenX;
              curY = avProj.screenY;
              curScale = avProj.scale;
            }
          }

          // Render Avatar Pod (Compact & Sleek Size: diameter ~25px desktop, ~18px mobile)
          const avatarRadius = Math.max(3, (isMobile ? 9 : 12.5) * curScale);
          const avatarImg = avatarCanvases[tr.avatarIndex];
          if (!avatarImg) continue;

          ctx.save();
          ctx.globalAlpha = Math.min(1.0, Math.max(0, tr.opacity));

          // Outer glow
          const auraGrad = ctx.createRadialGradient(curX, curY, avatarRadius * 0.6, curX, curY, avatarRadius * 1.6);
          auraGrad.addColorStop(0, tr.glowColor);
          auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.beginPath();
          ctx.arc(curX, curY, avatarRadius * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = auraGrad;
          ctx.fill();

          // 3D Avatar Image
          ctx.shadowColor = 'rgba(30, 41, 59, 0.16)';
          ctx.shadowBlur = Math.max(1, 6 * curScale);
          ctx.shadowOffsetY = Math.max(0.5, 1.5 * curScale);
          ctx.drawImage(
            avatarImg,
            curX - avatarRadius,
            curY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
          );

          // White Rim
          ctx.beginPath();
          ctx.arc(curX, curY, avatarRadius, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, 1.8 * curScale);
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.restore();
        }

        // ── Layer G: Central Hub (Official MutualTransfer.lk Logo at 3D Origin - Rendered OVER Avatars!) ──
        ctx.save();
        // Ambient outer brand halo
        const hubHalo = ctx.createRadialGradient(hubX, hubY, safeHubR * 0.6, hubX, hubY, safeHubR * 2.2);
        hubHalo.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
        hubHalo.addColorStop(0.6, 'rgba(99, 102, 241, 0.14)');
        hubHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(hubX, hubY, safeHubR * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = hubHalo;
        ctx.fill();

        // Rotating dashed energy ring
        ctx.save();
        ctx.translate(hubX, hubY);
        ctx.rotate(time * 0.15);
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.arc(0, 0, safeHubR + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.65)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();

        // Elevated Disc Base (Solid Opaque White Disc)
        ctx.beginPath();
        ctx.arc(hubX, hubY, safeHubR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(37, 99, 235, 0.20)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 5;
        ctx.fill();

        // Logo Image
        ctx.save();
        ctx.beginPath();
        ctx.arc(hubX, hubY, safeHubR, 0, Math.PI * 2);
        ctx.clip();

        if (logoLoaded && logoImage.complete && logoImage.naturalWidth > 0) {
          ctx.drawImage(logoImage, hubX - safeHubR, hubY - safeHubR, safeHubR * 2, safeHubR * 2);
        } else {
          const fallbackGrad = ctx.createLinearGradient(hubX - safeHubR, hubY - safeHubR, hubX + safeHubR, hubY + safeHubR);
          fallbackGrad.addColorStop(0, '#2563eb');
          fallbackGrad.addColorStop(1, '#6366f1');
          ctx.fillStyle = fallbackGrad;
          ctx.fillRect(hubX - safeHubR, hubY - safeHubR, safeHubR * 2, safeHubR * 2);
        }

        // Specular Glint
        const hubGlint = ctx.createLinearGradient(hubX, hubY - safeHubR, hubX, hubY + safeHubR * 0.2);
        hubGlint.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        hubGlint.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = hubGlint;
        ctx.beginPath();
        ctx.ellipse(hubX, hubY - safeHubR * 0.35, safeHubR * 0.75, safeHubR * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // White Elevated Rim
        ctx.beginPath();
        ctx.arc(hubX, hubY, safeHubR, 0, Math.PI * 2);
        ctx.lineWidth = 3.2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();

        // Render Stations in the Front (passing gracefully in front of the central hub)
        frontStations.forEach(renderStationNode);
      } catch (err) {
        console.error('Animation frame render error:', err);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (document.body.style.cursor === 'pointer') {
        document.body.style.cursor = '';
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
};

export default Network3DBackground;
