import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  GitMerge, 
  Zap, 
  ShieldCheck, 
  Globe, 
  SlidersHorizontal, 
  CheckCircle2, 
  Bell
} from 'lucide-react';

export interface ChainItem {
  id: string | number;
  name: string;
  details?: string;
  icon: React.ElementType;
}

export interface ChainCarouselProps {
  items?: ChainItem[];
  scrollSpeedMs?: number;
  className?: string;
  onChainSelect?: (chainId: string | number, chainName: string) => void;
}

const ROW_HEIGHT = 62; // Height in px for each visible row in the vertical reel (increased Y-gap)

export const ChainCarouselFeatures: React.FC<ChainCarouselProps> = ({
  items: propItems,
  scrollSpeedMs = 2800,
  className = "",
  onChainSelect
}) => {
  const { t } = useTranslation();

  // Default project-tailored items for MutualTransfer.lk if custom items are not passed
  const defaultItems: ChainItem[] = useMemo(() => [
    {
      id: 'circular',
      name: t('home.feat_large_title', 'Circular Matching'),
      details: t('home.feat_large_desc', 'Discovers complex 3-way circular transfer chains (A → B → C → A).'),
      icon: GitMerge
    },
    {
      id: 'instant',
      name: t('home.feat1_title', 'Instant Scanning'),
      details: t('home.feat1_desc', 'Scans thousands of employee requirements in milliseconds for direct 2-way shifts.'),
      icon: Zap
    },
    {
      id: 'security',
      name: t('home.feat2_title', 'Multi-Level Security'),
      details: t('home.feat2_desc', 'NIC and official government email validation ensures authenticated public officers.'),
      icon: ShieldCheck
    },
    {
      id: 'network',
      name: t('home.feat3_title', 'Unified Network'),
      details: t('home.feat3_desc', 'Centralized hub for Teachers, Nurses, and Doctors across all 25 districts.'),
      icon: Globe
    },
    {
      id: 'search',
      name: t('home.feat4_title', 'Hierarchical Search'),
      details: t('home.feat4_desc', 'Filter down through Province, District, and Hospital/School level vacancies with precision.'),
      icon: SlidersHorizontal
    },
    {
      id: 'verified',
      name: t('home.feat5_title', 'Verified Results'),
      details: t('home.feat5_desc', '98% data accuracy ensures your match is valid and ready for official approval.'),
      icon: CheckCircle2
    },
    {
      id: 'alerts',
      name: t('home.feat_alerts_title', 'Real-time Match Alerts'),
      details: t('home.feat_alerts_desc', 'Instant notification alerts when a matching transfer partner registers in your preferred area.'),
      icon: Bell
    }
  ], [t]);

  const items = propItems && propItems.length > 0 ? propItems : defaultItems;
  const total = items.length;

  // 3 sets of items: [Set 0 (0..6), Set 1 (7..13), Set 2 (14..20)]
  // Center is anchored at Set 1 (index 7). When step reaches 7 (Set 2 index 14),
  // it seamlessly snaps back to Set 1 index 7 without any visual jump!
  const BASE_INDEX = total;

  const trackItems = useMemo(() => {
    const list: { item: ChainItem; uniqueKey: string; trackIdx: number }[] = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      items.forEach((item, originalIndex) => {
        const trackIdx = cycle * total + originalIndex;
        list.push({
          item,
          trackIdx,
          uniqueKey: `cycle-${cycle}-${item.id}-${originalIndex}`
        });
      });
    }
    return list;
  }, [items, total]);

  const [step, setStep] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Auto-scroll logic: advances step continuously
  const nextSlide = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, scrollSpeedMs);
    return () => clearInterval(interval);
  }, [nextSlide, scrollSpeedMs]);

  // Seamless Infinite Reset:
  // When step reaches `total` (7), after the 0.65s transition completes,
  // silently snap back to 0 in 0ms. Set 2 index 14 is 100% pixel-identical to Set 1 index 7!
  useEffect(() => {
    if (step >= total) {
      const timer = setTimeout(() => {
        setIsJumping(true);
        setStep(0);
      }, 660);
      return () => clearTimeout(timer);
    } else if (isJumping) {
      const raf = requestAnimationFrame(() => {
        setIsJumping(false);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [step, total, isJumping]);

  // Notify parent of active item change
  useEffect(() => {
    const activeRealIndex = (step % total + total) % total;
    if (onChainSelect) {
      onChainSelect(items[activeRealIndex].id, items[activeRealIndex].name);
    }
  }, [step, total, items, onChainSelect]);

  // Handle direct item selection
  const handleSelect = (clickedTrackIdx: number) => {
    const currentCenterTrackIdx = BASE_INDEX + step;
    const offset = clickedTrackIdx - currentCenterTrackIdx;
    setStep((prev) => prev + offset);
  };

  // Slot styling geometry (Curved arc mirroring left and right)
  const getSlotStyle = (offset: number) => {
    const absOffset = Math.abs(offset);
    
    // Opacity falloff from center (1.0 at center -> 0.75 -> 0.45 -> 0.20)
    const opacityMap: Record<number, number> = {
      0: 1.0,
      1: 0.75,
      2: 0.45,
      3: 0.20
    };
    const opacity = opacityMap[absOffset] ?? 0;

    // Scale falloff
    const scale = Math.max(0.75, 1 - absOffset * 0.05);

    // Outward X flare: top and bottom items flare far to the outside along X-axis
    const flareMap: Record<number, number> = {
      0: 0,
      1: 22,
      2: 58,
      3: 105
    };
    const outwardX = flareMap[absOffset] ?? 130;

    return { opacity, scale, outwardX, isCenter: offset === 0 };
  };

  // Active item in the center
  const activeRealIndex = (step % total + total) % total;
  const activeItem = items[activeRealIndex];
  const ActiveIcon = activeItem.icon;

  // Target Y position for the vertical track (anchored to center row at 150px)
  const trackTargetY = 3 * ROW_HEIGHT - (BASE_INDEX + step) * ROW_HEIGHT;

  return (
    <div 
      className={`relative w-full py-6 sm:py-12 md:py-16 select-none overflow-hidden ${className}`}
    >
      {/* ── Background Subtle Tech Dot Matrix Grid ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          backgroundImage: 'radial-gradient(#d1d5db 1.25px, transparent 1.25px)',
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Title (Clean & Minimal with Blue Heading, Balanced Mobile Spacing) ── */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12">
          <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 sm:mb-2">
            {t('home.features_label', 'Engine Architecture')}
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">
            {t('home.features_title', 'Why Choose MutualTransfer.lk?')}
          </h2>
        </div>

        {/* ── Main Mirrored Carousel Stage (Locked stable height on mobile to prevent footer icon jumping) ── */}
        <div className="relative h-[215px] sm:h-auto sm:min-h-[480px] py-2 sm:py-0 flex items-center justify-between">

          {/* ═════════════════════════════════════════════════════════
              LEFT WING (Seamless Infinite Upward Sliding Reel)
              Physically slides upward without blinking or stopping
             ═════════════════════════════════════════════════════════ */}
          <div className="hidden sm:block relative h-[434px] w-[24%] md:w-[25%] lg:w-[26%] z-20 overflow-hidden">
            <motion.div
              animate={{ y: trackTargetY }}
              transition={
                isJumping 
                  ? { duration: 0 } 
                  : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
              }
              className="w-full flex flex-col"
              style={{ willChange: 'transform' }}
            >
              {trackItems.map(({ item, uniqueKey, trackIdx }) => {
                const currentCenterTrackIdx = BASE_INDEX + step;
                const offset = trackIdx - currentCenterTrackIdx;
                const absOffset = Math.abs(offset);

                // Render invisible spacer for off-screen items to maintain physical track height
                if (absOffset > 4) {
                  return <div key={`left-spacer-${uniqueKey}`} style={{ height: ROW_HEIGHT }} />;
                }

                const { opacity, scale, outwardX, isCenter } = getSlotStyle(offset);
                const ItemIcon = item.icon;

                return (
                  <div
                    key={`left-${uniqueKey}`}
                    style={{ height: ROW_HEIGHT }}
                    className="flex items-center justify-end"
                  >
                    <motion.button
                      onClick={() => handleSelect(trackIdx)}
                      animate={{
                        x: -outwardX,
                        opacity,
                        scale
                      }}
                      transition={
                        isJumping 
                          ? { duration: 0 } 
                          : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                      }
                      className="flex items-center gap-3.5 group cursor-pointer text-right max-w-full"
                    >
                      <span 
                        className={`text-xs md:text-sm font-semibold tracking-tight transition-colors duration-300 truncate max-w-[130px] md:max-w-[160px] lg:max-w-[200px] ${
                          isCenter 
                            ? 'text-blue-600 font-bold' 
                            : 'text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        {item.name}
                      </span>

                      <div 
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isCenter 
                            ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-500/15' 
                            : 'bg-black text-white shadow-xs group-hover:scale-105'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
                      </div>
                    </motion.button>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              CENTER STAGE (Highlight Active Item)
              Shows Icon ONLY on Mobile; Pure Typography on Desktop
             ═════════════════════════════════════════════════════════ */}
          <div className="w-full sm:w-[50%] md:w-[48%] lg:w-[46%] h-full flex flex-col items-center justify-center text-center z-20 px-2 sm:px-6 lg:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -14 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center w-full max-w-md sm:max-w-lg lg:max-w-xl"
              >
                {/* Mobile-Only Active Icon (Visible ONLY on mobile, Hidden on Desktop/Tablet) */}
                <div className="block sm:hidden mb-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 ring-3 ring-blue-500/15 mx-auto">
                    <ActiveIcon className="w-6 h-6" />
                  </div>
                </div>

                {/* Center Main Text */}
                <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {activeItem.name}
                </h3>

                {/* Subtitle / Description (Reserved min-height to keep text baseline and layout stable) */}
                {activeItem.details && (
                  <p className="text-xs sm:text-base md:text-lg text-slate-500 font-normal mt-2 sm:mt-4 leading-relaxed max-w-xs sm:max-w-md mx-auto min-h-[44px] sm:min-h-[54px] flex items-center justify-center">
                    {activeItem.details}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ═════════════════════════════════════════════════════════
              RIGHT WING (Seamless Infinite Upward Sliding Reel)
              Physically slides upward without blinking or stopping
             ═════════════════════════════════════════════════════════ */}
          <div className="hidden sm:block relative h-[434px] w-[24%] md:w-[25%] lg:w-[26%] z-20 overflow-hidden">
            <motion.div
              animate={{ y: trackTargetY }}
              transition={
                isJumping 
                  ? { duration: 0 } 
                  : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
              }
              className="w-full flex flex-col"
              style={{ willChange: 'transform' }}
            >
              {trackItems.map(({ item, uniqueKey, trackIdx }) => {
                const currentCenterTrackIdx = BASE_INDEX + step;
                const offset = trackIdx - currentCenterTrackIdx;
                const absOffset = Math.abs(offset);

                // Render invisible spacer for off-screen items to maintain physical track height
                if (absOffset > 4) {
                  return <div key={`right-spacer-${uniqueKey}`} style={{ height: ROW_HEIGHT }} />;
                }

                const { opacity, scale, outwardX, isCenter } = getSlotStyle(offset);
                const ItemIcon = item.icon;

                return (
                  <div
                    key={`right-${uniqueKey}`}
                    style={{ height: ROW_HEIGHT }}
                    className="flex items-center justify-start"
                  >
                    <motion.button
                      onClick={() => handleSelect(trackIdx)}
                      animate={{
                        x: outwardX,
                        opacity,
                        scale
                      }}
                      transition={
                        isJumping 
                          ? { duration: 0 } 
                          : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                      }
                      className="flex items-center gap-3.5 group cursor-pointer text-left max-w-full"
                    >
                      <div 
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isCenter 
                            ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-500/15' 
                            : 'bg-black text-white shadow-xs group-hover:scale-105'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
                      </div>

                      <span 
                        className={`text-xs md:text-sm font-semibold tracking-tight transition-colors duration-300 truncate max-w-[130px] md:max-w-[160px] lg:max-w-[200px] ${
                          isCenter 
                            ? 'text-blue-600 font-bold' 
                            : 'text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        {item.name}
                      </span>
                    </motion.button>
                  </div>
                );
              })}
            </motion.div>
          </div>

        </div>

        {/* ── Mobile Fallback Node Selectors (Only visible on small mobile screens, balanced Y-gap) ── */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-5 sm:mt-6">
          {items.map((item, idx) => {
            const isCur = idx === activeRealIndex;
            const ItemIcon = item.icon;
            return (
              <button
                key={`mobile-dot-${item.id}`}
                onClick={() => {
                  const currentReal = activeRealIndex;
                  const diff = idx - currentReal;
                  setStep((prev) => prev + diff);
                }}
                aria-label={`Select ${item.name}`}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isCur 
                    ? 'bg-blue-600 text-white scale-110 shadow-sm' 
                    : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <ItemIcon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default ChainCarouselFeatures;
