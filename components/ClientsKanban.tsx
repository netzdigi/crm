"use client";

import { useEffect, useState } from "react";
import { X, Phone, Mail, Building2, GripVertical } from "lucide-react";
import { clients as initialClients, type Client, type ClientStatus } from "@/lib/data";

const columns: { status: ClientStatus; label: string }[] = [
  { status: "Нов", label: "Нов" },
  { status: "Активен", label: "Активен" },
  { status: "Неактивен", label: "Неактивен" },
];

const columnAccent: Record<ClientStatus, string> = {
  Нов: "bg-accent",
  Активен: "bg-positive",
  Неактивен: "bg-ink-mute",
};

export function ClientsKanban() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ClientStatus | null>(null);

  const openClient = clients.find((c) => c.id === openClientId) ?? null;

  function moveClient(id: string, status: ClientStatus) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  function updateNotes(id: string, notes: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
  }

  useEffect(() => {
    if (!openClientId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenClientId(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openClientId]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const columnClients = clients.filter((c) => c.status === col.status);
          const isDragOver = dragOverStatus === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStatus(col.status);
              }}
              onDragLeave={() => setDragOverStatus((s) => (s === col.status ? null : s))}
              onDrop={() => {
                if (draggedId) moveClient(draggedId, col.status);
                setDraggedId(null);
                setDragOverStatus(null);
              }}
              className={`flex flex-col gap-2.5 rounded-lg border border-dashed p-2.5 transition-colors duration-150 ${
                isDragOver ? "border-accent bg-accent-soft/40" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 px-1.5 py-1">
                <span className={`h-1.5 w-1.5 rounded-full ${columnAccent[col.status]}`} />
                <span className="text-[12.5px] font-semibold">{col.label}</span>
                <span className="font-mono text-[11px] text-ink-mute">{columnClients.length}</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {columnClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    draggable
                    onDragStart={() => setDraggedId(client.id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverStatus(null);
                    }}
                    onClick={() => setOpenClientId(client.id)}
                    className={`group flex flex-col items-start gap-2 rounded-lg border border-border bg-surface px-3.5 py-3 text-left transition-shadow duration-150 hover:shadow-card cursor-pointer ${
                      draggedId === client.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="text-[13px] font-semibold leading-tight">
                        {client.company}
                      </span>
                      <GripVertical
                        size={13}
                        className="mt-0.5 flex-shrink-0 text-ink-mute opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      />
                    </div>
                    <span className="text-[12px] text-ink-soft">{client.contact}</span>
                    <span className="font-mono text-[11px] text-ink-mute">{client.lastContact}</span>
                  </button>
                ))}

                {columnClients.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border px-3.5 py-6 text-center text-[12px] text-ink-mute">
                    Няма клиенти тук
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {openClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={() => setOpenClientId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-popover"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-active text-ink-soft">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="text-[14.5px] font-semibold leading-tight">
                    {openClient.company}
                  </div>
                  <div className="text-[12px] text-ink-soft">{openClient.contact}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenClientId(null)}
                aria-label="Затвори"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] text-ink-soft hover:bg-active cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mb-4 flex flex-col gap-2.5">
              <a
                href={`tel:${openClient.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 rounded-[8px] border border-border px-3 py-2.5 text-[13px] transition-colors duration-150 hover:bg-active"
              >
                <Phone size={14} className="text-ink-soft" />
                {openClient.phone}
              </a>
              <a
                href={`mailto:${openClient.email}`}
                className="flex items-center gap-2.5 rounded-[8px] border border-border px-3 py-2.5 text-[13px] transition-colors duration-150 hover:bg-active"
              >
                <Mail size={14} className="text-ink-soft" />
                {openClient.email}
              </a>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-ink-soft">Бележки</span>
              <textarea
                value={openClient.notes}
                onChange={(e) => updateNotes(openClient.id, e.target.value)}
                rows={4}
                placeholder="Добави бележка за този клиент…"
                className="resize-none rounded-[8px] border border-border bg-paper px-3 py-2 text-[13px] text-ink outline-none focus-visible:border-accent"
              />
            </label>
          </div>
        </div>
      )}
    </>
  );
}
