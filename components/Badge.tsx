const tones = {
  positive: "bg-[color-mix(in_srgb,var(--positive)_14%,transparent)] text-positive",
  negative: "bg-[color-mix(in_srgb,var(--negative)_14%,transparent)] text-negative",
  neutral: "bg-active text-ink-soft",
  accent: "bg-accent-soft text-accent",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
