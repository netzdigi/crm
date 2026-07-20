import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { RevenueBarChart } from "@/components/RevenueBarChart";
import { ChannelChart } from "@/components/ChannelChart";
import { InvoicesPanel } from "@/components/InvoicesPanel";
import { BillingHealthPanel } from "@/components/BillingHealthPanel";
import { ActivityPanel } from "@/components/ActivityPanel";
import { getDashboardData, type DashboardRange } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const PERIOD_OPTIONS = [7, 30, 90];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;

  const isCustomRange = Boolean(params.from && params.to);
  let range: DashboardRange;
  if (isCustomRange) {
    range = { from: new Date(`${params.from}T00:00:00`), to: new Date(`${params.to}T00:00:00`) };
  } else {
    const requested = Number(params.days);
    range = { days: PERIOD_OPTIONS.includes(requested) ? requested : 7 };
  }

  const { metrics, weeklyRevenue, channelRevenue, recentOrders, activity } = await getDashboardData(range);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <form action="/" className="flex items-center gap-1.5">
          <input
            type="date"
            name="from"
            defaultValue={params.from ?? ""}
            className="rounded-[7px] border border-border bg-surface px-2 py-1.5 text-[12.5px] text-ink outline-none focus-visible:border-accent"
          />
          <span className="text-[12px] text-ink-mute">–</span>
          <input
            type="date"
            name="to"
            defaultValue={params.to ?? ""}
            className="rounded-[7px] border border-border bg-surface px-2 py-1.5 text-[12.5px] text-ink outline-none focus-visible:border-accent"
          />
          <button
            type="submit"
            className="rounded-[7px] bg-ink px-3 py-1.5 text-[12.5px] font-medium text-surface transition-colors duration-150 hover:opacity-90 dark:bg-accent dark:text-accent-ink cursor-pointer"
          >
            Приложи
          </button>
        </form>

        <div className="flex items-center gap-1">
          {PERIOD_OPTIONS.map((d) => (
            <Link
              key={d}
              href={d === 7 ? "/" : `/?days=${d}`}
              className={`rounded-[7px] px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 ${
                !isCustomRange && d === range.days ? "bg-active text-ink" : "text-ink-soft hover:bg-active/60"
              }`}
            >
              {d} дни
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, i) => (
          <StatCard key={metric.label} metric={metric} index={i} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueBarChart weeklyRevenue={weeklyRevenue} />
        <ChannelChart channelRevenue={channelRevenue} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr_1.1fr]">
        <InvoicesPanel invoices={recentOrders} />
        <BillingHealthPanel />
        <ActivityPanel activity={activity} />
      </div>
    </>
  );
}
