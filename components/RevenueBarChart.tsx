"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { weeklyRevenue } from "@/lib/data";

export function RevenueBarChart() {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-0.5 flex items-center gap-2 text-[14.5px] font-semibold">
        Нетни приходи
        <span className="flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent">
          <ArrowUp size={9} strokeWidth={3} />
          66,9%
        </span>
      </div>
      <div className="mb-4.5 text-[12.5px] text-ink-soft">
        Дневни нетни приходи, последните 7 дни.
      </div>

      <div className="mb-2 flex h-[170px] items-end gap-3.5">
        {weeklyRevenue.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[11px] font-medium text-ink-soft tabular">{d.amount}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${d.heightPct}%` }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-[34px] rounded-t-[4px]"
              style={{
                background: "linear-gradient(180deg, var(--ink) 0%, var(--border) 100%)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-ink-mute">
        {weeklyRevenue.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}
