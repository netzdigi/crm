import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { createCompanyAction } from "@/lib/actions/admin";
import { industries } from "@/lib/industries";

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader title="Нова фирма" subtitle="Създай работно пространство за нов клиент." />

      <form
        action={createCompanyAction}
        className="max-w-lg rounded-lg border border-border bg-surface px-6 py-5"
      >
        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-soft">Име на фирмата</span>
            <input
              name="name"
              type="text"
              required
              placeholder="напр. Северен вятър ЕООД"
              className="rounded-[8px] border border-border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus-visible:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-soft">
              Адрес (по избор, генерира се автоматично от името)
            </span>
            <input
              name="slug"
              type="text"
              placeholder="severen-vyatyr"
              className="rounded-[8px] border border-border bg-paper px-3 py-2 font-mono text-[13px] text-ink outline-none focus-visible:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-soft">Бранш</span>
            <select
              name="industry"
              defaultValue="other"
              className="rounded-[8px] border border-border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus-visible:border-accent"
            >
              {Object.entries(industries).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-soft">
              Clerk User ID на собственика (по избор)
            </span>
            <input
              name="ownerUserId"
              type="text"
              placeholder="user_..."
              className="rounded-[8px] border border-border bg-paper px-3 py-2 font-mono text-[13px] text-ink outline-none focus-visible:border-accent"
            />
            <span className="text-[11.5px] text-ink-soft">
              Намираш го в Clerk Dashboard → Users. Може да се добави и по-късно, докато
              автоматичната покана още не е готова.
            </span>
          </label>

          <Button variant="primary" type="submit" className="mt-1 self-start">
            Създай фирма
          </Button>
        </div>
      </form>
    </>
  );
}
