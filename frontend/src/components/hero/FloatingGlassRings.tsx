import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

export const FloatingGlassRings: React.FC = () => {
  // Spring animation for ultra-smooth mouse tilt
  const smoothX = useSpring(0, { stiffness: 45, damping: 20 });
  const smoothY = useSpring(0, { stiffness: 45, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      smoothX.set(x * 15);
      smoothY.set(-y * 15);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [smoothX, smoothY]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center z-0 perspective-1000"
      aria-hidden="true"
    >
      {/* ── 3D Tilting Glass Rings Rig ── */}
      <motion.div 
        style={{
          rotateY: smoothX,
          rotateX: smoothY,
        }}
        className="relative w-[580px] h-[580px] max-w-full flex items-center justify-center opacity-70"
      >
        {/* Outer Frosted Glass Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400/25"
        />

        {/* Primary Glass Ring with Gradient Glow */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[460px] h-[460px] rounded-full border-[6px] border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.12)] backdrop-blur-[2px]"
          style={{
            background: 'radial-gradient(circle, rgba(239,246,255,0.1) 0%, rgba(219,234,254,0.05) 60%, transparent 100%)',
          }}
        >
          {/* Accent Glowing Beads along the ring */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500/60 shadow-[0_0_15px_#3b82f6]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-sky-400/50 shadow-[0_0_12px_#38bdf8]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500/50 shadow-[0_0_12px_#6366f1]" />
        </motion.div>

        {/* Inner Delicate Concentric Ring */}
        <motion.div
          animate={{ rotate: 360, scale: [0.98, 1.02, 0.98] }}
          transition={{
            rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute w-[320px] h-[320px] rounded-full border border-blue-300/30"
        />

        {/* Floating Value Orb 1 (Top-Left) */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            x: [-10, 10, -10],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-6 left-12 w-28 h-28 rounded-full bg-linear-to-br from-blue-400/20 to-sky-300/10 blur-xl"
        />

        {/* Floating Value Orb 2 (Bottom-Right) */}
        <motion.div
          animate={{
            y: [15, -15, 15],
            x: [10, -10, 10],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-10 right-14 w-36 h-36 rounded-full bg-linear-to-tl from-indigo-400/20 to-blue-300/10 blur-2xl"
        />

        {/* Floating Value Orb 3 (Center subtle pulse) */}
        <motion.div
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-52 h-52 rounded-full bg-blue-200/25 blur-3xl"
        />
      </motion.div>
    </div>
  );
};

export default FloatingGlassRings;
