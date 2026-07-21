"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Pencil, Plus, Check, X as XIcon } from "lucide-react";
import type { Client, ClientCommunication, ClientStatus, PipelineBoard } from "@/lib/types";
import type { ClientOrderSummary } from "@/lib/db/queries";
import { Badge } from "@/components/Badge";
import { ClientDetailPanel } from "@/components/ClientDetailPanel";
import {
  addBoardAction,
  moveClientToBoardAction,
  renameBoardAction,
  updateClientNotesAction,
} from "@/lib/actions/clients";

const statusTone: Record<ClientStatus, "positive" | "accent" | "neutral"> = {
  Активен: "positive",
  Нов: "accent",
  Неактивен: "neutral",
};

const DRAG_THRESHOLD = 6;
const NOTES_SAVE_DELAY = 600;

interface DragState {
  id: string;
  startX: number;
  startY: number;
  moved: boolean;
  pointerId: number;
}

export function ClientsKanban({
  initialBoards,
  initialClients,
  communications,
  ordersByClient,
}: {
  initialBoards: PipelineBoard[];
  initialClients: Client[];
  communications: Record<string, ClientCommunication[]>;
  ordersByClient: Record<string, ClientOrderSummary[]>;
}) {
  const [boards, setBoards] = useState<PipelineBoard[]>(initialBoards);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const dragStateRef = useRef<DragState | null>(null);
  const notesSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => setBoards(initialBoards), [initialBoards]);
  useEffect(() => setClients(initialClients), [initialClients]);

  const openClient = clients.find((c) => c.id === openClientId) ?? null;
  const draggedClient = draggedId ? clients.find((c) => c.id === draggedId) ?? null : null;

  function moveClientToBoard(id: string, boardId: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, boardId } : c)));
    moveClientToBoardAction(id, boardId);
  }

  function updateNotes(id: string, notes: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
    if (notesSaveTimers.current[id]) clearTimeout(notesSaveTimers.current[id]);
    notesSaveTimers.current[id] = setTimeout(() => {
      updateClientNotesAction(id, notes);
    }, NOTES_SAVE_DELAY);
  }

  function startEditingBoard(board: PipelineBoard) {
    setEditingBoardId(board.id);
    setEditingName(board.name);
  }

  function commitBoardName() {
    const trimmed = editingName.trim();
    if (trimmed && editingBoardId) {
      const boardId = editingBoardId;
      setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, name: trimmed } : b)));
      renameBoardAction(boardId, trimmed);
    }
    setEditingBoardId(null);
  }

  async function addBoard() {
    const id = await addBoardAction("Ново табло");
    setBoards((prev) => [...prev, { id, name: "Ново табло" }]);
    setEditingBoardId(id);
    setEditingName("Ново табло");
  }

  function resetDrag() {
    dragStateRef.current = null;
    setDraggedId(null);
    setDragPos(null);
    setDragOverBoardId(null);
  }

  function handleCardPointerDown(e: React.PointerEvent<HTMLDivElement>, clientId: string) {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      id: clientId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      pointerId: e.pointerId,
    };
  }

  function handleCardPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== e.pointerId) return;

    if (!state.moved) {
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      state.moved = true;
      setDraggedId(state.id);
    }

    setDragPos({ x: e.clientX, y: e.clientY });
    const hovered = document.elementFromPoint(e.clientX, e.clientY);
    const boardEl = hovered?.closest<HTMLElement>("[data-board-id]");
    setDragOverBoardId(boardEl?.dataset.boardId ?? null);
  }

  function handleCardPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== e.pointerId) return;

    if (state.moved) {
      const hovered = document.elementFromPoint(e.clientX, e.clientY);
      const boardEl = hovered?.closest<HTMLElement>("[data-board-id]");
      const targetBoardId = boardEl?.dataset.boardId;
      if (targetBoardId) moveClientToBoard(state.id, targetBoardId);
    } else {
      setOpenClientId(state.id);
    }
    resetDrag();
  }

  function handleCardPointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId !== e.pointerId) return;
    resetDrag();
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
              data-board-id={board.id}
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
                  <div
                    key={client.id}
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => handleCardPointerDown(e, client.id)}
                    onPointerMove={handleCardPointerMove}
                    onPointerUp={handleCardPointerUp}
                    onPointerCancel={handleCardPointerCancel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenClientId(client.id);
                      }
                    }}
                    style={{ touchAction: "none", WebkitTouchCallout: "none" }}
                    className={`group/card flex select-none flex-col items-start gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-shadow duration-150 hover:shadow-card cursor-grab active:cursor-grabbing ${
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
                  </div>
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

      {draggedClient && dragPos && (
        <div
          className="pointer-events-none fixed z-[60] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-accent bg-surface px-3 py-2.5 text-[12.5px] font-semibold leading-tight text-ink shadow-popover"
          style={{ left: dragPos.x, top: dragPos.y }}
        >
          {draggedClient.company}
        </div>
      )}

      {openClient && (
        <ClientDetailPanel
          client={openClient}
          thread={communications[openClient.id] ?? []}
          orders={ordersByClient[openClient.id] ?? []}
          onClose={() => setOpenClientId(null)}
          onNotesChange={(notes) => updateNotes(openClient.id, notes)}
        />
      )}
    </>
  );
}
