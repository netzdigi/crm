import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { listCompaniesWithMemberCount } from "@/lib/db/queries";
import { industries } from "@/lib/industries";

export default async function AdminPage() {
  const companies = await listCompaniesWithMemberCount();

  return (
    <>
      <PageHeader
        title="Фирми"
        subtitle="Всички клиенти на Vista и техните работни пространства."
        action={
          <Link href="/admin/new">
            <Button variant="primary">
              <Plus size={13} /> Нова фирма
            </Button>
          </Link>
        }
      />

      <div className="rounded-lg border border-border bg-surface px-6 py-5">
        {companies.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-ink-soft">
            Все още няма добавени фирми.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Фирма
                </th>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Адрес
                </th>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Бранш
                </th>
                <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                  Членове
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr key={c.id} className={i < companies.length - 1 ? "border-b border-border" : ""}>
                  <td className="py-2.5 text-[13px] font-medium">{c.name}</td>
                  <td className="py-2.5 font-mono text-[12px] text-ink-soft">/{c.slug}</td>
                  <td className="py-2.5 text-[13px] text-ink-soft">{industries[c.industry].label}</td>
                  <td className="py-2.5 text-right text-[13px] tabular">{c.memberCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
