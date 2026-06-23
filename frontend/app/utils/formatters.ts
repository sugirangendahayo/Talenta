// utils/formatters.ts

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function formatSalaryRange(min: number, max: number): string {
  const formatAmount = (amount: number) =>
    amount >= 1000 ? `$${(amount / 1000).toFixed(0)}k` : `$${amount}`;
  return `${formatAmount(min)} - ${formatAmount(max)}`;
}

export function getRelativeTimeLabel(dateString: string, t: TranslateFn): string {
  const elapsedSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (elapsedSeconds < 60) return t("time.justNow");
  if (elapsedSeconds < 3600) return t("time.minutesAgo", { count: Math.floor(elapsedSeconds / 60) });
  if (elapsedSeconds < 86400) return t("time.hoursAgo", { count: Math.floor(elapsedSeconds / 3600) });
  if (elapsedSeconds < 604800) return t("time.daysAgo", { days: Math.floor(elapsedSeconds / 86400) });
  return t("time.weeksAgo", { weeks: Math.floor(elapsedSeconds / 604800) });
}