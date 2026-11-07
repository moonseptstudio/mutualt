import React from 'react';

export const InfinityConnectionLoop: React.FC = () => {
  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none flex items-center justify-center px-2 sm:px-0">
      {/* ── Soft Ambient Radial Glow ── */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[90%] h-[80%] bg-linear-to-tr from-blue-400/20 via-violet-400/20 to-emerald-400/20 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* ── High-Tech Autonomous SVG Infinity Canvas ── */}
      <div className="relative w-full aspect-[640/380] flex items-center justify-center">
        <svg
          viewBox="0 0 640 380"
          className="w-full h-full overflow-visible drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* ── Glow Filters ── */}
            <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur1" />
              <feGaussianBlur stdDeviation="2.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* ── Track & Beam Gradients ── */}
            <linearGradient id="mainInfinityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="30%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id="beamForwardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="beamReverseGrad" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="harmonicArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>

            {/* ── Radial Node Pulsing Gradients ── */}
            <radialGradient id="nodePulseGradA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="nodePulseGradB" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="nodePulseGradC" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>

            {/* ── Subtle Dot Matrix Grid ── */}
            <pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.9" fill="#94a3b8" className="opacity-20 dark:opacity-10" />
            </pattern>

            {/* ── Continuous Lemniscate Infinity Path ── */}
            <path
              id="lemniscatePath"
              d="M 320 190 C 400 85 535 85 535 190 C 535 295 400 295 320 190 C 240 85 105 85 105 190 C 105 295 240 295 320 190 Z"
            />

            {/* ── Upper Harmonic Resonance Arc ── */}
            <path
              id="upperArc"
              d="M 105 190 C 105 90 240 50 320 50 C 400 50 535 90 535 190"
            />

            {/* ── Lower Harmonic Resonance Arc ── */}
            <path
              id="lowerArc"
              d="M 105 190 C 105 290 240 330 320 330 C 400 330 535 290 535 190"
            />
          </defs>

          {/* 1. Backdrop Grid */}
          <rect x="25" y="25" width="590" height="330" rx="32" fill="url(#dotGrid)" />

          {/* 2. Secondary Harmonic Arcs (Multi-Dimensional Depth) */}
          <use
            href="#upperArc"
            stroke="url(#harmonicArcGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className="opacity-40"
          />
          <use
            href="#lowerArc"
            stroke="url(#harmonicArcGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className="opacity-40"
          />

          {/* 3. Concentric Orbit Rings Around Center */}
          <circle
            cx="320"
            cy="190"
            r="82"
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="3 6"
            className="opacity-30 dark:opacity-15 animate-spin"
            style={{ animationDuration: '32s', transformOrigin: '320px 190px' }}
          />
          <circle
            cx="320"
            cy="190"
            r="52"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeDasharray="5 7"
            className="opacity-45 dark:opacity-20 animate-spin"
            style={{ animationDuration: '18s', animationDirection: 'reverse', transformOrigin: '320px 190px' }}
          />

          {/* 4. Ambient Infinity Track Glow */}
          <use
            href="#lemniscatePath"
            stroke="url(#mainInfinityGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-20 filter blur-md"
          />

          {/* 5. Crisp Cyber Guide Rail */}
          <use
            href="#lemniscatePath"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="dark:stroke-slate-800"
          />

          {/* 6. Precision Micro-Dash Track */}
          <use
            href="#lemniscatePath"
            stroke="url(#mainInfinityGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="opacity-70"
          />

          {/* ── 7. HIGH-SPEED ANIMATED LIGHT BEAMS ── */}
          {/* Clockwise Beam (Blue-Indigo-Violet) */}
          <use
            href="#lemniscatePath"
            stroke="url(#beamForwardGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="25 75"
            filter="url(#neonGlow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-100"
              dur="4s"
              repeatCount="indefinite"
            />
          </use>

          {/* Counter-Flow Beam (Emerald-Cyan) */}
          <use
            href="#lemniscatePath"
            stroke="url(#beamReverseGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="20 80"
            filter="url(#neonGlow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="-50"
              to="-150"
              dur="4s"
              repeatCount="indefinite"
            />
          </use>

          {/* Upper Harmonic Pulse */}
          <use
            href="#upperArc"
            stroke="#c084fc"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="18 82"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-100"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </use>

          {/* Lower Harmonic Pulse */}
          <use
            href="#lowerArc"
            stroke="#38bdf8"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="18 82"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="-100"
              to="0"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </use>

          {/* ── 8. TRAVELLING PHOTON PARTICLES (WITH COMET GLOWS) ── */}
          {/* Photon 1 (Blue / Cyan) */}
          <circle r="5" fill="#60a5fa" filter="url(#coreGlow)">
            <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
              <mpath href="#lemniscatePath" />
            </animateMotion>
          </circle>
          <circle r="2.5" fill="#ffffff">
            <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
              <mpath href="#lemniscatePath" />
            </animateMotion>
          </circle>

          {/* Photon 2 (Emerald / Teal - 180° Phase Offset) */}
          <circle r="5" fill="#34d399" filter="url(#coreGlow)">
            <animateMotion dur="4s" begin="-2s" repeatCount="indefinite" rotate="auto">
              <mpath href="#lemniscatePath" />
            </animateMotion>
          </circle>
          <circle r="2.5" fill="#ffffff">
            <animateMotion dur="4s" begin="-2s" repeatCount="indefinite" rotate="auto">
              <mpath href="#lemniscatePath" />
            </animateMotion>
          </circle>

          {/* Photon 3 (Upper Arc Pulse) */}
          <circle r="4.5" fill="#e879f9" filter="url(#coreGlow)">
            <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto">
              <mpath href="#upperArc" />
            </animateMotion>
          </circle>

          {/* Photon 4 (Lower Arc Pulse) */}
          <circle r="4.5" fill="#22d3ee" filter="url(#coreGlow)">
            <animateMotion dur="3.2s" begin="-1.6s" repeatCount="indefinite" rotate="auto">
              <mpath href="#lowerArc" />
            </animateMotion>
          </circle>

          {/* ═══════════════════════════════════════════════
              LEFT HUB (PURE GLOWING ORB - NO TEXT)
             ═══════════════════════════════════════════════ */}
          <g>
            {/* Expanding Pulsing Rings */}
            <circle cx="105" cy="190" r="30" fill="url(#nodePulseGradA)">
              <animate attributeName="r" values="18;50;18" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* Ambient Dashed Target Ring */}
            <circle cx="105" cy="190" r="24" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" />

            {/* Orbiting Satellite Dot */}
            <circle cx="105" cy="166" r="2.5" fill="#3b82f6" className="animate-spin" style={{ transformOrigin: '105px 190px', animationDuration: '6s' }} />

            {/* Outer Frosted Glass Disc */}
            <circle cx="105" cy="190" r="16" fill="#ffffff" className="dark:fill-slate-900 drop-shadow-md" stroke="#3b82f6" strokeWidth="2.5" />

            {/* Inner Glowing Jewel Core */}
            <circle cx="105" cy="190" r="8" fill="#2563eb" filter="url(#coreGlow)" />
            <circle cx="105" cy="190" r="3" fill="#ffffff" />
          </g>

          {/* ═══════════════════════════════════════════════
              RIGHT HUB (PURE GLOWING ORB - NO TEXT)
             ═══════════════════════════════════════════════ */}
          <g>
            {/* Expanding Pulsing Rings */}
            <circle cx="535" cy="190" r="30" fill="url(#nodePulseGradB)">
              <animate attributeName="r" values="18;50;18" dur="3s" begin="-1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" begin="-1.5s" repeatCount="indefinite" />
            </circle>

            {/* Ambient Dashed Target Ring */}
            <circle cx="535" cy="190" r="24" fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />

            {/* Orbiting Satellite Dot */}
            <circle cx="535" cy="166" r="2.5" fill="#10b981" className="animate-spin" style={{ transformOrigin: '535px 190px', animationDuration: '6s', animationDirection: 'reverse' }} />

            {/* Outer Frosted Glass Disc */}
            <circle cx="535" cy="190" r="16" fill="#ffffff" className="dark:fill-slate-900 drop-shadow-md" stroke="#10b981" strokeWidth="2.5" />

            {/* Inner Glowing Jewel Core */}
            <circle cx="535" cy="190" r="8" fill="#059669" filter="url(#coreGlow)" />
            <circle cx="535" cy="190" r="3" fill="#ffffff" />
          </g>

          {/* ═══════════════════════════════════════════════
              TOP & BOTTOM HARMONIC RESONANCE ORBS
             ═══════════════════════════════════════════════ */}
          <g>
            {/* Top Node */}
            <circle cx="320" cy="50" r="16" fill="url(#nodePulseGradC)">
              <animate attributeName="r" values="10;28;10" dur="2.8s" begin="-0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2.8s" begin="-0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="320" cy="50" r="11" fill="#ffffff" className="dark:fill-slate-900 drop-shadow-sm" stroke="#8b5cf6" strokeWidth="2" />
            <circle cx="320" cy="50" r="4.5" fill="#7c3aed" filter="url(#coreGlow)" />
            <circle cx="320" cy="50" r="1.5" fill="#ffffff" />

            {/* Bottom Node */}
            <circle cx="320" cy="330" r="16" fill="url(#nodePulseGradA)">
              <animate attributeName="r" values="10;28;10" dur="2.8s" begin="-2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2.8s" begin="-2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="320" cy="330" r="11" fill="#ffffff" className="dark:fill-slate-900 drop-shadow-sm" stroke="#06b6d4" strokeWidth="2" />
            <circle cx="320" cy="330" r="4.5" fill="#0284c7" filter="url(#coreGlow)" />
            <circle cx="320" cy="330" r="1.5" fill="#ffffff" />
          </g>

          {/* ═══════════════════════════════════════════════
              CENTRAL QUANTUM INTERSECTION (FUSION CORE)
             ═══════════════════════════════════════════════ */}
          <g>
            {/* Expanding Shockwave Ripple */}
            <circle
              cx="320"
              cy="190"
              r="34"
              stroke="url(#mainInfinityGrad)"
              strokeWidth="1.5"
              className="opacity-40 animate-ping"
              style={{ animationDuration: '3.5s' }}
            />

            {/* Rotating Cyber Diamond Frame */}
            <rect
              x="298"
              y="168"
              width="44"
              height="44"
              rx="12"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="animate-spin opacity-75"
              style={{ animationDuration: '14s', transformOrigin: '320px 190px' }}
            />

            {/* Rotating Secondary Hexagon Ring */}
            <rect
              x="302"
              y="172"
              width="36"
              height="36"
              rx="8"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="animate-spin opacity-60"
              style={{ animationDuration: '22s', animationDirection: 'reverse', transformOrigin: '320px 190px' }}
            />

            {/* Glowing Core Disk */}
            <circle
              cx="320"
              cy="190"
              r="22"
              fill="#ffffff"
              className="dark:fill-slate-900 drop-shadow-xl"
              stroke="url(#mainInfinityGrad)"
              strokeWidth="2.5"
            />
            <circle cx="320" cy="190" r="12" fill="url(#mainInfinityGrad)" filter="url(#coreGlow)" />

            {/* Pure Visual Center Cross Connection Glyphs */}
            <path
              d="M 314 187 L 326 187 M 323 184 L 326 187 L 323 190"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 326 193 L 314 193 M 317 190 L 314 193 L 317 196"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default InfinityConnectionLoop;
