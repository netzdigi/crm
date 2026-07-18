"use client";

import { useEffect } from "react";
import { X, Phone, Mail, Building2, StickyNote, RefreshCw, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/Badge";
import {
  clientCommunications,
  type Client,
  type ClientStatus,
  type CommunicationChannel,
} from "@/lib/data";

const statusTone: Record<ClientStatus, "positive" | "accent" | "neutral"> = {
  Активен: "positive",
  Нов: "accent",
  Неактивен: "neutral",
};

const channelIcon: Record<CommunicationChannel, typeof Mail> = {
  email: Mail,
  call: Phone,
  note: StickyNote,
};

export function ClientDetailPanel({
  client,
  onClose,
  onNotesChange,
}: {
  client: Client;
  onClose: () => void;
  onNotesChange: (notes: string) => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const thread = clientCommunications[client.id] ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-3 sm:p-6 lg:p-10"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-popover"
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-active text-ink-soft">
              <Building2 size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[17px] font-semibold leading-tight">
                  {client.company}
                </span>
                <Badge tone={statusTone[client.status]}>{client.status}</Badge>
              </div>
              <div className="text-[12.5px] text-ink-soft">{client.contact}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Затвори"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] text-ink-soft hover:bg-active cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col gap-5 overflow-y-auto border-b border-border p-6 lg:border-b-0 lg:border-r">
            <div>
              <div className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-mute">
                Контакт
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={`tel:${client.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 rounded-[8px] border border-border px-3 py-2.5 text-[13px] transition-colors duration-150 hover:bg-active"
                >
                  <Phone size={14} className="text-ink-soft" />
                  {client.phone}
                </a>
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-2.5 rounded-[8px] border border-border px-3 py-2.5 text-[13px] transition-colors duration-150 hover:bg-active"
                >
                  <Mail size={14} className="text-ink-soft" />
                  {client.email}
                </a>
              </div>
              <div className="mt-3 text-[11.5px] text-ink-mute">
                Последен контакт: {client.lastContact}
              </div>
            </div>

            <label className="flex flex-1 flex-col gap-1.5">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-mute">
                Бележки
              </span>
              <textarea
                value={client.notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Добави бележка за този клиент…"
                className="min-h-[160px] flex-1 resize-none rounded-[8px] border border-border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus-visible:border-accent"
              />
            </label>
          </div>

          <div className="flex flex-col overflow-y-auto p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[14.5px] font-semibold">Комуникация</div>
              <span className="flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
                <RefreshCw size={11} />
                Ще се синхронизира с Gmail
              </span>
            </div>

            {thread.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border px-6 py-10 text-center text-[13px] text-ink-soft">
                Все още няма история на комуникацията с този клиент.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {thread.map((entry) => {
                  const Icon = channelIcon[entry.channel];
                  const DirectionIcon = entry.direction === "incoming" ? ArrowDownLeft : ArrowUpRight;
                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-border bg-paper px-4 py-3.5"
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6.5 w-6.5 flex-shrink-0 items-center justify-center rounded-[6px] bg-active text-ink-soft">
                            <Icon size={13} strokeWidth={2} />
                          </div>
                          <span className="text-[13px] font-semibold leading-tight">
                            {entry.subject}
                          </span>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1 text-[11px] text-ink-mute">
                          <DirectionIcon size={11} />
                          {entry.time}
                        </div>
                      </div>
                      <div className="pl-8.5 text-[12.5px] leading-[1.5] text-ink-soft">
                        {entry.preview}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
