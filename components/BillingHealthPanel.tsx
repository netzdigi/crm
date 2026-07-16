import { Check } from "lucide-react";

export function BillingHealthPanel() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-0.5 text-[14.5px] font-semibold">Статус на фактуриране</div>
      <div className="mb-4.5 text-[12.5px] text-ink-soft">
        Нищо спешно не изисква вниманието ти.
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-border text-accent">
          <Check size={18} strokeWidth={2} />
        </div>
        <div className="font-display text-[15px] font-semibold leading-[1.4]">
          Всичко е
          <br />
          актуализирано.
        </div>
      </div>
    </div>
  );
}
