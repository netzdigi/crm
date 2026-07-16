export function Toggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {description && <div className="text-[11.5px] text-ink-soft">{description}</div>}
      </div>
      <span className="relative inline-flex h-[20px] w-[34px] flex-shrink-0 items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full border border-border bg-active transition-colors duration-150 peer-checked:border-ink peer-checked:bg-ink dark:peer-checked:border-accent dark:peer-checked:bg-accent" />
        <span className="absolute left-[2px] h-[16px] w-[16px] rounded-full bg-surface shadow-card transition-transform duration-150 peer-checked:translate-x-[14px]" />
      </span>
    </label>
  );
}
