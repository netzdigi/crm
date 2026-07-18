"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import {
  clients as initialClients,
  pipelines,
  type Client,
  type ClientStatus,
  type PipelineName,
} from "@/lib/data";
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
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const openClient = clients.find((c) => c.id === openClientId) ?? null;
  const draggedClient = clients.find((c) => c.id === draggedId) ?? null;

  function moveClient(id: string, status: ClientStatus) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  function updateNotes(id: string, notes: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {pipelines.map((pipeline) => {
          const pipelineClients = clients.filter((c) => c.pipeline === pipeline);

          return (
            <div key={pipeline} className="min-w-[600px] flex-1">
              <div className="mb-2.5 flex items-center gap-2 px-1">
                <span className="font-display text-[15px] font-semibold">{pipeline}</span>
                <span className="font-mono text-[11px] text-ink-mute">
                  {pipelineClients.length}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {columns.map((col) => {
                  const columnClients = pipelineClients.filter((c) => c.status === col.status);
                  const key = `${pipeline}:${col.status}`;
                  const isDragOver = dragOverKey === key;
                  const dropAllowed = !draggedClient || draggedClient.pipeline === pipeline;

                  return (
                    <div
                      key={col.status}
                      onDragOver={(e) => {
                        if (!dropAllowed) return;
                        e.preventDefault();
                        setDragOverKey(key);
                      }}
                      onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
                      onDrop={() => {
                        if (draggedId && dropAllowed) moveClient(draggedId, col.status);
                        setDraggedId(null);
                        setDragOverKey(null);
                      }}
                      className={`flex flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors duration-150 ${
                        isDragOver
                          ? "border-accent bg-accent-soft/40"
                          : !dropAllowed && draggedClient
                            ? "border-transparent opacity-40"
                            : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 px-1 py-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${columnAccent[col.status]}`} />
                        <span className="text-[11.5px] font-semibold">{col.label}</span>
                        <span className="font-mono text-[10.5px] text-ink-mute">
                          {columnClients.length}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {columnClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            draggable
                            onDragStart={() => setDraggedId(client.id)}
                            onDragEnd={() => {
                              setDraggedId(null);
                              setDragOverKey(null);
                            }}
                            onClick={() => setOpenClientId(client.id)}
                            className={`group flex flex-col items-start gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-shadow duration-150 hover:shadow-card cursor-pointer ${
                              draggedId === client.id ? "opacity-40" : ""
                            }`}
                          >
                            <div className="flex w-full items-start justify-between gap-2">
                              <span className="text-[12.5px] font-semibold leading-tight">
                                {client.company}
                              </span>
                              <GripVertical
                                size={12}
                                className="mt-0.5 flex-shrink-0 text-ink-mute opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                              />
                            </div>
                            <span className="text-[11.5px] text-ink-soft">{client.contact}</span>
                            <span className="font-mono text-[10.5px] text-ink-mute">
                              {client.lastContact}
                            </span>
                          </button>
                        ))}

                        {columnClients.length === 0 && (
                          <div className="rounded-lg border border-dashed border-border px-2.5 py-4 text-center text-[11px] text-ink-mute">
                            Няма клиенти тук
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
