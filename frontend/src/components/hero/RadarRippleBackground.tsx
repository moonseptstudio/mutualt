import React, { useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

export const RadarRippleBackground: React.FC = () => {
  const smoothX = useSpring(0, { stiffness: 50, damping: 25 });
  const smoothY = useSpring(0, { stiffness: 50, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 35;
      const y = (e.clientY / innerHeight - 0.5) * 35;
      smoothX.set(x);
      smoothY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [smoothX, smoothY]);

  const rings = [0, 1.2, 2.4, 3.6];

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center z-0"
      aria-hidden="true"
    >
      <motion.div 
        style={{ x: smoothX, y: smoothY }}
        className="relative w-[650px] h-[650px] max-w-full flex items-center justify-center"
      >
        {/* Radar Rotating Sweep Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, rgba(37, 99, 235, 0.08) 0deg, transparent 65deg, transparent 360deg)',
          }}
        />

        {/* Concentric Expanding Pulse Rings */}
        {rings.map((delay, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.35, opacity: 0.55 }}
            animate={{
              scale: [0.35, 1.8],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: 'easeOut',
              delay: delay,
            }}
            className="absolute w-80 h-80 rounded-full border border-blue-400/40"
          />
        ))}

        {/* Stationary Reference Grid Rings */}
        <div className="absolute w-[260px] h-[260px] rounded-full border border-blue-300/20" />
        <div className="absolute w-[440px] h-[440px] rounded-full border border-blue-300/15 border-dashed" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-blue-200/10" />

        {/* Crosshair subtle axis lines */}
        <div className="absolute h-[520px] w-px bg-linear-to-b from-transparent via-blue-300/20 to-transparent" />
        <div className="absolute w-[520px] h-px bg-linear-to-r from-transparent via-blue-300/20 to-transparent" />

        {/* Center Helpdesk Signal Hub */}
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 backdrop-blur-xs flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-[0_0_12px_#2563eb]" />
          </div>
          <span className="absolute animate-ping w-8 h-8 rounded-full bg-blue-400 opacity-40" />
        </div>

        {/* Satellite Support Node 1 (North-East) */}
        <div className="absolute top-28 right-32 flex items-center gap-1.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-blue-500/50 uppercase">Active</span>
        </div>

        {/* Satellite Support Node 2 (South-West) */}
        <div className="absolute bottom-32 left-28 flex items-center gap-1.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-sky-500/50 uppercase">Live</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RadarRippleBackground;

