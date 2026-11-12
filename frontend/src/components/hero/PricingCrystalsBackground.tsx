import React, { useEffect, useRef } from 'react';

interface Crystal {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  size: number;
  baseAlpha: number;
  color: { r: number; g: number; b: number };
}

interface Stardust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

// 3D Octahedral Diamond Gem Vertices
const OCTA_VERTICES = [
  [0, -1.3, 0],   // 0: Top peak
  [1, 0, 0],      // 1: Right
  [0, 0, 1],      // 2: Front
  [-1, 0, 0],     // 3: Left
  [0, 0, -1],     // 4: Back
  [0, 1.3, 0],    // 5: Bottom peak
];

const OCTA_FACES = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 1],
  [5, 2, 1],
  [5, 3, 2],
  [5, 4, 3],
  [5, 1, 4],
];

export const PricingCrystalsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: -1000, y: -1000, active: false };

    const updateSize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    // Palette of refined translucent blue & sapphire hues
    const palettes = [
      { r: 37, g: 99, b: 235 },   // Royal Blue
      { r: 14, g: 165, b: 233 },  // Sky Cyan
      { r: 59, g: 130, b: 246 },  // Vibrant Blue
      { r: 99, g: 102, b: 241 },  // Indigo Sapphire
    ];

    // Initialize 16-20 Floating 3D Crystals
    const crystalCount = Math.min(20, Math.floor((window.innerWidth * window.innerHeight) / 50000) + 12);
    const crystals: Crystal[] = [];

    for (let i = 0; i < crystalCount; i++) {
      crystals.push({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight),
        z: 50 + Math.random() * 250,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.08, // gentle upward drift
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.008,
        vRotY: (Math.random() - 0.5) * 0.012,
        vRotZ: (Math.random() - 0.5) * 0.006,
        size: 18 + Math.random() * 26,
        baseAlpha: 0.18 + Math.random() * 0.22,
        color: palettes[Math.floor(Math.random() * palettes.length)],
      });
    }

    // Initialize 36 Shimmer Stardust Particles
    const stardustList: Stardust[] = Array.from({ length: 36 }, () => ({
      x: Math.random() * (width || window.innerWidth),
      y: Math.random() * (height || window.innerHeight),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.15 - Math.random() * 0.35, // floating up
      size: 1.2 + Math.random() * 2.2,
      alpha: 0.2 + Math.random() * 0.4,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
    }));

    // 3D rotation helper
    const rotatePoint = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      // Rotate around X
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      // Rotate around Y
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      // Rotate around Z
      let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
      return [x3, y3, z2];
    };

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 1;

      // ── 1. Render Stardust Particles ──
      stardustList.forEach((star) => {
        star.y += star.vy;
        star.x += star.vx;
        star.phase += star.twinkleSpeed;

        if (star.y < -10) star.y = height + 10;
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;

        // Mouse gentle push
        if (mouse.active) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const force = (1 - dist / 140) * 0.8;
            star.x += (dx / dist) * force * 3;
            star.y += (dy / dist) * force * 3;
          }
        }

        const twinkle = 0.5 + 0.5 * Math.sin(star.phase);
        const currentAlpha = star.alpha * twinkle;

        // Draw star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${currentAlpha})`;
        ctx.fill();

        // Soft halo
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${currentAlpha * 0.25})`;
        ctx.fill();
      });

      // ── 2. Render 3D Prismatic Crystals ──
      crystals.forEach((c) => {
        // Drift position
        c.x += c.vx;
        c.y += c.vy;

        // Wrap around smoothly
        if (c.y < -60) c.y = height + 60;
        if (c.y > height + 60) c.y = -60;
        if (c.x < -60) c.x = width + 60;
        if (c.x > width + 60) c.x = -60;

        // Rotate
        c.rotX += c.vRotX;
        c.rotY += c.vRotY;
        c.rotZ += c.vRotZ;

        // Mouse Proximity: Spurt spin & catch light when mouse is near
        let mouseInfluence = 0;
        if (mouse.active) {
          const dx = mouse.x - c.x;
          const dy = mouse.y - c.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 220) {
            mouseInfluence = (1 - dist / 220);
            c.rotY += mouseInfluence * 0.025;
            c.rotX += mouseInfluence * 0.015;
          }
        }

        // Perspective scale factor
        const focalLength = 300;
        const scale = focalLength / (focalLength + c.z);
        const currentSize = c.size * scale;

        // Transform 3D vertices to 2D screen coordinates
        const projectedVertices: [number, number, number][] = OCTA_VERTICES.map(([vx, vy, vz]) => {
          const [rx, ry, rz] = rotatePoint(vx * currentSize, vy * currentSize, vz * currentSize, c.rotX, c.rotY, c.rotZ);
          return [c.x + rx, c.y + ry, rz];
        });

        // Directional Light Vector (from mouse or top-left default)
        const lightX = mouse.active ? (mouse.x - c.x) / 300 : -0.5;
        const lightY = mouse.active ? (mouse.y - c.y) / 300 : -0.8;
        const lightZ = 1.0;
        const lightLen = Math.hypot(lightX, lightY, lightZ) || 1;
        const normLight = [lightX / lightLen, lightY / lightLen, lightZ / lightLen];

        // Draw Translucent 3D Faces
        OCTA_FACES.forEach((face) => {
          const v0 = projectedVertices[face[0]];
          const v1 = projectedVertices[face[1]];
          const v2 = projectedVertices[face[2]];

          // Calculate face normal vector
          const ax = v1[0] - v0[0];
          const ay = v1[1] - v0[1];
          const az = v1[2] - v0[2];
          const bx = v2[0] - v0[0];
          const by = v2[1] - v0[1];
          const bz = v2[2] - v0[2];

          const nx = ay * bz - az * by;
          const ny = az * bx - ax * bz;
          const nz = ax * by - ay * bx;
          const nLen = Math.hypot(nx, ny, nz) || 1;

          // Compute lighting intensity
          const dotLight = Math.max(0, (nx / nLen) * normLight[0] + (ny / nLen) * normLight[1] + (nz / nLen) * normLight[2]);
          const faceAlpha = Math.min(0.65, c.baseAlpha + dotLight * 0.25 + mouseInfluence * 0.2);

          ctx.beginPath();
          ctx.moveTo(v0[0], v0[1]);
          ctx.lineTo(v1[0], v1[1]);
          ctx.lineTo(v2[0], v2[1]);
          ctx.closePath();

          // Glass face gradient fill
          const faceGrad = ctx.createLinearGradient(v0[0], v0[1], v2[0], v2[1]);
          faceGrad.addColorStop(0, `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${faceAlpha})`);
          faceGrad.addColorStop(1, `rgba(${Math.min(255, c.color.r + 50)}, ${Math.min(255, c.color.g + 50)}, 255, ${faceAlpha * 0.6})`);
          ctx.fillStyle = faceGrad;
          ctx.fill();

          // Clean crystal edges
          ctx.strokeStyle = `rgba(191, 219, 254, ${Math.min(0.7, faceAlpha + 0.2)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Specular Gleam / Lens Flare at center when illuminated by mouse
        if (mouseInfluence > 0.3) {
          const gleamAlpha = (mouseInfluence - 0.3) * 0.8;
          ctx.beginPath();
          ctx.arc(c.x, c.y, currentSize * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${gleamAlpha * 0.4})`;
          ctx.fill();

          // 4-Point Starlight glint
          const glintSize = currentSize * 0.8;
          ctx.beginPath();
          ctx.moveTo(c.x - glintSize, c.y);
          ctx.lineTo(c.x + glintSize, c.y);
          ctx.moveTo(c.x, c.y - glintSize);
          ctx.lineTo(c.x, c.y + glintSize);
          ctx.strokeStyle = `rgba(255, 255, 255, ${gleamAlpha * 0.5})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0" 
      aria-hidden="true" 
    />
  );
};

export default PricingCrystalsBackground;
