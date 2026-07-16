import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-ink text-surface hover:opacity-90 dark:bg-accent dark:text-accent-ink",
  secondary: "border border-border text-ink-soft hover:bg-active",
  danger:
    "border border-negative/30 text-negative hover:bg-[color-mix(in_srgb,var(--negative)_10%,transparent)]",
} as const;

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-[8px] px-3.5 py-2 text-[12.5px] font-medium transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
