import React, { useEffect, useRef } from 'react';

interface WaveParticle {
  x: number;
  waveIndex: number;
  speed: number;
  radius: number;
  alpha: number;
}

export const ContactSineWaves: React.FC = () => {
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

    // 4 Interlaced Voice / Signal Sine Waves
    const waves = [
      {
        baseAmp: 32,
        wavelength: 0.0035,
        speed: 0.018,
        yRatio: 0.52,
        stroke: 'rgba(37, 99, 235, 0.45)', // blue-600
        fill: 'rgba(37, 99, 235, 0.04)',
        lineWidth: 2.2,
      },
      {
        baseAmp: 42,
        wavelength: 0.0028,
        speed: -0.014,
        yRatio: 0.50,
        stroke: 'rgba(14, 165, 233, 0.4)', // sky-500
        fill: 'rgba(14, 165, 233, 0.03)',
        lineWidth: 1.8,
      },
      {
        baseAmp: 25,
        wavelength: 0.0048,
        speed: 0.022,
        yRatio: 0.54,
        stroke: 'rgba(59, 130, 246, 0.35)', // blue-500
        fill: 'transparent',
        lineWidth: 1.5,
      },
      {
        baseAmp: 48,
        wavelength: 0.0022,
        speed: -0.010,
        yRatio: 0.48,
        stroke: 'rgba(99, 102, 241, 0.3)', // indigo-500
        fill: 'rgba(99, 102, 241, 0.025)',
        lineWidth: 1.6,
      },
    ];

    // Floating particles riding the communication wave
    const particles: WaveParticle[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * (width || window.innerWidth),
      waveIndex: Math.floor(Math.random() * waves.length),
      speed: 0.6 + Math.random() * 0.9,
      radius: 1.4 + Math.random() * 1.8,
      alpha: 0.25 + Math.random() * 0.45,
    }));

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      phase += 1;

      // ── Draw Each Fluid Sine Wave Ribbon ──
      waves.forEach((wave, idx) => {
        const baseY = height * wave.yRatio;
        ctx.beginPath();
        ctx.moveTo(0, baseY);

        const points: { x: number; y: number }[] = [];

        // Sample along horizontal axis in step increments
        const step = 8;
        for (let x = 0; x <= width + step; x += step) {
          // Base harmonic oscillation
          const angle = x * wave.wavelength + phase * wave.speed + idx;
          let amp = wave.baseAmp;

          // Interactive Mouse Proximity Modulation (Sound frequency excitation)
          if (mouse.active) {
            const distToMouseX = Math.abs(x - mouse.x);
            if (distToMouseX < 260) {
              const mouseInfluence = (1 - distToMouseX / 260);
              // Modulate amplitude based on cursor proximity
              amp += mouseInfluence * 38;
              amp += Math.sin(phase * 0.08 + x * 0.02) * (mouseInfluence * 15);
            }
          }

          const y = baseY + Math.sin(angle) * amp;
          points.push({ x, y });
        }

        // Draw smooth bezier curve through points
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        // If filled, close path to bottom of canvas for soft layered wash
        if (wave.fill !== 'transparent') {
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fillStyle = wave.fill;
          ctx.fill();
        }

        // Draw wave stroke
        ctx.strokeStyle = wave.stroke;
        ctx.lineWidth = wave.lineWidth;
        ctx.stroke();
      });

      // ── Draw Wave Surfing Particles ──
      particles.forEach((p) => {
        p.x = (p.x + p.speed) % width;
        const wave = waves[p.waveIndex];
        const baseY = height * wave.yRatio;
        const angle = p.x * wave.wavelength + phase * wave.speed + p.waveIndex;
        let amp = wave.baseAmp;

        if (mouse.active) {
          const distToMouseX = Math.abs(p.x - mouse.x);
          if (distToMouseX < 260) {
            amp += (1 - distToMouseX / 260) * 38;
          }
        }

        const y = baseY + Math.sin(angle) * amp;

        // Particle Glow
        ctx.beginPath();
        ctx.arc(p.x, y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha * 0.25})`;
        ctx.fill();

        // Particle Core
        ctx.beginPath();
        ctx.arc(p.x, y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha})`;
        ctx.fill();
      });

      // ── Subtle Central Beacon Aura ──
      const auraGrad = ctx.createRadialGradient(width / 2, height * 0.5, 10, width / 2, height * 0.5, 220);
      auraGrad.addColorStop(0, 'rgba(191, 219, 254, 0.2)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

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

export default ContactSineWaves;
