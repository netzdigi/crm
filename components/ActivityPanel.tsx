import { FileText, UserPlus, Mail } from "lucide-react";
import { activity } from "@/lib/data";

const iconMap = {
  invoice: FileText,
  user: UserPlus,
  mail: Mail,
};

export function ActivityPanel() {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-0.5 text-[14.5px] font-semibold">Активност</div>
      <div className="mb-4.5 text-[12.5px] text-ink-soft">
        Най-новото от работното ти пространство.
      </div>
      <div className="flex flex-col gap-4">
        {activity.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <div key={item.text} className="flex items-start gap-2.5">
              <div className="flex h-6.5 w-6.5 flex-shrink-0 items-center justify-center rounded-[6px] bg-active text-ink-soft">
                <Icon size={13} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[13px] leading-[1.4]">{item.text}</div>
                <div className="text-[11.5px] text-ink-mute">{item.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
