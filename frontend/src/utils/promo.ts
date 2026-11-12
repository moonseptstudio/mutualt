/**
 * Promo utility — "Upgrade FREE until May 31, 2026"
 * All promo logic is time-gated; the window ends at midnight June 1, 2026.
 */

export const PROMO_DEADLINE = new Date('2026-06-01T00:00:00+05:30');

export const isPromoActive = (): boolean => {
  return new Date() < PROMO_DEADLINE;
};

export const getPromoTimeRemaining = () => {
  const now = new Date();
  const diff = PROMO_DEADLINE.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
};
