import { Check, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { currentPlan, paymentMethod, billingHistory, type BillingStatus } from "@/lib/data";

const statusTone: Record<BillingStatus, "positive" | "accent" | "negative"> = {
  Платена: "positive",
  Предстояща: "accent",
  Неуспешна: "negative",
};

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Фактуриране"
        subtitle="Абонамент, начин на плащане и история на плащанията."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Текущ план</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">{currentPlan.renews}</div>
          <div className="mb-4 flex items-end gap-1.5">
            <span className="font-display text-[26px] font-semibold leading-none">
              {currentPlan.price}
            </span>
            <span className="pb-0.5 text-[13px] text-ink-soft">{currentPlan.cycle}</span>
          </div>
          <ul className="mb-4.5 flex flex-col gap-2">
            {currentPlan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-[13px] text-ink-soft">
                <Check size={13} className="text-accent" /> {f}
              </li>
            ))}
          </ul>
          <Button variant="secondary">Промени плана</Button>
        </div>

        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Начин на плащане</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">
            Картата, с която се таксува абонаментът.
          </div>
          <div className="mb-4.5 flex items-center gap-3 rounded-[8px] border border-border px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-active text-ink-soft">
              <CreditCard size={16} />
            </div>
            <div>
              <div className="text-[13px] font-medium">
                {paymentMethod.brand} •••• {paymentMethod.last4}
              </div>
              <div className="text-[11.5px] text-ink-soft">
                Изтича {paymentMethod.expiry} · {paymentMethod.name}
              </div>
            </div>
          </div>
          <Button variant="secondary">Актуализирай начина на плащане</Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface px-6 py-5">
        <div className="mb-0.5 text-[14.5px] font-semibold">История на плащанията</div>
        <div className="mb-4.5 text-[12.5px] text-ink-soft">
          Последните транзакции по абонамента.
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                Дата
              </th>
              <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                Описание
              </th>
              <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                Статус
              </th>
              <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                Сума
              </th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((row, i) => (
              <tr
                key={`${row.date}-${row.description}`}
                className={i < billingHistory.length - 1 ? "border-b border-border" : ""}
              >
                <td className="py-2.5 font-mono text-[12px] text-ink-soft">{row.date}</td>
                <td className="py-2.5 text-[13px]">{row.description}</td>
                <td className="py-2.5">
                  <Badge tone={statusTone[row.status]}>{row.status}</Badge>
                </td>
                <td className="py-2.5 text-right text-[13px] font-medium tabular">
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
