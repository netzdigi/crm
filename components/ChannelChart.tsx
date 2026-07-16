import { ArrowUp } from "lucide-react";
import { channelDateLabels } from "@/lib/data";

export function ChannelChart() {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-0.5 flex items-center gap-2 text-[14.5px] font-semibold">
        Приходи по канал
        <span className="flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent">
          <ArrowUp size={9} strokeWidth={3} />
          58,3%
        </span>
      </div>
      <div className="mb-3.5 text-[12.5px] text-ink-soft">
        Дневни продажби по канал, последните 7 дни.
      </div>

      <div className="mb-3.5 flex gap-4">
        <span className="flex items-center gap-1.5 text-[12px] text-ink-soft">
          <span className="h-[7px] w-[7px] rounded-full bg-ink" />
          Онлайн магазин
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-ink-soft">
          <span className="h-[7px] w-[7px] rounded-full bg-accent" />
          Физически магазин
        </span>
      </div>

      <svg width="100%" height="170" viewBox="0 0 430 170" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 55, 90, 125, 160].map((y) => (
          <line key={y} x1="30" y1={y} x2="430" y2={y} stroke="var(--border)" strokeWidth="1" />
        ))}
        <g fontSize="10" fontFamily="var(--font-mono)" textAnchor="end" fill="var(--ink-mute)">
          <text x="24" y="23">80</text>
          <text x="24" y="58">60</text>
          <text x="24" y="93">40</text>
          <text x="24" y="128">20</text>
          <text x="24" y="163">0</text>
        </g>
        <path
          d="M40,130 Q103,120 135,105 Q167,90 198.5,92.5 Q230,95 261.5,77.5 Q293,60 325,62.5 Q357,65 388.5,45 L420,25 L420,160 L40,160 Z"
          fill="url(#revGrad)"
        />
        <path
          d="M40,145 Q103,140 135,132.5 Q167,125 198.5,127.5 Q230,130 261.5,120 Q293,110 325,112.5 Q357,115 388.5,105 L420,95"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40,130 Q103,120 135,105 Q167,90 198.5,92.5 Q230,95 261.5,77.5 Q293,60 325,62.5 Q357,65 388.5,45 L420,25"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="420" cy="25" r="4" fill="var(--ink)" />
        <circle cx="420" cy="95" r="4" fill="var(--accent)" />
        <g fontSize="11" fontWeight="600" fontFamily="var(--font-sans)">
          <text x="410" y="18" textAnchor="end" fill="var(--ink)">72</text>
          <text x="410" y="112" textAnchor="end" fill="var(--accent)">38</text>
        </g>
      </svg>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink-mute">
        {channelDateLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
