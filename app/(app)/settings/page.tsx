import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Toggle } from "@/components/Toggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { workspaceSettings, notificationPreferences } from "@/lib/data";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Настройки" subtitle="Управлявай работното пространство и профила си." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Работно пространство</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">
            Основна информация за компанията ти.
          </div>
          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-ink-soft">Име на компанията</span>
              <input
                type="text"
                defaultValue={workspaceSettings.companyName}
                className="rounded-[8px] border border-border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-ink-soft">Език</span>
              <select
                defaultValue={workspaceSettings.language}
                className="rounded-[8px] border border-border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus-visible:border-accent"
              >
                <option>Български</option>
                <option>English</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-ink-soft">Часова зона</span>
              <select
                defaultValue={workspaceSettings.timezone}
                className="rounded-[8px] border border-border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus-visible:border-accent"
              >
                <option>Европа/София (UTC+3)</option>
                <option>Европа/Лондон (UTC+0)</option>
              </select>
            </label>
            <Button variant="primary" className="mt-1 self-start">
              Запази промените
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Облик и известия</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">
            Как изглежда и кога се обажда Vista.
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-medium">Тъмна тема</div>
                <div className="text-[11.5px] text-ink-soft">
                  Превключи между светъл и тъмен изглед.
                </div>
              </div>
              <ThemeToggle />
            </div>
            {notificationPreferences.map((n) => (
              <Toggle
                key={n.label}
                label={n.label}
                description={n.description}
                defaultChecked={n.enabled}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-negative/30 bg-surface px-6 py-5 lg:col-span-2">
          <div className="mb-0.5 flex items-center gap-1.5 text-[14.5px] font-semibold text-negative">
            <AlertTriangle size={15} /> Опасна зона
          </div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">Тези действия са необратими.</div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-medium">Изтриване на работното пространство</div>
              <div className="text-[11.5px] text-ink-soft">
                Всички данни ще бъдат изтрити безвъзвратно.
              </div>
            </div>
            <Button variant="danger">Изтрий работното пространство</Button>
          </div>
        </div>
      </div>
    </>
  );
}
