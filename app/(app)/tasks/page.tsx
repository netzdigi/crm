import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { tasks, workflows, type TaskStatus } from "@/lib/data";

const statusTone: Record<TaskStatus, "neutral" | "accent" | "positive"> = {
  Предстояща: "neutral",
  "В процес": "accent",
  Завършена: "positive",
};

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Задачи и процеси"
        subtitle="Работни задачи на екипа и автоматизирани работни процеси."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Задачи</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">
            Активни задачи, подредени по краен срок.
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Задача
                </th>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Отговорник
                </th>
                <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
                  Статус
                </th>
                <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
                  Срок
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <tr key={task.title} className={i < tasks.length - 1 ? "border-b border-border" : ""}>
                  <td className="py-2.5 pr-3 text-[13px]">{task.title}</td>
                  <td className="py-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-surface dark:bg-accent dark:text-accent-ink">
                      {task.assignee}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <Badge tone={statusTone[task.status]}>{task.status}</Badge>
                  </td>
                  <td className="py-2.5 text-right font-mono text-[12px] text-ink-soft">
                    {task.due}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-surface px-6 py-5">
          <div className="mb-0.5 text-[14.5px] font-semibold">Автоматизирани процеси</div>
          <div className="mb-4.5 text-[12.5px] text-ink-soft">
            Правила, които действат вместо теб.
          </div>
          <div className="flex flex-col gap-4">
            {workflows.map((flow) => (
              <div key={flow.name} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-medium">{flow.name}</div>
                  <div className="text-[11.5px] text-ink-soft">{flow.trigger}</div>
                </div>
                <Badge tone={flow.active ? "positive" : "neutral"}>
                  {flow.active ? "Активен" : "На пауза"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
