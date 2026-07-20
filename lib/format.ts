export function formatRelativeBg(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "току-що";
  if (diffMin < 60) return `Преди ${diffMin} мин`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `Преди ${diffHours} ч`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `Преди ${diffDays} дни`;

  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 5) return `Преди ${diffWeeks} седмици`;

  const diffMonths = Math.round(diffDays / 30);
  return `Преди ${diffMonths} месеца`;
}
