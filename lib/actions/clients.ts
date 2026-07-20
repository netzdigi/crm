"use server";

import { revalidatePath } from "next/cache";
import {
  createBoard as createBoardQuery,
  moveClientToBoard as moveClientToBoardQuery,
  renameBoard as renameBoardQuery,
  updateClientNotes as updateClientNotesQuery,
} from "@/lib/db/queries";

export async function moveClientToBoardAction(clientId: string, boardId: string) {
  await moveClientToBoardQuery(clientId, boardId);
  revalidatePath("/clients");
}

export async function updateClientNotesAction(clientId: string, notes: string) {
  await updateClientNotesQuery(clientId, notes);
  revalidatePath("/clients");
}

export async function renameBoardAction(boardId: string, name: string) {
  await renameBoardQuery(boardId, name);
  revalidatePath("/clients");
}

export async function addBoardAction(name: string) {
  const id = await createBoardQuery(name);
  revalidatePath("/clients");
  return id;
}
