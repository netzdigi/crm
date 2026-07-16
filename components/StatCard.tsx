"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { StatMetric } from "@/lib/data";

export function StatCard({ metric, index }: { metric: StatMetric; index: number }) {
  const isUp = metric.trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-lg border border-border bg-surface px-5 py-4.5"
    >
      <div className="mb-4 text-[13px] text-ink-soft">{metric.label}</div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="mb-1.5 font-display text-[26px] font-semibold leading-none tabular">
            {metric.value}
          </div>
          <div
            className={`flex items-center gap-1 text-[12px] ${
              isUp ? "text-positive" : "text-negative"
            }`}
          >
            {isUp ? <ArrowUp size={11} strokeWidth={2.5} /> : <ArrowDown size={11} strokeWidth={2.5} />}
            {metric.trendLabel}
          </div>
        </div>

        <svg width="90" height="34" viewBox="0 0 100 36" className="flex-shrink-0">
          <path
            d={metric.sparkline}
            fill="none"
            stroke={isUp ? "var(--positive)" : "var(--negative)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={140}
            className="animate-draw-line"
            style={{ ["--dash" as string]: 140 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
