import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ChannelChart } from "@/components/ChannelChart";
import { analyticsMetrics, channelPerformance } from "@/lib/data";
import { getDashboardData } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { channelRevenue } = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Анализи"
        subtitle="По-задълбочен поглед върху представянето на бизнеса."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsMetrics.map((metric, i) => (
          <StatCard key={metric.label} metric={metric} index={i} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ChannelChart channelRevenue={channelRevenue} />

        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Представяне по канал</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">
            Последните 30 дни, по приходи.
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Канал
                </th>
                <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                  Сесии
                </th>
                <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                  Реализация
                </th>
                <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                  Приходи
                </th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((row, i) => (
                <tr
                  key={row.channel}
                  className={i < channelPerformance.length - 1 ? "border-b border-border" : ""}
                >
                  <td className="py-2.5 text-[13px]">{row.channel}</td>
                  <td className="py-2.5 text-right font-mono text-[12px] text-ink-soft tabular">
                    {row.sessions}
                  </td>
                  <td className="py-2.5 text-right text-[13px] tabular">{row.conversion}</td>
                  <td className="py-2.5 text-right text-[13px] font-medium tabular">
                    {row.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
