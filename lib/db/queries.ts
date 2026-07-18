import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { getDb } from "./client";
import { clientCommunications, clients, pipelineBoards } from "./schema";
import type { Client, ClientCommunication, PipelineBoard } from "@/lib/types";
import { formatRelativeBg } from "@/lib/format";

const SHOPIFY_BOARD_ID = "shopify";
const SHOPIFY_BOARD_NAME = "Shopify";

export async function getBoards(): Promise<PipelineBoard[]> {
  const db = getDb();
  const rows = await db.select().from(pipelineBoards).orderBy(asc(pipelineBoards.createdAt));
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export async function getClientsWithCommunications(): Promise<{
  clients: Client[];
  communications: Record<string, ClientCommunication[]>;
}> {
  const db = getDb();
  const [clientRows, commRows] = await Promise.all([
    db.select().from(clients).orderBy(asc(clients.createdAt)),
    db.select().from(clientCommunications).orderBy(asc(clientCommunications.occurredAt)),
  ]);

  const now = new Date();
  const mappedClients: Client[] = clientRows.map((c) => ({
    id: c.id,
    company: c.company,
    contact: c.contact,
    phone: c.phone,
    email: c.email,
    status: c.status,
    boardId: c.boardId,
    lastContact: formatRelativeBg(c.lastContactAt, now),
    notes: c.notes,
  }));

  const communications: Record<string, ClientCommunication[]> = {};
  for (const row of commRows) {
    const entry: ClientCommunication = {
      id: row.id,
      channel: row.channel,
      direction: row.direction,
      subject: row.subject,
      preview: row.preview,
      time: formatRelativeBg(row.occurredAt, now),
    };
    (communications[row.clientId] ??= []).push(entry);
  }
  for (const list of Object.values(communications)) {
    list.reverse();
  }

  return { clients: mappedClients, communications };
}

export async function moveClientToBoard(id: string, boardId: string) {
  const db = getDb();
  await db.update(clients).set({ boardId }).where(eq(clients.id, id));
}

export async function updateClientNotes(id: string, notes: string) {
  const db = getDb();
  await db.update(clients).set({ notes }).where(eq(clients.id, id));
}

export async function renameBoard(id: string, name: string) {
  const db = getDb();
  await db.update(pipelineBoards).set({ name }).where(eq(pipelineBoards.id, id));
}

export async function createBoard(name: string): Promise<string> {
  const db = getDb();
  const id = randomUUID();
  await db.insert(pipelineBoards).values({ id, name });
  return id;
}

async function ensureShopifyBoard() {
  const db = getDb();
  await db
    .insert(pipelineBoards)
    .values({ id: SHOPIFY_BOARD_ID, name: SHOPIFY_BOARD_NAME })
    .onConflictDoNothing({ target: pipelineBoards.id });
}

export interface ShopifyCustomerPayload {
  shopifyCustomerId: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
}

// Upserts a client by Shopify customer id, auto-creating a dedicated
// "Shopify" board on first sync so incoming customers are easy to spot.
export async function upsertShopifyCustomer(payload: ShopifyCustomerPayload): Promise<string> {
  const db = getDb();
  await ensureShopifyBoard();

  const existing = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.shopifyCustomerId, payload.shopifyCustomerId))
    .limit(1);

  if (existing.length > 0) {
    const id = existing[0].id;
    await db
      .update(clients)
      .set({
        company: payload.company,
        contact: payload.contact,
        phone: payload.phone,
        email: payload.email,
        lastContactAt: new Date(),
      })
      .where(eq(clients.id, id));
    return id;
  }

  const id = randomUUID();
  await db.insert(clients).values({
    id,
    boardId: SHOPIFY_BOARD_ID,
    company: payload.company,
    contact: payload.contact,
    phone: payload.phone,
    email: payload.email,
    status: "Нов",
    source: "shopify",
    shopifyCustomerId: payload.shopifyCustomerId,
  });
  return id;
}

export async function findClientByShopifyCustomerId(shopifyCustomerId: string) {
  const db = getDb();
  const rows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.shopifyCustomerId, shopifyCustomerId))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function findClientByEmail(email: string) {
  const db = getDb();
  const rows = await db.select({ id: clients.id }).from(clients).where(eq(clients.email, email)).limit(1);
  return rows[0]?.id ?? null;
}

export async function logOrderNote(clientId: string, subject: string, preview: string) {
  const db = getDb();
  await db.insert(clientCommunications).values({
    id: randomUUID(),
    clientId,
    channel: "note",
    direction: "incoming",
    subject,
    preview,
  });
  await db.update(clients).set({ lastContactAt: new Date() }).where(eq(clients.id, clientId));
}
