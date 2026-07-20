export interface Invoice {
  client: string;
  number: string;
  amount: string;
}

export function InvoicesPanel({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-0.5 text-[14.5px] font-semibold">Последни поръчки</div>
      <div className="mb-4.5 text-[12.5px] text-ink-soft">
        Най-новите поръчки от Shopify.
      </div>
      {invoices.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center text-[13px] text-ink-soft">
          Все още няма поръчки.
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                Клиент
              </th>
              <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                Поръчка
              </th>
              <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                Сума
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.number + i} className={i < invoices.length - 1 ? "border-b border-border" : ""}>
                <td className="py-2.5 text-[13px]">{inv.client}</td>
                <td className="py-2.5 font-mono text-[12.5px] text-ink-mute">{inv.number}</td>
                <td className="py-2.5 text-right text-[13px] font-medium tabular">{inv.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
