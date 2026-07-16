import { invoices } from "@/lib/data";

export function InvoicesPanel() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-0.5 text-[14.5px] font-semibold">Последни фактури</div>
      <div className="mb-4.5 text-[12.5px] text-ink-soft">
        Неплатени суми и статус на плащане.
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
              Клиент
            </th>
            <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
              Фактура
            </th>
            <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
              Сума
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={inv.number} className={i < invoices.length - 1 ? "border-b border-border" : ""}>
              <td className="py-2.5 text-[13px]">{inv.client}</td>
              <td className="py-2.5 font-mono text-[12.5px] text-ink-mute">{inv.number}</td>
              <td className="py-2.5 text-right text-[13px] font-medium tabular">{inv.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
