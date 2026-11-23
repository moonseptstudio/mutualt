import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  onAction?: () => void;
  actionLabel: string;
  periodLabel?: string;
  disabled?: boolean;
  laserBorder?: boolean;
}

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40, rotateX: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
  }
};

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  description,
  features,
  highlighted = false,
  onAction,
  actionLabel,
  periodLabel,
  disabled = false,
  laserBorder = false
}) => {
  const isFreeText = price.toLowerCase() === 'free';
  const displayPrice = isFreeText ? price : (price === '0' ? 'Rs. 0' : `Rs. ${price}`);

  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ scale: highlighted ? 1.04 : 1.02, y: -5 }}
      className={`relative p-8 rounded-3xl border transition-all duration-500 glass-panel-hover flex flex-col justify-between ${
        highlighted
          ? 'bg-blue-600 dark:bg-slate-900 text-white border-blue-600 dark:border-slate-800 shadow-2xl z-10'
          : laserBorder
            ? 'bg-white dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 border-sky-400/50 dark:border-sky-500/40 shadow-lg shadow-sky-500/10'
            : 'bg-white dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-sm'
      }`}
    >
      {laserBorder && (
        <div 
          className="pointer-events-none absolute inset-0 rounded-3xl overflow-visible z-20"
          style={{
            filter: 'drop-shadow(0 0 3px #0ea5e9) drop-shadow(0 0 6px rgba(56, 189, 248, 0.75))',
          }}
          aria-hidden="true"
        >
          <div className="laser-card-container">
            <div className="laser-card-tracer" />
          </div>
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className={`text-sm mb-6 ${highlighted ? 'text-blue-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
          {description}
        </p>
        <div className="flex items-baseline mb-8">
          <span className="text-4xl font-bold tracking-tight">{displayPrice}</span>
          <span className={`text-sm ml-2 ${highlighted ? 'text-blue-100/60' : 'text-slate-500 dark:text-slate-400'}`}>
            {periodLabel ? periodLabel : (price === "0" ? "/ forever" : "/ one-time")}
          </span>
        </div>
        <ul className="space-y-4 mb-10">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center space-x-3 text-sm font-medium">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                highlighted ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                <Check size={12} />
              </div>
              <span className={highlighted ? 'text-white' : 'text-slate-700 dark:text-slate-300'}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={disabled ? undefined : onAction}
        disabled={disabled}
        className={`w-full text-center py-4 rounded-2xl font-bold transition-all ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200/50 dark:border-slate-700/50'
            : highlighted
              ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl cursor-pointer active:scale-[0.98]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-[0.98]'
        }`}
      >
        {actionLabel}
      </button>
    </motion.div>
  );
};

export default PricingCard;

