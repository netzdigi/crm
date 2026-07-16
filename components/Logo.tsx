export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[6px] bg-ink dark:bg-accent"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 3v18M12 7 5 9.5 12 12l7-2.5L12 7Z"
          stroke="var(--surface)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 9.5c0 2-1.2 3.4-1.2 3.4S5 14.2 6.5 12.4M19 9.5c0 2 1.2 3.4 1.2 3.4S17.5 14.2 16 12.4"
          stroke="var(--surface)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
