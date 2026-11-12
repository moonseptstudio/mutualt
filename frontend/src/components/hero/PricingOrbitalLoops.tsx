import React, { useEffect, useRef } from 'react';

interface Photon {
  orbitIndex: number;
  progress: number; // 0 to 1
  speed: number;
  size: number;
  color: string;
  glow: string;
}

export const PricingOrbitalLoops: React.FC = () => {
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

    // 3 Intersecting Orbital Rings (2-Way Swap, 3-Way Cycle, Global Network)
    const orbits = [
      { rx: 340, ry: 130, angle: -0.32, speed: 0.003, color: 'rgba(37, 99, 235, 0.22)' },
      { rx: 290, ry: 150, angle: 0.45, speed: -0.0025, color: 'rgba(14, 165, 233, 0.22)' },
      { rx: 390, ry: 120, angle: 0.12, speed: 0.002, color: 'rgba(99, 102, 241, 0.18)' },
    ];

    // Photons traveling along the transfer cycles
    const photons: Photon[] = [
      { orbitIndex: 0, progress: 0.1, speed: 0.0035, size: 3.5, color: '#2563eb', glow: 'rgba(37, 99, 235, 0.6)' },
      { orbitIndex: 0, progress: 0.6, speed: 0.0035, size: 2.5, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
      { orbitIndex: 1, progress: 0.25, speed: -0.003, size: 3.2, color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.6)' },
      { orbitIndex: 1, progress: 0.75, speed: -0.003, size: 2.5, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)' },
      { orbitIndex: 2, progress: 0.0, speed: 0.0025, size: 3.8, color: '#6366f1', glow: 'rgba(99, 102, 241, 0.6)' },
      { orbitIndex: 2, progress: 0.5, speed: 0.0025, size: 2.8, color: '#818cf8', glow: 'rgba(129, 140, 248, 0.5)' },
    ];

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.01;

      const cx = width / 2;
      const cy = height / 2 + 10;

      // Mouse gentle gravitational pull on center
      let targetCx = cx;
      let targetCy = cy;
      if (mouse.active) {
        targetCx += (mouse.x - cx) * 0.08;
        targetCy += (mouse.y - cy) * 0.08;
      }

      // ── Draw Orbit Rings ──
      orbits.forEach((orbit, i) => {
        const currentAngle = orbit.angle + Math.sin(t * 0.5 + i) * 0.04;
        
        ctx.save();
        ctx.translate(targetCx, targetCy);
        ctx.rotate(currentAngle);

        // Responsive radius scaling
        const scaleFactor = Math.min(1, width / 900);
        const rx = orbit.rx * scaleFactor;
        const ry = orbit.ry * scaleFactor;

        // Draw Ellipse Orbit Track
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = orbit.color;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Subtle dashed inner harmonic track
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 0.94, ry * 0.94, 0, 0, Math.PI * 2);
        ctx.setLineDash([4, 12]);
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
      });

      // ── Draw Photons Traveling Along Orbits ──
      photons.forEach((p) => {
        const orbit = orbits[p.orbitIndex];
        const scaleFactor = Math.min(1, width / 900);
        const rx = orbit.rx * scaleFactor;
        const ry = orbit.ry * scaleFactor;
        const currentAngle = orbit.angle + Math.sin(t * 0.5 + p.orbitIndex) * 0.04;

        p.progress = (p.progress + p.speed + 1) % 1;
        const angle = p.progress * Math.PI * 2;

        // Position on 2D ellipse
        const lx = Math.cos(angle) * rx;
        const ly = Math.sin(angle) * ry;

        // Rotate to match orbit inclination
        const cosA = Math.cos(currentAngle);
        const sinA = Math.sin(currentAngle);
        const px = targetCx + (lx * cosA - ly * sinA);
        const py = targetCy + (lx * sinA + ly * cosA);

        // Draw Photon Outer Glow
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.glow;
        ctx.fill();

        // Draw Photon Core
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // If mouse is near, draw magnetic energy beam connecting mouse to photon
        if (mouse.active) {
          const mdx = mouse.x - px;
          const mdy = mouse.y - py;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 180) {
            const alpha = (1 - mdist / 180) * 0.45;
            ctx.beginPath();
            ctx.moveTo(px, py);
            // Curved gravitational arc to cursor
            const midX = (px + mouse.x) / 2 + Math.sin(t * 3) * 15;
            const midY = (py + mouse.y) / 2 + Math.cos(t * 3) * 15;
            ctx.quadraticCurveTo(midX, midY, mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      });

      // ── Central Exchange Energy Core ──
      ctx.beginPath();
      ctx.arc(targetCx, targetCy, 60, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(219, 234, 254, 0.15)';
      ctx.fill();

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

export default PricingOrbitalLoops;

