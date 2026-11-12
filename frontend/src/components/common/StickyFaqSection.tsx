import React, { useRef, useState, useEffect } from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import faqBg from '../../assets/pricing/faqbg.webp';

export interface FaqItem {
  id?: string | number;
  question: string;
  answer: string;
  category?: string;
}

export interface StickyFaqSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  items: FaqItem[];
  bgImage?: string;
  supportLink?: string;
  supportTitle?: string;
  supportDesc?: string;
  supportActionLabel?: string;
  className?: string;
  id?: string;
}

const StickyCardItem: React.FC<{
  item: FaqItem;
  index: number;
  total: number;
  supportLink?: string;
  supportTitle?: string;
  supportDesc?: string;
  supportActionLabel?: string;
}> = ({
  item,
  index,
  total,
  supportLink,
  supportTitle,
  supportDesc,
  supportActionLabel,
}) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const isBlue = index % 2 === 1; // Cards 2 and 4 (index 1 & 3) have rich blue styling
  const isLast = index === total - 1; // 4th card
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (!isLast) return;

    const checkSticky = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const stickyThreshold = 4.75 * 16 + index * 56; // calc(4.75rem + index * 56px)
      // When card reaches its sticky line (with a 4px buffer)
      setIsStuck(rect.top <= stickyThreshold + 4);
    };

    window.addEventListener('scroll', checkSticky, { passive: true });
    window.addEventListener('resize', checkSticky);
    checkSticky();

    return () => {
      window.removeEventListener('scroll', checkSticky);
      window.removeEventListener('resize', checkSticky);
    };
  }, [isLast, index]);

  const handleClick = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div
      ref={cardRef}
      style={{
        // Staggered top offset so 56px of previous card header stays neatly visible
        top: `calc(4.75rem + ${index * 56}px)`,
        zIndex: 10 + index,
      }}
      className="sticky cursor-pointer transition-all duration-300 select-none"
      onClick={handleClick}
    >
      <div
        className={`relative overflow-hidden min-h-[230px] sm:min-h-[250px] flex flex-col justify-center py-10 sm:py-12 px-6 sm:px-9 rounded-3xl transition-all duration-300 group ${
          isBlue
            ? 'bg-linear-to-br from-blue-600 via-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/30 border border-blue-400/40 hover:border-blue-300 hover:shadow-blue-500/40'
            : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xl shadow-blue-950/5 dark:shadow-black/40 hover:border-blue-400/80 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl hover:shadow-blue-500/15'
        }`}
      >
        {/* Watermark Number in Top-Right Corner */}
        <div
          aria-hidden="true"
          className={`absolute top-3 right-5 sm:top-4 sm:right-7 text-5xl sm:text-6xl font-black font-mono tracking-tighter select-none pointer-events-none transition-all duration-300 ${
            isBlue
              ? 'text-white/15 group-hover:text-white/25'
              : 'text-slate-900/10 dark:text-white/10 group-hover:text-blue-600/20'
          }`}
        >
          0{index + 1}
        </div>

        {/* Card Content: If 4th card is stuck, its original FAQ content is removed and replaced by Support */}
        {isLast ? (
          <AnimatePresence mode="wait">
            {!isStuck ? (
              <motion.div
                key="faq-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="relative z-10 pr-12 sm:pr-14"
              >
                <h4 className="text-lg sm:text-xl font-bold mb-2.5 leading-snug text-white">
                  {item.question}
                </h4>
                <p className="text-sm sm:text-base font-sans leading-relaxed text-blue-50/95">
                  {item.answer}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="support-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative z-10 pr-10 sm:pr-12"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white border border-white/25 backdrop-blur-xs">
                    <HelpCircle size={14} className="text-blue-200" />
                    <span>{t('contact_page.support_badge', 'Support')}</span>
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
                  {supportTitle || 'Still have questions?'}
                </h4>

                <p className="text-sm sm:text-base text-blue-100 font-sans leading-relaxed mb-5 max-w-lg">
                  {supportDesc || 'Our support team is always ready to guide you.'}
                </p>

                <Link
                  to={supportLink || '/contact#contact-form'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-xl shadow-blue-950/20 hover:scale-[1.03] active:scale-[0.98] transition-all group/btn"
                >
                  <span>{supportActionLabel || 'Send a Message'}</span>
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="relative z-10 pr-12 sm:pr-14">
            <h4
              className={`text-lg sm:text-xl font-bold mb-2.5 leading-snug transition-colors ${
                isBlue
                  ? 'text-white group-hover:text-blue-100'
                  : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
            >
              {item.question}
            </h4>

            <p
              className={`text-sm sm:text-base font-sans leading-relaxed ${
                isBlue
                  ? 'text-blue-50/95'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StickyFaqSection: React.FC<StickyFaqSectionProps> = ({
  badge,
  title,
  subtitle,
  items,
  bgImage,
  supportLink = '/contact#contact-form',
  supportTitle,
  supportDesc,
  supportActionLabel,
  className = '',
  id = 'faq',
}) => {
  const { t } = useTranslation();

  return (
    <section id={id} className={`relative py-20 sm:py-24 bg-white dark:bg-slate-950 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Outer scroll wrapper that bounds the sticky scroll track */}
        <div className="relative">
          {/* ─── Layer 1: Fixed/Sticky Background Frame ─── */}
          {/* Stays fixed at top-16 sm:top-[68px] with a crisp, controlled height instead of stretching across the entire scroll track */}
          <div className="sticky top-16 sm:top-[68px] h-[580px] sm:h-[620px] lg:h-[640px] w-full rounded-[40px] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-blue-500/10 bg-slate-900/5 dark:bg-slate-950 overflow-hidden pointer-events-none z-0">
            {/* Crisp Background image with fixed aspect ratio */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url(${bgImage || faqBg})` }}
            />
            {/* Soft overlay gradients for high readability */}
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80 backdrop-blur-[2px] pointer-events-none" />
            <div className="absolute inset-0 bg-linear-to-b from-white/60 via-white/75 to-white/90 dark:from-slate-950/60 dark:via-slate-950/85 dark:to-slate-950/95 pointer-events-none" />
          </div>

          {/* ─── Layer 2: Foreground Content (Stacked Sticky Cards + Sticky Header) ─── */}
          <div className="relative z-10 -mt-[580px] sm:-mt-[620px] lg:-mt-[640px] p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* ─── Left Column: Sticky Header ─── */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6 pt-2">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200/60 dark:border-blue-700/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle size={14} className="text-blue-500" />
                  <span>{badge || t('contact_page.faq_badge', 'Help & FAQ')}</span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* ─── Right Column: Sticky Stacked Cards ─── */}
              <div className="lg:col-span-7 flex flex-col gap-8 sm:gap-10 pb-16 sm:pb-20">
                {items.map((item, index) => (
                  <StickyCardItem
                    key={item.id ?? index}
                    item={item}
                    index={index}
                    total={items.length}
                    supportLink={supportLink}
                    supportTitle={supportTitle}
                    supportDesc={supportDesc}
                    supportActionLabel={supportActionLabel}
                  />
                ))}

                {/* Extra Scroll Runway Spacer ensuring Card 4 stays firmly sticky */}
                <div className="h-[45vh] sm:h-[55vh] pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyFaqSection;
