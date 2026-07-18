"use client";

import { useState } from "react";
import { GripVertical, Pencil, Plus, Check, X as XIcon } from "lucide-react";
import {
  clients as initialClients,
  initialPipelineBoards,
  type Client,
  type ClientStatus,
  type PipelineBoard,
} from "@/lib/data";
import { Badge } from "@/components/Badge";
import { ClientDetailPanel } from "@/components/ClientDetailPanel";

const statusTone: Record<ClientStatus, "positive" | "accent" | "neutral"> = {
  Активен: "positive",
  Нов: "accent",
  Неактивен: "neutral",
};

let boardCounter = 0;

export function ClientsKanban() {
  const [boards, setBoards] = useState<PipelineBoard[]>(initialPipelineBoards);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const openClient = clients.find((c) => c.id === openClientId) ?? null;

  function moveClientToBoard(id: string, boardId: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, boardId } : c)));
  }

  function updateNotes(id: string, notes: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
  }

  function startEditingBoard(board: PipelineBoard) {
    setEditingBoardId(board.id);
    setEditingName(board.name);
  }

  function commitBoardName() {
    const trimmed = editingName.trim();
    if (trimmed && editingBoardId) {
      setBoards((prev) =>
        prev.map((b) => (b.id === editingBoardId ? { ...b, name: trimmed } : b))
      );
    }
    setEditingBoardId(null);
  }

  function addBoard() {
    boardCounter += 1;
    const id = `board-${Date.now()}-${boardCounter}`;
    const board: PipelineBoard = { id, name: "Ново табло" };
    setBoards((prev) => [...prev, board]);
    setEditingBoardId(id);
    setEditingName("Ново табло");
  }

  return (
    <>
      <div className="flex items-start gap-4 overflow-x-auto pb-2">
        {boards.map((board) => {
          const boardClients = clients.filter((c) => c.boardId === board.id);
          const isDragOver = dragOverBoardId === board.id;
          const isEditing = editingBoardId === board.id;

          return (
            <div
              key={board.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverBoardId(board.id);
              }}
              onDragLeave={() => setDragOverBoardId((id) => (id === board.id ? null : id))}
              onDrop={() => {
                if (draggedId) moveClientToBoard(draggedId, board.id);
                setDraggedId(null);
                setDragOverBoardId(null);
              }}
              className={`group/board flex w-[280px] flex-shrink-0 flex-col gap-2.5 rounded-lg border border-dashed p-2.5 transition-colors duration-150 ${
                isDragOver ? "border-accent bg-accent-soft/40" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-1.5 px-1">
                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitBoardName();
                        if (e.key === "Escape") setEditingBoardId(null);
                      }}
                      className="min-w-0 flex-1 rounded-[6px] border border-accent bg-paper px-2 py-1 text-[13px] font-semibold text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={commitBoardName}
                      aria-label="Запази името"
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] text-positive hover:bg-active cursor-pointer"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBoardId(null)}
                      aria-label="Отказ"
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] text-ink-soft hover:bg-active cursor-pointer"
                    >
                      <XIcon size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 truncate text-[13px] font-semibold">{board.name}</span>
                    <span className="font-mono text-[10.5px] text-ink-mute">
                      {boardClients.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditingBoard(board)}
                      aria-label={`Преименувай ${board.name}`}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[6px] text-ink-mute opacity-0 transition-opacity duration-150 hover:bg-active hover:text-ink-soft group-hover/board:opacity-100 cursor-pointer"
                    >
                      <Pencil size={12} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {boardClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    draggable
                    onDragStart={() => setDraggedId(client.id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverBoardId(null);
                    }}
                    onClick={() => setOpenClientId(client.id)}
                    className={`group/card flex flex-col items-start gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-shadow duration-150 hover:shadow-card cursor-pointer ${
                      draggedId === client.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="text-[12.5px] font-semibold leading-tight">
                        {client.company}
                      </span>
                      <GripVertical
                        size={12}
                        className="mt-0.5 flex-shrink-0 text-ink-mute opacity-0 transition-opacity duration-150 group-hover/card:opacity-100"
                      />
                    </div>
                    <span className="text-[11.5px] text-ink-soft">{client.contact}</span>
                    <div className="flex w-full items-center justify-between gap-2">
                      <Badge tone={statusTone[client.status]}>{client.status}</Badge>
                      <span className="font-mono text-[10.5px] text-ink-mute">
                        {client.lastContact}
                      </span>
                    </div>
                  </button>
                ))}

                {boardClients.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border px-2.5 py-4 text-center text-[11px] text-ink-mute">
                    Няма клиенти тук
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addBoard}
          className="flex w-[280px] flex-shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-dashed border-border px-3 py-2.5 text-[13px] font-medium text-ink-soft transition-colors duration-150 hover:border-accent hover:bg-accent-soft/30 hover:text-accent cursor-pointer"
        >
          <Plus size={14} />
          Добави дъска
        </button>
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
