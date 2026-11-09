import React, { useEffect, useRef } from 'react';
import logoImg from '../../assets/logos/logo.jpg';

interface Station {
  id: number;
  type: 'hospital' | 'school' | 'ministry' | 'secretariat' | 'tower' | 'maternity' | 'college' | 'clinic' | 'vocational';
  angle: number; // angle in heptagon (radians)
  glowColor: string;
  themeColor: string;
  driftSpeed: number;
  phaseX: number;
  phaseY: number;
  ampX: number;
  ampY: number;
}

interface ActiveTransfer {
  id: number;
  avatarIndex: number;
  roleType: 'doctor' | 'nurse' | 'teacher';
  glowColor: string;
  originStation: number;
  destStation: number;
  phase: 'SPAWN' | 'INBOUND' | 'AT_HUB' | 'OUTBOUND' | 'ARRIVED' | 'DONE';
  progress: number; // 0.0 to 1.0 along current leg
  speed: number;
  opacity: number; // 0.0 to 1.0
  hubWait: number; // frames to pause at hub
  arrivalTimer: number; // frames to fade out at destination
  arrivalPulse: number; // 0 to 1 ripple at destination
}

export const Network3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // ── 1. Load MutualTransfer.lk Official Logo ──
    const logoImage = new Image();
    let logoLoaded = false;
    logoImage.onload = () => {
      logoLoaded = true;
    };
    logoImage.src = logoImg;

    // ── 2. Pre-render 6 Stylized 3D Professional Avatars (Doctors, Nurses, Teachers) ──
    const avatarCanvases: HTMLCanvasElement[] = [];
    const professions = [
      // 0. DOCTOR (Male) - White Coat, Stethoscope
      { type: 'doctor' as const, bg1: '#0284c7', bg2: '#0369a1', skin: '#fed7aa', hair: '#1f2937', glow: 'rgba(2, 132, 199, 0.5)' },
      // 1. NURSE (Female) - Teal Scrubs, White Nurse Cap with Red Cross
      { type: 'nurse' as const, bg1: '#0ea5e9', bg2: '#0284c7', skin: '#fef08a', hair: '#78350f', glow: 'rgba(14, 165, 233, 0.5)' },
      // 2. TEACHER (Female) - Academic Mortarboard Graduation Cap, Glasses
      { type: 'teacher' as const, bg1: '#3b82f6', bg2: '#1d4ed8', skin: '#fcd34d', hair: '#451a03', glow: 'rgba(59, 130, 246, 0.5)' },
      // 3. DOCTOR (Female) - White Coat, Stethoscope
      { type: 'doctor' as const, bg1: '#2563eb', bg2: '#1d4ed8', skin: '#fed7aa', hair: '#374151', glow: 'rgba(37, 99, 235, 0.5)' },
      // 4. NURSE (Male) - Hospital Scrubs, ID Badge
      { type: 'nurse' as const, bg1: '#1d4ed8', bg2: '#1e3a8a', skin: '#ffedd5', hair: '#111827', glow: 'rgba(29, 78, 216, 0.5)' },
      // 5. TEACHER (Male) - Educator Sweater Vest, Glasses
      { type: 'teacher' as const, bg1: '#0284c7', bg2: '#1d4ed8', skin: '#fde68a', hair: '#92400e', glow: 'rgba(2, 132, 199, 0.5)' },
    ];

    const createAvatars = () => {
      avatarCanvases.length = 0;
      const size = 160;

      for (let k = 0; k < professions.length; k++) {
        const prof = professions[k];
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d');
        if (!octx) continue;

        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 4;

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
        const aura = octx.createRadialGradient(cx, cy - 8, 10, cx, cy - 8, 55);
        aura.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        octx.fillStyle = aura;
        octx.beginPath();
        octx.arc(cx, cy - 8, 55, 0, Math.PI * 2);
        octx.fill();

        // Uniforms
        if (prof.type === 'doctor') {
          octx.fillStyle = '#ffffff';
          octx.beginPath();
          octx.ellipse(cx, size + 10, 48, 52, 0, 0, Math.PI * 2);
          octx.fill();

          octx.fillStyle = k === 0 ? '#1e3a8a' : '#06b6d4';
          octx.beginPath();
          octx.moveTo(cx - 16, size - 32);
          octx.lineTo(cx, size - 12);
          octx.lineTo(cx + 16, size - 32);
          octx.closePath();
          octx.fill();

          octx.strokeStyle = '#334155';
          octx.lineWidth = 4.2;
          octx.beginPath();
          octx.arc(cx, size - 22, 22, 0.15 * Math.PI, 0.85 * Math.PI);
          octx.stroke();

          octx.fillStyle = '#94a3b8';
          octx.beginPath();
          octx.arc(cx, size - 12, 6.5, 0, Math.PI * 2);
          octx.fill();
        } else if (prof.type === 'nurse') {
          octx.fillStyle = k === 1 ? '#0d9488' : '#1e3a8a';
          octx.beginPath();
          octx.ellipse(cx, size + 10, 48, 52, 0, 0, Math.PI * 2);
          octx.fill();

          octx.fillStyle = '#ffffff';
          octx.beginPath();
          octx.moveTo(cx - 15, size - 32);
          octx.lineTo(cx, size - 14);
          octx.lineTo(cx + 15, size - 32);
          octx.closePath();
          octx.fill();
        } else {
          octx.fillStyle = k === 2 ? '#1e40af' : '#831843';
          octx.beginPath();
          octx.ellipse(cx, size + 10, 48, 52, 0, 0, Math.PI * 2);
          octx.fill();

          octx.fillStyle = '#ffffff';
          octx.beginPath();
          octx.moveTo(cx - 18, size - 32);
          octx.lineTo(cx, size - 14);
          octx.lineTo(cx + 18, size - 32);
          octx.closePath();
          octx.fill();
        }

        // Neck
        octx.fillStyle = prof.skin;
        octx.fillRect(cx - 12, cy + 12, 24, 20);

        // Head
        octx.beginPath();
        octx.arc(cx, cy - 4, 32, 0, Math.PI * 2);
        octx.fill();

        // Cheek blush
        octx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        octx.beginPath();
        octx.arc(cx - 18, cy + 4, 7, 0, Math.PI * 2);
        octx.arc(cx + 18, cy + 4, 7, 0, Math.PI * 2);
        octx.fill();

        // Hair
        octx.fillStyle = prof.hair;
        octx.beginPath();
        octx.arc(cx, cy - 14, 34, Math.PI, 2 * Math.PI);
        octx.lineTo(cx + 34, cy + 6);
        octx.lineTo(cx + 26, cy - 8);
        octx.lineTo(cx - 26, cy - 8);
        octx.lineTo(cx - 34, cy + 6);
        octx.closePath();
        octx.fill();

        // Eyes
        octx.fillStyle = '#1e293b';
        octx.beginPath();
        octx.arc(cx - 11, cy - 4, 3.5, 0, Math.PI * 2);
        octx.arc(cx + 11, cy - 4, 3.5, 0, Math.PI * 2);
        octx.fill();

        // Glasses
        if (prof.type === 'teacher' || k === 3) {
          octx.strokeStyle = k === 2 ? '#d97706' : (k === 5 ? '#1e293b' : '#0284c7');
          octx.lineWidth = 2.5;
          octx.beginPath();
          octx.arc(cx - 11, cy - 4, 8.5, 0, Math.PI * 2);
          octx.arc(cx + 11, cy - 4, 8.5, 0, Math.PI * 2);
          octx.moveTo(cx - 2.5, cy - 4);
          octx.lineTo(cx + 2.5, cy - 4);
          octx.stroke();
        }

        // Smile
        octx.strokeStyle = '#7c2d12';
        octx.lineWidth = 2.2;
        octx.beginPath();
        octx.arc(cx, cy + 5, 8, 0.15 * Math.PI, 0.85 * Math.PI);
        octx.stroke();

        // Distinct Headwear
        if (k === 1) {
          // Nurse Cap with Red Cross
          octx.fillStyle = '#ffffff';
          octx.beginPath();
          octx.moveTo(cx - 22, cy - 24);
          octx.lineTo(cx + 22, cy - 24);
          octx.lineTo(cx + 17, cy - 44);
          octx.lineTo(cx - 17, cy - 44);
          octx.closePath();
          octx.fill();

          octx.fillStyle = '#ef4444';
          octx.fillRect(cx - 2, cy - 39, 4, 10);
          octx.fillRect(cx - 5, cy - 36, 10, 4);
        } else if (k === 2) {
          // Teacher Graduation Cap
          octx.fillStyle = '#0f172a';
          octx.beginPath();
          octx.moveTo(cx, cy - 52);
          octx.lineTo(cx + 38, cy - 40);
          octx.lineTo(cx, cy - 28);
          octx.lineTo(cx - 38, cy - 40);
          octx.closePath();
          octx.fill();

          octx.beginPath();
          octx.ellipse(cx, cy - 28, 19, 8, 0, 0, Math.PI * 2);
          octx.fill();

          octx.strokeStyle = '#fbbf24';
          octx.lineWidth = 2.2;
          octx.beginPath();
          octx.moveTo(cx, cy - 40);
          octx.lineTo(cx + 26, cy - 32);
          octx.lineTo(cx + 30, cy - 16);
          octx.stroke();
        }

        // 3D Specular Curved Gloss
        const glint = octx.createLinearGradient(0, 0, 0, size * 0.55);
        glint.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        glint.addColorStop(1, 'rgba(255, 255, 255, 0)');
        octx.fillStyle = glint;
        octx.beginPath();
        octx.ellipse(cx, 28, 52, 24, 0, 0, Math.PI * 2);
        octx.fill();

        octx.restore();

        // Outer Crisp Pod Rim
        octx.beginPath();
        octx.arc(cx, cy, r, 0, Math.PI * 2);
        octx.lineWidth = 4;
        octx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        octx.stroke();

        avatarCanvases.push(off);
      }
    };

    createAvatars();

    // ── 3. Pre-render 7 Stylized Isometric 3D Public Sector Workplace Buildings ──
    // Handcrafted with true isometric 3D geometry, directional lighting, and minimalist modern SaaS aesthetics
    // 0: National General Hospital (Stepped Wings, Emerald Glass Band & Rooftop Beacon)
    // 1: Royal National Academy (Collegiate Gabled Hall, Doric Steps & Clock Steeple)
    // 2: Government Secretariat / Ministry (Civic Plinth, Colonnade & Renaissance Dome)
    // 3: Pediatric & Maternity Care (Biophilic Rounded Terraces, Living Garden Roof & Heart-Cross)
    // 4: District Community Clinic (Cantilevered Bauhaus Block, Teal Louvers & Emergency Bay)
    // 5: National Technical Institute (High-Tech Crystalline Prism, Solar Roof & Cyber Beacon)
    // 6: Teachers' Training College (Stepped Ziggurat Library, Campanile Tower & Torch of Knowledge)
    // ── 3. Pre-render 7 Realistic Architectural Institutions (Not cartoon/AI icons) ──
    // 0: National General Hospital (Helipad [H], multi-floor curtain-wall windows, ambulance entry)
    // 1: National Higher Secondary College (Classical portico colonnade, slate hipped roof & clock tower)
    // 2: Public Administration Complex / Ministry (Classical pediment, grand colonnade & ribbed civic dome)
    // 3: Maternity & Specialist Hospital (Biophilic stepped terraces, living green roof & glass parapets)
    // 4: District Community Clinic (Cantilevered medical pavilion, sun louvers & ambulance canopy)
    // 5: National Technology Institute (Crystalline glass prism, solar photovoltaic grid & communications mast)
    // 6: Teachers' Training College & Faculty Library (Stepped masonry archives, arched windows & campanile)
    const buildingCanvases: HTMLCanvasElement[] = [];

    const createBuildings = () => {
      buildingCanvases.length = 0;
      const bSize = 140;

      // Mathematical Isometric Prism Helper with realistic light casting
      const drawIsoBlock = (
        bctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        d: number,
        h: number,
        topColor: string | CanvasGradient,
        leftColor: string | CanvasGradient,
        rightColor: string | CanvasGradient
      ) => {
        // Left face (ambient light)
        bctx.fillStyle = leftColor;
        bctx.beginPath();
        bctx.moveTo(x - w, y);
        bctx.lineTo(x, y + d);
        bctx.lineTo(x, y + d - h);
        bctx.lineTo(x - w, y - h);
        bctx.closePath();
        bctx.fill();

        // Right face (shadow side)
        bctx.fillStyle = rightColor;
        bctx.beginPath();
        bctx.moveTo(x, y + d);
        bctx.lineTo(x + w, y);
        bctx.lineTo(x + w, y - h);
        bctx.lineTo(x, y + d - h);
        bctx.closePath();
        bctx.fill();

        // Top face (highlighted roof plane)
        bctx.fillStyle = topColor;
        bctx.beginPath();
        bctx.moveTo(x, y - d - h);
        bctx.lineTo(x + w, y - h);
        bctx.lineTo(x, y + d - h);
        bctx.lineTo(x - w, y - h);
        bctx.closePath();
        bctx.fill();
      };

      // Realistic multi-story window matrices on left facade
      const drawWindowsLeft = (
        bctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        d: number,
        h: number,
        floors: number,
        bays: number,
        glassColor: string
      ) => {
        bctx.fillStyle = glassColor;
        for (let f = 0; f < floors; f++) {
          const v1 = 0.16 + f * (0.76 / floors);
          const v2 = v1 + (0.58 / floors);
          for (let b = 0; b < bays; b++) {
            const u1 = 0.12 + b * (0.78 / bays);
            const u2 = u1 + (0.62 / bays);
            bctx.beginPath();
            bctx.moveTo(x - w + u1 * w, y + u1 * d - v1 * h);
            bctx.lineTo(x - w + u2 * w, y + u2 * d - v1 * h);
            bctx.lineTo(x - w + u2 * w, y + u2 * d - v2 * h);
            bctx.lineTo(x - w + u1 * w, y + u1 * d - v2 * h);
            bctx.closePath();
            bctx.fill();
          }
        }
      };

      // Realistic multi-story window matrices on right facade
      const drawWindowsRight = (
        bctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        d: number,
        h: number,
        floors: number,
        bays: number,
        glassColor: string
      ) => {
        bctx.fillStyle = glassColor;
        for (let f = 0; f < floors; f++) {
          const v1 = 0.16 + f * (0.76 / floors);
          const v2 = v1 + (0.58 / floors);
          for (let b = 0; b < bays; b++) {
            const u1 = 0.12 + b * (0.78 / bays);
            const u2 = u1 + (0.62 / bays);
            bctx.beginPath();
            bctx.moveTo(x + u1 * w, y + d - u1 * d - v1 * h);
            bctx.lineTo(x + u2 * w, y + d - u2 * d - v1 * h);
            bctx.lineTo(x + u2 * w, y + d - u2 * d - v2 * h);
            bctx.lineTo(x + u1 * w, y + d - u1 * d - v2 * h);
            bctx.closePath();
            bctx.fill();
          }
        }
      };

      // Realistic Ground Contact Shadow
      const drawGroundShadow = (bctx: CanvasRenderingContext2D, cx: number) => {
        const occGrad = bctx.createRadialGradient(cx, 116, 4, cx, 116, 46);
        occGrad.addColorStop(0, 'rgba(15, 23, 42, 0.20)');
        occGrad.addColorStop(0.4, 'rgba(51, 65, 85, 0.06)');
        occGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        bctx.beginPath();
        bctx.ellipse(cx, 116, 46, 14, 0, 0, Math.PI * 2);
        bctx.fillStyle = occGrad;
        bctx.fill();
      };

      // ─────────────────────────────────────────────────────────────
      // Building 0: National General Hospital (Healthcare Hub)
      // ─────────────────────────────────────────────────────────────
      {
        const b = document.createElement('canvas');
        b.width = bSize;
        b.height = bSize;
        const bctx = b.getContext('2d');
        if (bctx) {
          const cx = bSize / 2;
          drawGroundShadow(bctx, cx);

          // Paved Entrance Plaza
          drawIsoBlock(bctx, cx, 114, 44, 22, 4, '#e2e8f0', '#cbd5e1', '#94a3b8');

          // Left Wing (Patient Care Suites - 3 floors)
          drawIsoBlock(bctx, cx - 18, 102, 16, 8, 28, '#ffffff', '#f1f5f9', '#cbd5e1');
          drawWindowsLeft(bctx, cx - 18, 102, 16, 8, 28, 3, 2, '#0284c7');

          // Right Wing (Specialist Clinics - 3 floors)
          drawIsoBlock(bctx, cx + 18, 102, 16, 8, 28, '#ffffff', '#e2e8f0', '#94a3b8');
          drawWindowsRight(bctx, cx + 18, 102, 16, 8, 28, 3, 2, '#0369a1');

          // Main Central Hospital Tower (5 floors of glass & precast concrete)
          drawIsoBlock(bctx, cx, 104, 20, 10, 52, '#ffffff', '#f8fafc', '#cbd5e1');
          drawWindowsLeft(bctx, cx, 104, 20, 10, 52, 4, 2, '#0284c7');
          drawWindowsRight(bctx, cx, 104, 20, 10, 52, 4, 2, '#0369a1');

          // Emergency Entrance Canopy & Glass Lobby
          drawIsoBlock(bctx, cx, 108, 12, 6, 8, '#38bdf8', '#0284c7', '#0369a1');

          // Discrete Architectural Medical Cross etched on front facade
          bctx.fillStyle = '#ef4444';
          bctx.fillRect(cx - 1.5, 84, 3, 9);
          bctx.fillRect(cx - 4.5, 87, 9, 3);

          // Rooftop Elevator Penthouse & Helipad Base
          drawIsoBlock(bctx, cx, 52, 13, 6.5, 4, '#64748b', '#475569', '#334155');

          // Realistic Circular Helipad with White 'H' Marking
          bctx.beginPath();
          bctx.ellipse(cx, 46, 10, 5, 0, 0, Math.PI * 2);
          bctx.fillStyle = '#334155';
          bctx.fill();
          bctx.strokeStyle = '#f8fafc';
          bctx.lineWidth = 1.2;
          bctx.stroke();

          bctx.fillStyle = '#ffffff';
          bctx.font = 'bold 8px sans-serif';
          bctx.textAlign = 'center';
          bctx.textBaseline = 'middle';
          bctx.fillText('H', cx, 46);
        }
        buildingCanvases.push(b);
      }

      // ─────────────────────────────────────────────────────────────
      // Building 1: Royal National Academy / High School (Education Hub)
      // ─────────────────────────────────────────────────────────────
      {
        const b = document.createElement('canvas');
        b.width = bSize;
        b.height = bSize;
        const bctx = b.getContext('2d');
        if (bctx) {
          const cx = bSize / 2;
          drawGroundShadow(bctx, cx);

          // Stepped Classical Plaza
          drawIsoBlock(bctx, cx, 114, 46, 23, 4, '#e2e8f0', '#cbd5e1', '#94a3b8');

          // Main Academic Hall (3 floors)
          drawIsoBlock(bctx, cx, 108, 38, 19, 34, '#ffffff', '#f8fafc', '#cbd5e1');
          drawWindowsLeft(bctx, cx, 108, 38, 19, 34, 3, 3, '#1e293b');
          drawWindowsRight(bctx, cx, 108, 38, 19, 34, 3, 3, '#0f172a');

          // Classical Colonnade Portico (White Pillars)
          bctx.fillStyle = '#ffffff';
          for (let p = 0; p < 4; p++) {
            bctx.fillRect(cx - 9 + p * 6, 92, 2.2, 14);
          }

          // Slate Hipped Roof
          bctx.fillStyle = '#334155';
          bctx.beginPath();
          bctx.moveTo(cx - 40, 74);
          bctx.lineTo(cx, 93);
          bctx.lineTo(cx - 14, 56);
          bctx.closePath();
          bctx.fill();

          bctx.fillStyle = '#1e293b';
          bctx.beginPath();
          bctx.moveTo(cx, 93);
          bctx.lineTo(cx + 40, 74);
          bctx.lineTo(cx + 14, 56);
          bctx.lineTo(cx - 14, 56);
          bctx.closePath();
          bctx.fill();

          // Central Steeple Clock Tower
          drawIsoBlock(bctx, cx, 68, 10, 5, 22, '#475569', '#334155', '#1e293b');

          // Copper Pyramid Steeple
          bctx.fillStyle = '#d97706';
          bctx.beginPath();
          bctx.moveTo(cx - 10, 46);
          bctx.lineTo(cx, 51);
          bctx.lineTo(cx, 30);
          bctx.closePath();
          bctx.fill();

          bctx.fillStyle = '#b45309';
          bctx.beginPath();
          bctx.moveTo(cx, 51);
          bctx.lineTo(cx + 10, 46);
          bctx.lineTo(cx, 30);
          bctx.closePath();
          bctx.fill();

          // Embedded Architectural Clock Face
          bctx.beginPath();
          bctx.arc(cx - 3, 56, 3.5, 0, Math.PI * 2);
          bctx.fillStyle = '#f8fafc';
          bctx.fill();
          bctx.strokeStyle = '#0f172a';
          bctx.lineWidth = 0.8;
          bctx.stroke();

          // Clock Hands
          bctx.beginPath();
          bctx.moveTo(cx - 3, 56);
          bctx.lineTo(cx - 3, 53.5);
          bctx.moveTo(cx - 3, 56);
          bctx.lineTo(cx - 1, 56);
          bctx.strokeStyle = '#0f172a';
          bctx.lineWidth = 0.7;
          bctx.stroke();
        }
        buildingCanvases.push(b);
      }

      // ─────────────────────────────────────────────────────────────
      // Building 2: Government Secretariat / Ministry (Civic Core)
      // ─────────────────────────────────────────────────────────────
      {
        const b = document.createElement('canvas');
        b.width = bSize;
        b.height = bSize;
        const bctx = b.getContext('2d');
        if (bctx) {
          const cx = bSize / 2;
          drawGroundShadow(bctx, cx);

          // Monumental Civic Plinth
          drawIsoBlock(bctx, cx, 114, 46, 23, 5, '#cbd5e1', '#94a3b8', '#64748b');

          // Main Civic Administrative Edifice (4 stories)
          drawIsoBlock(bctx, cx, 109, 38, 19, 36, '#ffffff', '#f1f5f9', '#cbd5e1');
          drawWindowsLeft(bctx, cx, 109, 38, 19, 36, 4, 3, '#1e293b');
          drawWindowsRight(bctx, cx, 109, 38, 19, 36, 4, 3, '#0f172a');

          // Grand Portico Pillars & Pediment
          bctx.fillStyle = '#ffffff';
          for (let p = 0; p < 4; p++) {
            bctx.fillRect(cx - 9 + p * 6, 92, 2.2, 16);
          }
          bctx.fillStyle = '#f8fafc';
          bctx.beginPath();
          bctx.moveTo(cx - 12, 92);
          bctx.lineTo(cx + 12, 92);
          bctx.lineTo(cx, 84);
          bctx.closePath();
          bctx.fill();
          bctx.strokeStyle = '#cbd5e1';
          bctx.stroke();

          // Octagonal Drum
          drawIsoBlock(bctx, cx, 73, 18, 9, 10, '#e2e8f0', '#cbd5e1', '#94a3b8');
          bctx.fillStyle = '#1e293b';
          for (let w = 0; w < 4; w++) {
            bctx.fillRect(cx - 12 + w * 7, 65, 2.5, 6);
          }

          // Ribbed Civic Dome
          bctx.beginPath();
          bctx.ellipse(cx, 63, 17, 13, 0, Math.PI, 2 * Math.PI);
          bctx.fillStyle = '#475569';
          bctx.fill();
          bctx.strokeStyle = '#334155';
          bctx.lineWidth = 1;
          bctx.stroke();

          // Dome Architectural Rib Lines
          bctx.strokeStyle = '#64748b';
          bctx.lineWidth = 0.8;
          bctx.beginPath();
          bctx.moveTo(cx - 10, 63);
          bctx.quadraticCurveTo(cx - 6, 54, cx, 50);
          bctx.moveTo(cx + 10, 63);
          bctx.quadraticCurveTo(cx + 6, 54, cx, 50);
          bctx.moveTo(cx, 63);
          bctx.lineTo(cx, 50);
          bctx.stroke();

          // Bronze Finial Lantern
          bctx.fillStyle = '#d97706';
          bctx.fillRect(cx - 1.2, 45, 2.4, 6);
          bctx.beginPath();
          bctx.arc(cx, 44, 2, 0, Math.PI * 2);
          bctx.fill();
        }
        buildingCanvases.push(b);
      }

      // ─────────────────────────────────────────────────────────────
      // Building 3: Pediatric & Maternity Care (Biophilic Terraced Pavilion)
      // ─────────────────────────────────────────────────────────────
      {
        const b = document.createElement('canvas');
        b.width = bSize;
        b.height = bSize;
        const bctx = b.getContext('2d');
        if (bctx) {
          const cx = bSize / 2;
          drawGroundShadow(bctx, cx);

          // Tier 1 Base Pavilion (2 floors)
          drawIsoBlock(bctx, cx, 112, 42, 21, 20, '#ffffff', '#fff1f2', '#fecdd3');
          drawWindowsLeft(bctx, cx, 112, 42, 21, 20, 2, 3, '#0284c7');
          drawWindowsRight(bctx, cx, 112, 42, 21, 20, 2, 3, '#0369a1');

          // Rooftop Living Garden on Tier 1
          bctx.fillStyle = '#059669';
          bctx.beginPath();
          bctx.moveTo(cx, 112 - 21 - 20);
          bctx.lineTo(cx + 40, 112 - 20);
          bctx.lineTo(cx, 112 + 21 - 20);
          bctx.lineTo(cx - 40, 112 - 20);
          bctx.closePath();
          bctx.fill();

          // Glass Balustrade around garden
          bctx.strokeStyle = '#38bdf8';
          bctx.lineWidth = 1;
          bctx.beginPath();
          bctx.moveTo(cx - 38, 92);
          bctx.lineTo(cx, 111);
          bctx.lineTo(cx + 38, 92);
          bctx.stroke();

          // Recessed Upper Tier (Maternity Care Unit - 2 floors)
          drawIsoBlock(bctx, cx, 92, 24, 12, 24, '#ffffff', '#f8fafc', '#cbd5e1');
          drawWindowsLeft(bctx, cx, 92, 24, 12, 24, 2, 2, '#0284c7');
          drawWindowsRight(bctx, cx, 92, 24, 12, 24, 2, 2, '#0369a1');

          // Subtle Healthcare Red Cross on upper parapet
          bctx.fillStyle = '#ef4444';
          bctx.fillRect(cx - 1, 64, 2, 6);
          bctx.fillRect(cx - 3, 66, 6, 2);
        }
        buildingCanvases.push(b);
      }

      // ─────────────────────────────────────────────────────────────
      // Building 4: District Administrative Secretariat (Kachcheri / Civic Complex)
      // ─────────────────────────────────────────────────────────────
      {
        const b = document.createElement('canvas');
        b.width = bSize;
        b.height = bSize;
        const bctx = b.getContext('2d');
        if (bctx) {
          const cx = bSize / 2;
          drawGroundShadow(bctx, cx);

          // Paved Civic Plaza Plinth
          drawIsoBlock(bctx, cx, 114, 46, 23, 4, '#e2e8f0', '#cbd5e1', '#94a3b8');

          // Symmetrical Left Wing (Administrative Registry - 3 floors)
          drawIsoBlock(bctx, cx - 18, 104, 16, 8, 28, '#ffffff', '#f1f5f9', '#cbd5e1');
          drawWindowsLeft(bctx, cx - 18, 104, 16, 8, 28, 3, 2, '#1e293b');

          // Symmetrical Right Wing (Public Services Division - 3 floors)
          drawIsoBlock(bctx, cx + 18, 104, 16, 8, 28, '#ffffff', '#e2e8f0', '#94a3b8');
          drawWindowsRight(bctx, cx + 18, 104, 16, 8, 28, 3, 2, '#0f172a');

          // Central Stately Atrium & Main Portico (3.5 floors)
          drawIsoBlock(bctx, cx, 106, 20, 10, 36, '#ffffff', '#f8fafc', '#cbd5e1');
          drawWindowsLeft(bctx, cx, 94, 20, 10, 24, 2, 2, '#0f172a');
          drawWindowsRight(bctx, cx, 94, 20, 10, 24, 2, 2, '#1e293b');

          // Ground Floor Glass Reception & Grand Entrance
          drawIsoBlock(bctx, cx, 108, 12, 6, 12, '#38bdf8', '#0284c7', '#0369a1');

          // Classical Architectural Colonnade Pillars
          bctx.fillStyle = '#ffffff';
          for (let p = 0; p < 4; p++) {
            bctx.fillRect(cx - 9 + p * 6, 94, 2.2, 14);
          }

          // Recessed Executive Penthouse & Roof Parapet
          drawIsoBlock(bctx, cx, 70, 14, 7, 8, '#f1f5f9', '#e2e8f0', '#cbd5e1');

          // Parapet Perimeter Edge Line
          bctx.strokeStyle = '#94a3b8';
          bctx.lineWidth = 1;
          bctx.beginPath();
          bctx.moveTo(cx - 20, 70);
          bctx.lineTo(cx, 80);
          bctx.lineTo(cx + 20, 70);
          bctx.stroke();

          // Slender Architectural Flagpole atop building
          bctx.strokeStyle = '#64748b';
          bctx.lineWidth = 1.2;
          bctx.beginPath();
          bctx.moveTo(cx, 62);
          bctx.lineTo(cx, 46);
          bctx.stroke();

          // Gold Finial Spherical Cap
          bctx.fillStyle = '#d97706';
          bctx.beginPath();
          bctx.arc(cx, 46, 2, 0, Math.PI * 2);
          bctx.fill();
        }
        buildingCanvases.push(b);
      }

      // ─────────────────────────────────────────────────────────────
      // Building 5: National Public Service Center / Administrative Tower
      // ─────────────────────────────────────────────────────────────
      {
        const b = document.createElement('canvas');
        b.width = bSize;
        b.height = bSize;
        const bctx = b.getContext('2d');
        if (bctx) {
          const cx = bSize / 2;
          drawGroundShadow(bctx, cx);

          // Paved Modern Architectural Terrace Plinth (Clean Stone)
          drawIsoBlock(bctx, cx, 114, 42, 21, 5, '#e2e8f0', '#cbd5e1', '#94a3b8');
          drawIsoBlock(bctx, cx, 110, 36, 18, 4, '#f8fafc', '#e2e8f0', '#cbd5e1');

          // Main Modern High-Rise Tower (5 stories of architectural glass & white precast)
          drawIsoBlock(bctx, cx, 106, 26, 13, 56, '#ffffff', '#f8fafc', '#cbd5e1');

          // Crisp Multi-Floor Sky-Blue Architectural Glass Windows
          drawWindowsLeft(bctx, cx, 106, 26, 13, 56, 5, 3, '#0284c7');
          drawWindowsRight(bctx, cx, 106, 26, 13, 56, 5, 3, '#0369a1');

          // Architectural Vertical Sun-Shading Fins (Mullions) on Left Face
          bctx.strokeStyle = '#ffffff';
          bctx.lineWidth = 1.2;
          for (let m = 1; m <= 2; m++) {
            const u = m / 3;
            bctx.beginPath();
            bctx.moveTo(cx - 26 + u * 26, 106 + u * 13 - 10);
            bctx.lineTo(cx - 26 + u * 26, 106 + u * 13 - 54);
            bctx.stroke();
          }

          // Architectural Vertical Fins on Right Face
          for (let m = 1; m <= 2; m++) {
            const u = m / 3;
            bctx.beginPath();
            bctx.moveTo(cx + u * 26, 106 + 13 - u * 13 - 10);
            bctx.lineTo(cx + u * 26, 106 + 13 - u * 13 - 54);
            bctx.stroke();
          }

          // Double-Height Glass Entrance Lobby at Ground Floor
          drawIsoBlock(bctx, cx, 107, 14, 7, 10, '#38bdf8', '#0284c7', '#0369a1');
          bctx.fillStyle = '#ffffff';
          bctx.fillRect(cx - 1, 98, 2, 9); // Center door divider

          // Recessed Executive Penthouse & Roof Terrace
          drawIsoBlock(bctx, cx, 50, 16, 8, 10, '#f1f5f9', '#e2e8f0', '#cbd5e1');
          drawWindowsLeft(bctx, cx, 50, 16, 8, 10, 1, 2, '#0284c7');
          drawWindowsRight(bctx, cx, 50, 16, 8, 10, 1, 2, '#0369a1');

          // Sleek Architectural Glass Crown Parapet
          bctx.strokeStyle = '#38bdf8';
          bctx.lineWidth = 1.2;
          bctx.beginPath();
          bctx.moveTo(cx - 16, 40);
          bctx.lineTo(cx, 48);
          bctx.lineTo(cx + 16, 40);
          bctx.stroke();
        }
        buildingCanvases.push(b);
      }

      // ─────────────────────────────────────────────────────────────
      // Building 6: Teachers' Training College & Faculty Library
      // ─────────────────────────────────────────────────────────────
      {
        const b = document.createElement('canvas');
        b.width = bSize;
        b.height = bSize;
        const bctx = b.getContext('2d');
        if (bctx) {
          const cx = bSize / 2;
          drawGroundShadow(bctx, cx);

          // Tier 1 Library Hall (2 stories)
          drawIsoBlock(bctx, cx + 8, 112, 30, 15, 16, '#ffffff', '#f8fafc', '#cbd5e1');
          drawWindowsLeft(bctx, cx + 8, 112, 30, 15, 16, 2, 3, '#b45309');
          drawWindowsRight(bctx, cx + 8, 112, 30, 15, 16, 2, 3, '#78350f');

          // Tier 2 Reading Gallery
          drawIsoBlock(bctx, cx + 8, 96, 22, 11, 14, '#fef3c7', '#fde68a', '#f59e0b');
          drawWindowsLeft(bctx, cx + 8, 96, 22, 11, 14, 1, 2, '#b45309');

          // Tier 3 Special Archives
          drawIsoBlock(bctx, cx + 8, 82, 14, 7, 12, '#fde68a', '#fbbf24', '#d97706');

          // Classical Campanile / Academic Bell Tower
          drawIsoBlock(bctx, cx - 22, 112, 9, 4.5, 60, '#d97706', '#b45309', '#92400e');

          // Belfry Louvers
          bctx.fillStyle = '#451a03';
          for (let l = 0; l < 3; l++) {
            bctx.fillRect(cx - 26, 62 + l * 4, 6, 2);
          }

          // Campanile Steeple Cap
          bctx.fillStyle = '#fbbf24';
          bctx.beginPath();
          bctx.moveTo(cx - 31, 52);
          bctx.lineTo(cx - 22, 57);
          bctx.lineTo(cx - 22, 34);
          bctx.closePath();
          bctx.fill();

          bctx.fillStyle = '#b45309';
          bctx.beginPath();
          bctx.moveTo(cx - 22, 57);
          bctx.lineTo(cx - 13, 52);
          bctx.lineTo(cx - 22, 34);
          bctx.closePath();
          bctx.fill();
        }
        buildingCanvases.push(b);
      }
    };

    createBuildings();

    // ── 4. Heptagon Symmetrical Stations with Organic Floating Drift (7 Stations) ──
    // Vertices of regular heptagon: angle step = 2*PI / 7 ≈ 51.43 deg
    // Glow auras softened to match the page's light mesh gradient & floating blurred bubbles
    const stations: Station[] = [
      { id: 0, type: 'hospital',   angle: -Math.PI / 2 + (0 * 2 * Math.PI) / 7, glowColor: 'rgba(37, 99, 235, 0.22)',  themeColor: '#2563eb', driftSpeed: 0.85, phaseX: 0.2, phaseY: 1.5, ampX: 22, ampY: 26 }, // Top (0 deg)
      { id: 1, type: 'school',     angle: -Math.PI / 2 + (1 * 2 * Math.PI) / 7, glowColor: 'rgba(59, 130, 246, 0.22)',  themeColor: '#3b82f6', driftSpeed: 0.75, phaseX: 2.1, phaseY: 0.8, ampX: 25, ampY: 22 }, // Top-Right (51.4 deg)
      { id: 2, type: 'ministry',   angle: -Math.PI / 2 + (2 * 2 * Math.PI) / 7, glowColor: 'rgba(2, 132, 199, 0.22)',   themeColor: '#0284c7', driftSpeed: 0.80, phaseX: 4.0, phaseY: 3.2, ampX: 22, ampY: 25 }, // Mid-Right (102.9 deg)
      { id: 3, type: 'maternity',  angle: -Math.PI / 2 + (3 * 2 * Math.PI) / 7, glowColor: 'rgba(14, 165, 233, 0.22)',  themeColor: '#0ea5e9', driftSpeed: 0.78, phaseX: 1.8, phaseY: 4.1, ampX: 24, ampY: 24 }, // Bottom-Right (154.3 deg)
      { id: 4, type: 'secretariat', angle: -Math.PI / 2 + (4 * 2 * Math.PI) / 7, glowColor: 'rgba(30, 58, 138, 0.20)',  themeColor: '#1e3a8a', driftSpeed: 0.70, phaseX: 1.1, phaseY: 4.8, ampX: 24, ampY: 24 }, // Bottom-Left (205.7 deg) - District Secretariat
      { id: 5, type: 'tower',       angle: -Math.PI / 2 + (5 * 2 * Math.PI) / 7, glowColor: 'rgba(29, 78, 216, 0.20)',  themeColor: '#1d4ed8', driftSpeed: 0.82, phaseX: 3.4, phaseY: 1.9, ampX: 23, ampY: 25 }, // Mid-Left (257.1 deg) - Public Service Tower
      { id: 6, type: 'college',    angle: -Math.PI / 2 + (6 * 2 * Math.PI) / 7, glowColor: 'rgba(37, 99, 235, 0.22)',  themeColor: '#2563eb', driftSpeed: 0.90, phaseX: 5.3, phaseY: 2.4, ampX: 26, ampY: 21 }, // Top-Left (308.6 deg)
    ];

    // Spoke Line Curvature offsets for visual rhythm (quadratic Bezier for 7 spokes)
    // Enhanced sweeping curves for spokes 1, 3, 4, and 6
    const spokeCurvatures = [20, -54, 22, -52, -78, 18, 78];

    // Traveling Photons on the 7 Spokes connecting Hub to Stations (calm, elegant speed)
    const spokePhotons = [
      { progress: 0.15, speed: 0.0032 },
      { progress: 0.55, speed: 0.0036 },
      { progress: 0.85, speed: 0.0030 },
      { progress: 0.35, speed: 0.0034 },
      { progress: 0.70, speed: 0.0032 },
      { progress: 0.20, speed: 0.0035 },
      { progress: 0.60, speed: 0.0029 },
    ];

    // ── 5. Active Transfers (Strictly 1 Avatar per line in the same direction) ──
    const activeTransfers: ActiveTransfer[] = [
      // Transfer 0: Doctor starting journey from Station 0 towards Hub
      {
        id: 0.1,
        avatarIndex: 0,
        roleType: 'doctor',
        glowColor: professions[0].glow,
        originStation: 0,
        destStation: 3,
        phase: 'INBOUND',
        progress: 0.35,
        speed: 0.0025,
        opacity: 1.0,
        hubWait: 0,
        arrivalTimer: 0,
        arrivalPulse: 0,
      },
      // Transfer 1: Nurse moving from Hub towards Station 4
      {
        id: 0.2,
        avatarIndex: 1,
        roleType: 'nurse',
        glowColor: professions[1].glow,
        originStation: 2,
        destStation: 4,
        phase: 'OUTBOUND',
        progress: 0.45,
        speed: 0.0026,
        opacity: 1.0,
        hubWait: 0,
        arrivalTimer: 0,
        arrivalPulse: 0,
      },
      // Transfer 2: Teacher moving from Station 6 towards Hub
      {
        id: 0.3,
        avatarIndex: 2,
        roleType: 'teacher',
        glowColor: professions[2].glow,
        originStation: 6,
        destStation: 1,
        phase: 'INBOUND',
        progress: 0.82,
        speed: 0.0024,
        opacity: 1.0,
        hubWait: 0,
        arrivalTimer: 0,
        arrivalPulse: 0,
      },
    ];

    let nextAvatarIdx = 3;
    let spawnTimer = 0;

    // ── Interactive Mouse Sensitivity & Parallax Tracking ──
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
      // Normalized mouse offset relative to canvas center: -1.0 to 1.0
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

    // Handle Window Resize
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Smooth spring interpolation for responsive mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.055;
      mouseY += (targetMouseY - mouseY) * 0.055;

      const isMobile = width < 768;

      // ── DESKTOP PAGE ALIGNMENT (CONTAINER & COLUMNS) ──
      // Aligns with the landing page max-w-7xl layout so stations frame the headline & CTA button without overlapping
      const containerWidth = Math.min(width - 64, 1280);
      const containerLeft = (width - containerWidth) / 2;
      const colWidth = (containerWidth - 48) / 2;

      // ── LIVE ORGANIC FLOATING CENTRAL HUB WITH MOUSE PARALLAX ──
      const hubBaseX = isMobile
        ? width * 0.5
        : containerLeft + colWidth + colWidth * 0.52;
      const hubBaseY = isMobile
        ? Math.max(215, Math.min(height * 0.28, 240))
        : height * 0.50;
      const hubRadius = isMobile ? 28 : 38;

      // Subtle gentle organic breathing + interactive mouse parallax for central hub
      const hubParallaxX = mouseX * (isMobile ? 8 : 16);
      const hubParallaxY = mouseY * (isMobile ? 6 : 14);
      const hubX = hubBaseX + Math.sin(time * 0.6) * 4 + hubParallaxX;
      const hubY = hubBaseY + Math.cos(time * 0.5) * 4 + hubParallaxY;

      // ── LIVE ORGANIC FLOATING STATIONS (7 STATIONS) ──
      const radiusX = isMobile ? Math.min(width * 0.40, 160) : 215;
      const radiusY = isMobile ? 118 : 210;

      // 3D Parallax shift for stations layer (creates true depth separation against hub)
      const stationParallaxX = mouseX * (isMobile ? 18 : 34);
      const stationParallaxY = mouseY * (isMobile ? 15 : 28);

      // Calculate LIVE coordinates for the 7 Stations
      // On Desktop: Station 6 frames the "Find Your / Dream Match" headline (upper-left)
      //             Station 4 frames the "Join Network" CTA button (lower-left)
      //             Station 5 bridges the column gutter (mid-left)
      //             Stations 0, 1, 2, 3 frame the right showcase space
      // On Mobile:  Symmetrical compact heptagon around the upper showcase space
      const stationCoords = stations.map((st) => {
        let baseX = 0;
        let baseY = 0;

        if (isMobile) {
          baseX = hubBaseX + radiusX * Math.cos(st.angle);
          baseY = hubBaseY + radiusY * Math.sin(st.angle);
        } else {
          if (st.id === 6) {
            // Station 6: Shifted higher up above the "Find Your / Dream Match" headline
            baseX = containerLeft + Math.min(colWidth * 0.88, 510);
            baseY = Math.max(height * 0.13, Math.min(height * 0.20, 160));
          } else if (st.id === 4) {
            // Station 4: Reach extended further down cleanly below CTA button
            baseX = containerLeft + Math.min(colWidth * 0.90, 520);
            baseY = Math.max(height * 0.76, Math.min(height * 0.86, hubBaseY + 250));
          } else if (st.id === 5) {
            // Station 5: Mid-left column gutter bridging the headline and button
            baseX = containerLeft + colWidth + 24;
            baseY = hubBaseY + 20;
          } else if (st.id === 0) {
            // Station 0: Top above Hub
            baseX = hubBaseX + 10;
            baseY = hubBaseY - 210;
          } else if (st.id === 1) {
            // Station 1: Top-Right (increased reach/length)
            baseX = hubBaseX + 275 * Math.cos(-Math.PI / 4.5);
            baseY = hubBaseY + 250 * Math.sin(-Math.PI / 4.5);
          } else if (st.id === 2) {
            // Station 2: Mid-Right
            baseX = hubBaseX + 235 * Math.cos(Math.PI / 14);
            baseY = hubBaseY + 205 * Math.sin(Math.PI / 14);
          } else {
            // Station 3: Bottom-Right (increased reach/length)
            baseX = hubBaseX + 250 * Math.cos(Math.PI / 3.2);
            baseY = hubBaseY + 265 * Math.sin(Math.PI / 3.2);
          }
        }

        // Dampen drift amplitude on stations framing text to guarantee zero overlap
        const driftDamp = (!isMobile && (st.id === 6 || st.id === 4)) ? 0.6 : 1.0;
        const ampScale = (isMobile ? 0.7 : 1.0) * driftDamp;

        const driftX = (Math.sin(time * st.driftSpeed + st.phaseX) * st.ampX
                     + Math.cos(time * (st.driftSpeed * 0.5) + st.phaseY) * (st.ampX * 0.35)) * ampScale;
        const driftY = (Math.cos(time * (st.driftSpeed * 0.8) + st.phaseY) * st.ampY
                     + Math.sin(time * (st.driftSpeed * 0.4) + st.phaseX) * (st.ampY * 0.35)) * ampScale;

        // Base coordinates with drift and parallax
        let x = baseX + driftX + stationParallaxX;
        let y = baseY + driftY + stationParallaxY;

        // Interactive Proximity to Mouse Cursor (magnetic attraction & hover expansion)
        const distToMouse = Math.hypot(rawMouseX - x, rawMouseY - y);
        let hoverFactor = 0;
        if (distToMouse < 140) {
          hoverFactor = 1 - distToMouse / 140;
          // Magnetic lean towards cursor
          x += (rawMouseX - x) * hoverFactor * 0.12;
          y += (rawMouseY - y) * hoverFactor * 0.12;
        }

        const baseBuildingSize = isMobile ? 40 : 54;
        const buildingSize = baseBuildingSize * (1 + hoverFactor * 0.14);

        return {
          ...st,
          x,
          y,
          size: buildingSize,
          hoverFactor,
        };
      });

      // Interactive Ambient Pointer Light Glow
      if (rawMouseX > -100 && rawMouseX < width + 100 && rawMouseY > -100 && rawMouseY < height + 100) {
        const mouseAura = ctx.createRadialGradient(rawMouseX, rawMouseY, 0, rawMouseX, rawMouseY, 130);
        mouseAura.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
        mouseAura.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)');
        mouseAura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(rawMouseX, rawMouseY, 130, 0, Math.PI * 2);
        ctx.fillStyle = mouseAura;
        ctx.fill();
      }

      // ── 1. RENDER 7 CURVED CONNECTION LINES (HUB <-> 7 STATIONS ONLY) ──
      for (let i = 0; i < 7; i++) {
        const st = stationCoords[i];
        const curv = spokeCurvatures[i] * (isMobile ? 0.6 : 1.0);

        const dx = st.x - hubX;
        const dy = st.y - hubY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / dist;
        const ny = dx / dist;

        const ctrlX = (hubX + st.x) / 2 + nx * curv;
        const ctrlY = (hubY + st.y) / 2 + ny * curv;

        // Draw curved connection line (Subtle continuous underlay + Soft flowing dashed stream)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(hubX, hubY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, st.x, st.y);
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.12)';
        ctx.lineWidth = isMobile ? 1.2 : 1.5;
        ctx.stroke();

        const lineGrad = ctx.createLinearGradient(hubX, hubY, st.x, st.y);
        lineGrad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
        lineGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.22)');
        lineGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');

        ctx.beginPath();
        ctx.moveTo(hubX, hubY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, st.x, st.y);
        ctx.setLineDash([7, 6]);
        ctx.lineDashOffset = -time * 15;
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = isMobile ? 1.6 : 1.9;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.12)';
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.restore();

        // Traveling photon pulses along this spoke
        const photon = spokePhotons[i];
        photon.progress += photon.speed;
        if (photon.progress > 1) photon.progress = 0;

        const pt = photon.progress;
        const invPt = 1 - pt;
        const px = invPt * invPt * hubX + 2 * invPt * pt * ctrlX + pt * pt * st.x;
        const py = invPt * invPt * hubY + 2 * invPt * pt * ctrlY + pt * pt * st.y;

        // Pulse glow
        ctx.beginPath();
        ctx.arc(px, py, isMobile ? 4.5 : 5.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.45)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, isMobile ? 2.2 : 2.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.restore();
      }

      // ── 2. RENDER THE 7 HEPTAGON BUILDING STATIONS (NO TEXT) ──
      for (let i = 0; i < 7; i++) {
        const st = stationCoords[i];
        const bCanvas = buildingCanvases[st.id];

        ctx.save();

        // Realistic soft diffuse ground contact shadow (ambient occlusion matching daylight)
        const contactShadow = ctx.createRadialGradient(st.x, st.y + st.size * 0.30, 2, st.x, st.y + st.size * 0.30, st.size * 0.44);
        contactShadow.addColorStop(0, 'rgba(15, 23, 42, 0.18)');
        contactShadow.addColorStop(0.5, 'rgba(51, 65, 85, 0.05)');
        contactShadow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.ellipse(st.x, st.y + st.size * 0.30, st.size * 0.44, st.size * 0.14, 0, 0, Math.PI * 2);
        ctx.fillStyle = contactShadow;
        ctx.fill();

        // Subtle interactive hover highlight (clean ambient lift, no tacky AI neon glow)
        if (st.hoverFactor && st.hoverFactor > 0.02) {
          const hoverAura = ctx.createRadialGradient(st.x, st.y, st.size * 0.2, st.x, st.y, st.size * 0.65);
          hoverAura.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
          hoverAura.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.size * 0.65, 0, Math.PI * 2);
          ctx.fillStyle = hoverAura;
          ctx.fill();
        }

        // Draw 3D Stylized Workplace Building
        if (bCanvas) {
          ctx.drawImage(
            bCanvas,
            st.x - st.size / 2,
            st.y - st.size / 2,
            st.size,
            st.size
          );
        }

        ctx.restore();
      }

      // ── 3. RENDER TRAVELING AVATARS (UNDERNEATH CENTRAL LOGO HUB) ──
      // Dynamic Spawner: ensures a new transfer spawns from a free origin station
      spawnTimer++;
      const maxTransfers = isMobile ? 3 : 5;

      if (activeTransfers.length < maxTransfers && spawnTimer > 35) {
        // Find candidate origin stations that have NO avatar currently INBOUND or SPAWNING
        const occupiedInbound = new Set<number>();
        for (const t of activeTransfers) {
          if (t.phase === 'SPAWN' || t.phase === 'INBOUND') {
            occupiedInbound.add(t.originStation);
          }
        }

        const freeOrigins: number[] = [];
        for (let s = 0; s < 7; s++) {
          if (!occupiedInbound.has(s)) {
            freeOrigins.push(s);
          }
        }

        if (freeOrigins.length > 0) {
          // Find candidate destination stations that have NO avatar currently OUTBOUND or ARRIVED
          const occupiedOutbound = new Set<number>();
          for (const t of activeTransfers) {
            if (t.phase === 'AT_HUB' || t.phase === 'OUTBOUND' || t.phase === 'ARRIVED') {
              occupiedOutbound.add(t.destStation);
            }
          }

          const origin = freeOrigins[Math.floor(Math.random() * freeOrigins.length)];
          const freeDests: number[] = [];
          for (let d = 0; d < 7; d++) {
            if (d !== origin && !occupiedOutbound.has(d)) {
              freeDests.push(d);
            }
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
              speed: 0.0024 + Math.random() * 0.0004,
              opacity: 0.0,
              hubWait: 0,
              arrivalTimer: 0,
              arrivalPulse: 0,
            });
            spawnTimer = 0;
          }
        }
      }

      // Update and Render each active transfer
      for (let i = activeTransfers.length - 1; i >= 0; i--) {
        const tr = activeTransfers[i];

        if (tr.phase === 'SPAWN') {
          tr.opacity += 0.04;
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
            tr.hubWait = 22; // Brief pause inside logo hub while matching
          }
        } else if (tr.phase === 'AT_HUB') {
          tr.hubWait--;
          if (tr.hubWait <= 0) {
            // Check if designated destStation spoke is free in OUTBOUND
            const occupiedOutbound = new Set<number>();
            for (const other of activeTransfers) {
              if (other !== tr && (other.phase === 'OUTBOUND' || other.phase === 'ARRIVED')) {
                occupiedOutbound.add(other.destStation);
              }
            }

            if (occupiedOutbound.has(tr.destStation)) {
              // Re-pick any free destination station
              for (let d = 0; d < 7; d++) {
                if (d !== tr.originStation && !occupiedOutbound.has(d)) {
                  tr.destStation = d;
                  break;
                }
              }
            }

            tr.phase = 'OUTBOUND';
            tr.progress = 0.0;
          }
        } else if (tr.phase === 'OUTBOUND') {
          tr.progress += tr.speed;
          if (tr.progress >= 1.0) {
            tr.progress = 1.0;
            tr.phase = 'ARRIVED';
            tr.arrivalTimer = 28;
            tr.arrivalPulse = 1.0;
          }
        } else if (tr.phase === 'ARRIVED') {
          // Transfer is complete! Fade out into the station building. Do NOT morph!
          tr.arrivalTimer--;
          tr.opacity = Math.max(0, tr.arrivalTimer / 28);
          tr.arrivalPulse = Math.max(0, tr.arrivalPulse - 0.035);

          if (tr.arrivalTimer <= 0) {
            tr.phase = 'DONE';
            activeTransfers.splice(i, 1);
            continue;
          }
        }

        // Draw Arrival Celebration Ripple at destination station
        if (tr.phase === 'ARRIVED' && tr.arrivalPulse > 0) {
          const destSt = stationCoords[tr.destStation];
          const rippleR = destSt.size * 0.45 + (1.0 - tr.arrivalPulse) * 24;
          ctx.save();
          ctx.beginPath();
          ctx.arc(destSt.x, destSt.y, rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${tr.arrivalPulse * 0.85})`;
          ctx.lineWidth = 2.4 * tr.arrivalPulse;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.restore();
        }

        // Compute (curX, curY)
        let curX = hubX;
        let curY = hubY;

        if (tr.phase === 'SPAWN') {
          const st = stationCoords[tr.originStation];
          curX = st.x;
          curY = st.y - st.size * 0.28;
        } else if (tr.phase === 'ARRIVED') {
          const st = stationCoords[tr.destStation];
          curX = st.x;
          curY = st.y - st.size * 0.28;
        } else if (tr.phase === 'AT_HUB') {
          curX = hubX;
          curY = hubY;
        } else {
          const spokeIdx = tr.phase === 'INBOUND' ? tr.originStation : tr.destStation;
          const st = stationCoords[spokeIdx];
          const curv = spokeCurvatures[spokeIdx] * (isMobile ? 0.6 : 1.0);

          const dx = st.x - hubX;
          const dy = st.y - hubY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / dist;
          const ny = dx / dist;

          const ctrlX = (hubX + st.x) / 2 + nx * curv;
          const ctrlY = (hubY + st.y) / 2 + ny * curv;

          // u parameter along spoke:
          // INBOUND: from Station (u=1) to Hub (u=0)
          // OUTBOUND: from Hub (u=0) to Station (u=1)
          const u = tr.phase === 'INBOUND'
            ? Math.max(0, Math.min(1, 1 - tr.progress))
            : Math.max(0, Math.min(1, tr.progress));

          const invU = 1 - u;
          curX = invU * invU * hubX + 2 * invU * u * ctrlX + u * u * st.x;
          curY = invU * invU * hubY + 2 * invU * u * ctrlY + u * u * st.y;
        }

        // Draw Avatar Pod
        const avatarRadius = isMobile ? 13 : 17;
        const avatarImg = avatarCanvases[tr.avatarIndex];
        if (!avatarImg) continue;

        ctx.save();
        ctx.globalAlpha = tr.opacity;

        // Ambient Outer Glow Aura
        const auraGrad = ctx.createRadialGradient(curX, curY, avatarRadius * 0.7, curX, curY, avatarRadius * 1.8);
        auraGrad.addColorStop(0, tr.glowColor);
        auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(curX, curY, avatarRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 3D Portrait with soft slate/blue shadow matching page typography
        ctx.shadowColor = 'rgba(30, 41, 59, 0.16)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.drawImage(
          avatarImg,
          curX - avatarRadius,
          curY - avatarRadius,
          avatarRadius * 2,
          avatarRadius * 2
        );

        // Crisp White Glass Pod Rim
        ctx.beginPath();
        ctx.arc(curX, curY, avatarRadius, 0, Math.PI * 2);
        ctx.lineWidth = isMobile ? 2.2 : 2.8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.stroke();

        // Profession Emblem Badge at Bottom-Right (🩺, ✚, 🎓)
        const iconScale = isMobile ? 0.55 : 0.72;
        const badgeX = curX + avatarRadius * 0.65;
        const badgeY = curY + avatarRadius * 0.65;
        const badgeR = isMobile ? 5.2 : 6.8;

        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(30, 41, 59, 0.12)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();

        if (tr.roleType === 'doctor') {
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 1.8 * iconScale;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY - 1 * iconScale, 4.4 * iconScale, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(badgeX, badgeY + 3.4 * iconScale, 1.8 * iconScale, 0, Math.PI * 2);
          ctx.fill();
        } else if (tr.roleType === 'nurse') {
          ctx.fillStyle = '#ef4444';
          const crossW = 2.4 * iconScale;
          const crossL = 7.0 * iconScale;
          ctx.fillRect(badgeX - crossW / 2, badgeY - crossL / 2, crossW, crossL);
          ctx.fillRect(badgeX - crossL / 2, badgeY - crossW / 2, crossL, crossW);
        } else {
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.moveTo(badgeX, badgeY - 3.4 * iconScale);
          ctx.lineTo(badgeX + 5.0 * iconScale, badgeY - 0.5 * iconScale);
          ctx.lineTo(badgeX, badgeY + 2.4 * iconScale);
          ctx.lineTo(badgeX - 5.0 * iconScale, badgeY - 0.5 * iconScale);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // ── 4. RENDER CENTRAL MUTUALTRANSFER.LK LOGO HUB (HIGHEST Z-INDEX - AVATARS GLIDE UNDERNEATH) ──
      ctx.save();

      // A. Ambient outer brand halo
      const hubHalo = ctx.createRadialGradient(hubX, hubY, hubRadius * 0.7, hubX, hubY, hubRadius * 2.3);
      hubHalo.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
      hubHalo.addColorStop(0.6, 'rgba(139, 92, 246, 0.20)');
      hubHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.arc(hubX, hubY, hubRadius * 2.3, 0, Math.PI * 2);
      ctx.fillStyle = hubHalo;
      ctx.fill();

      // B. Rotating dashed energy ring
      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(time * 0.35);
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, hubRadius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();

      // C. Solid Opaque White Base Disc with Elevated Drop Shadow (matching page's signature blue-violet elevated glow)
      ctx.beginPath();
      ctx.arc(hubX, hubY, hubRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(37, 99, 235, 0.22)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      ctx.fill();

      // D. Official Logo Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(hubX, hubY, hubRadius, 0, Math.PI * 2);
      ctx.clip();

      if (logoLoaded && logoImage.complete && logoImage.naturalWidth > 0) {
        ctx.drawImage(logoImage, hubX - hubRadius, hubY - hubRadius, hubRadius * 2, hubRadius * 2);
      } else {
        const fallbackGrad = ctx.createLinearGradient(hubX - hubRadius, hubY - hubRadius, hubX + hubRadius, hubY + hubRadius);
        fallbackGrad.addColorStop(0, '#2563eb');
        fallbackGrad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = fallbackGrad;
        ctx.fillRect(hubX - hubRadius, hubY - hubRadius, hubRadius * 2, hubRadius * 2);
      }

      // E. 3D Glass Specular Curved Glint
      const hubGlint = ctx.createLinearGradient(hubX, hubY - hubRadius, hubX, hubY + hubRadius * 0.2);
      hubGlint.addColorStop(0, 'rgba(255, 255, 255, 0.70)');
      hubGlint.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = hubGlint;
      ctx.beginPath();
      ctx.ellipse(hubX, hubY - hubRadius * 0.35, hubRadius * 0.75, hubRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // F. Crisp White 3D Elevated Outer Rim
      ctx.beginPath();
      ctx.arc(hubX, hubY, hubRadius, 0, Math.PI * 2);
      ctx.lineWidth = 3.8;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = 'rgba(30, 41, 59, 0.15)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default Network3DBackground;
