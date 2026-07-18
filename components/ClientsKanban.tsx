"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { clients as initialClients, type Client, type ClientStatus } from "@/lib/data";
import { ClientDetailPanel } from "@/components/ClientDetailPanel";

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
        <ClientDetailPanel
          client={openClient}
          onClose={() => setOpenClientId(null)}
          onNotesChange={(notes) => updateNotes(openClient.id, notes)}
        />
      )}
    </>
  );
}
