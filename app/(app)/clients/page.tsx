import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { CommunicationsPanel } from "@/components/CommunicationsPanel";
import { clients, type ClientStatus } from "@/lib/data";

const statusTone: Record<ClientStatus, "positive" | "accent" | "neutral"> = {
  Активен: "positive",
  Нов: "accent",
  Неактивен: "neutral",
};

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Клиенти и комуникация"
        subtitle="Активни взаимоотношения и последен контакт."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Клиенти</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">
            Компании, с които работиш в момента.
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Компания
                </th>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Контактно лице
                </th>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Статус
                </th>
                <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                  Последен контакт
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c.company} className={i < clients.length - 1 ? "border-b border-border" : ""}>
                  <td className="py-2.5 text-[13px] font-medium">{c.company}</td>
                  <td className="py-2.5 text-[13px] text-ink-soft">{c.contact}</td>
                  <td className="py-2.5">
                    <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="py-2.5 text-right font-mono text-[12px] text-ink-soft">
                    {c.lastContact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CommunicationsPanel />
      </div>
    </>
  );
}
