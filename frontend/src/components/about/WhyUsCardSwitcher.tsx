import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import whyUsImg1 from '../../assets/aboutUs/image01.webp';
import whyUsImg2 from '../../assets/aboutUs/image02.webp';
import whyUsImg3 from '../../assets/aboutUs/image03.webp';

const WhyUsCardSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const whyUsCards = [
    {
      id: 0,
      number: "01",
      title: t('about_page.card1_title', 'Efficient Matching'),
      image: whyUsImg1,
    },
    {
      id: 1,
      number: "02",
      title: t('about_page.card2_title', 'Transparent Process'),
      image: whyUsImg2,
    },
    {
      id: 2,
      number: "03",
      title: t('about_page.card3_title', 'Government-Wide Network'),
      image: whyUsImg3,
    },
  ];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  // Auto-switch carousel interval
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((curr) => (curr + 1) % 3);
    }, 4200);

    return () => clearInterval(timer);
  }, [isPaused]);

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const nextCard = () => {
    setActiveIndex((curr) => (curr + 1) % 3);
  };

  const prevCard = () => {
    setActiveIndex((curr) => (curr + 2) % 3);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Diagonal Floating Stage with realistic depth & perspective */}
      <div 
        className="relative w-full max-w-lg h-[480px] sm:h-[530px] flex items-center justify-center select-none"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {whyUsCards.map((card, i) => {
          const diff = (i - activeIndex + 3) % 3;

          // Real physics spatial coordinates:
          // diff === 0: Center Front (active, scale: 1, z: 50px, rotate: 0)
          // diff === 1: Bottom-Right (next, scale: 0.68, z: -40px, rotate: 45deg with 3D tilt)
          // diff === 2: Top-Left (previous, scale: 0.68, z: -80px, rotate: -45deg with 3D tilt)
          let x = 0;
          let y = 0;
          let z = 0;
          let scale = 1;
          let rotate = 0;
          let rotateX = 0;
          let rotateY = 0;
          let zIndex = 30;
          let opacity = 1;
          let filter = 'brightness(100%)';
          let cursor = 'default';

          if (diff === 0) {
            // Front Center Card
            x = 0;
            y = 0;
            z = 50;
            scale = 1;
            rotate = 0;
            rotateX = 0;
            rotateY = 0;
            zIndex = 30;
            opacity = 1;
            filter = 'brightness(100%)';
            cursor = 'grab';
          } else if (diff === 1) {
            // Bottom-Right Card (next in deck)
            x = isMobile ? 80 : 130;
            y = isMobile ? 70 : 105;
            z = -40;
            scale = isMobile ? 0.66 : 0.68;
            rotate = 45;
            rotateX = -8;
            rotateY = 6;
            zIndex = 20;
            opacity = 0.90;
            filter = 'brightness(80%) contrast(96%)';
            cursor = 'pointer';
          } else if (diff === 2) {
            // Top-Left Card (previous in deck)
            x = isMobile ? -80 : -130;
            y = isMobile ? -70 : -105;
            z = -80;
            scale = isMobile ? 0.66 : 0.68;
            rotate = -45;
            rotateX = 8;
            rotateY = -6;
            zIndex = 10;
            opacity = 0.88;
            filter = 'brightness(78%) contrast(94%)';
            cursor = 'pointer';
          }

          return (
            <motion.div
              key={card.id}
              style={{ 
                transformStyle: 'preserve-3d',
                zIndex,
                cursor
              }}
              animate={{
                x,
                y,
                z,
                scale,
                rotate,
                rotateX,
                rotateY,
                opacity,
                filter,
              }}
              whileHover={
                diff === 0 
                  ? { 
                      scale: 1.025,
                      y: -4,
                      transition: { duration: 0.25, ease: "easeOut" } 
                    } 
                  : { 
                      scale: isMobile ? 0.70 : 0.72, 
                      filter: 'brightness(96%) contrast(100%)',
                      transition: { duration: 0.25, ease: "easeOut" }
                    }
              }
              transition={{
                // Natural organic physics: decoupled linear position and rotational momentum
                x: { type: "spring", stiffness: 140, damping: 18, mass: 1 },
                y: { type: "spring", stiffness: 140, damping: 18, mass: 1 },
                z: { type: "spring", stiffness: 140, damping: 18, mass: 1 },
                scale: { type: "spring", stiffness: 150, damping: 20, mass: 0.9 },
                rotate: { type: "spring", stiffness: 110, damping: 16, mass: 1.1 },
                rotateX: { type: "spring", stiffness: 110, damping: 16, mass: 1.1 },
                rotateY: { type: "spring", stiffness: 110, damping: 16, mass: 1.1 },
                opacity: { duration: 0.35, ease: "easeInOut" },
                filter: { duration: 0.35, ease: "easeInOut" },
              }}
              drag={diff === 0 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsPaused(true)}
              onDragEnd={(_e, info) => {
                setIsPaused(false);
                if (info.offset.x < -40) {
                  nextCard();
                } else if (info.offset.x > 40) {
                  prevCard();
                }
              }}
              onClick={() => {
                if (diff === 1) nextCard();
                if (diff === 2) prevCard();
              }}
              className={`group absolute w-[240px] sm:w-[285px] h-[300px] sm:h-[350px] rounded-3xl overflow-hidden transition-shadow duration-500 border-[3.5px] sm:border-[4.5px] border-white bg-slate-900 ${
                diff === 0 
                  ? 'shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35),0_12px_24px_-8px_rgba(30,58,138,0.25)] ring-1 ring-blue-500/20' 
                  : 'shadow-[0_15px_30px_-10px_rgba(15,23,42,0.3)] hover:shadow-2xl'
              }`}
            >
              {/* Image */}
              <img 
                src={card.image} 
                alt={card.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />

              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/35 to-transparent pointer-events-none" />

              {/* Realistic Gloss / Specular Light Reflection */}
              <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

              {/* Watermark Number */}
              <span className="text-5xl sm:text-6xl font-black opacity-30 absolute top-4 left-5 text-white pointer-events-none select-none font-mono">
                {card.number}
              </span>

              {/* Bottom Card Title */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 z-10">
                <p className="font-bold relative z-10 text-base sm:text-lg text-white drop-shadow-sm leading-snug">
                  {card.title}
                </p>
              </div>

              {/* Pulse Accent for Card 03 */}
              {card.id === 2 && (
                <div className="absolute top-5 right-5 w-14 h-14 bg-blue-500/20 rounded-full blur-xl animate-pulse pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Clean Carousel Controls */}
      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={prevCard}
          className="p-2 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-200/90 shadow-xs hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
          aria-label="Previous card"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          {whyUsCards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === i ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextCard}
          className="p-2 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-200/90 shadow-xs hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
          aria-label="Next card"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default WhyUsCardSwitcher;
