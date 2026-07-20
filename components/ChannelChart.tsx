export interface ChannelRevenue {
  channel: string;
  amount: string;
  pct: number;
}

const channelDotColor: Record<string, string> = {
  "Facebook/Instagram": "#1877F2",
  Google: "#EA4335",
  TikTok: "#25F4EE",
  Директно: "var(--ink)",
  "Физически магазин": "var(--accent)",
};

export function ChannelChart({ channelRevenue }: { channelRevenue: ChannelRevenue[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-0.5 text-[14.5px] font-semibold">Приходи по канал</div>
      <div className="mb-4.5 text-[12.5px] text-ink-soft">
        Разбивка на приходите по източник на поръчката, последните 7 дни.
      </div>

      {channelRevenue.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13px] text-ink-soft">
          Все още няма поръчки за сравнение по канал.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {channelRevenue.map((c) => (
            <div key={c.channel} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="flex items-center gap-1.5 text-ink-soft">
                  <span
                    className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
                    style={{ background: channelDotColor[c.channel] ?? "var(--ink-mute)" }}
                  />
                  {c.channel}
                </span>
                <span className="font-medium tabular">{c.amount}</span>
              </div>
              <div className="h-[6px] w-full overflow-hidden rounded-full bg-active">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(c.pct, 2)}%`,
                    background: channelDotColor[c.channel] ?? "var(--ink-mute)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
