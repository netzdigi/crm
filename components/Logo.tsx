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
          d="M4 16.5h16M8 16.5a4 4 0 0 1 8 0"
          stroke="var(--surface)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.5v2M8.6 9l1.1 1.1M15.4 9l-1.1 1.1"
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
