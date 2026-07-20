import { randomUUID } from "node:crypto";
import { asc, desc, eq, gte } from "drizzle-orm";
import { getDb } from "./client";
import { clientCommunications, clients, orders, pipelineBoards } from "./schema";
import type { Client, ClientCommunication, PipelineBoard } from "@/lib/types";
import type { StatMetric } from "@/lib/data";
import { formatRelativeBg } from "@/lib/format";

const SHOPIFY_BOARD_ID = "shopify";
const SHOPIFY_BOARD_NAME = "Versendet";

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
    address: c.address,
    marketingStatus: c.marketingStatus,
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
  address: string;
  marketingStatus: string;
}

// Upserts a client by Shopify customer id, auto-creating a dedicated
// "Versendet" board on first sync so incoming customers are easy to spot.
// Only customers who have actually ordered should land in the CRM — pass
// onlyUpdateExisting=true for events that don't guarantee an order (e.g.
// customers/create, customers/update), so a brand-new, order-less customer
// is never inserted, only refreshed if already present from a real order.
//
// The onlyUpdateExisting=false path is a single atomic
// INSERT ... ON CONFLICT DO UPDATE (not a separate select-then-branch), so
// it stays correct when the backfill route processes many orders for the
// same repeat customer concurrently.
export async function upsertShopifyCustomer(
  payload: ShopifyCustomerPayload,
  onlyUpdateExisting = false
): Promise<string | null> {
  const db = getDb();

  if (onlyUpdateExisting) {
    const existing = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.shopifyCustomerId, payload.shopifyCustomerId))
      .limit(1);
    if (existing.length === 0) return null;

    const id = existing[0].id;
    await db
      .update(clients)
      .set({
        company: payload.company,
        contact: payload.contact,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        marketingStatus: payload.marketingStatus,
        lastContactAt: new Date(),
      })
      .where(eq(clients.id, id));
    return id;
  }

  await ensureShopifyBoard();
  const [row] = await db
    .insert(clients)
    .values({
      id: randomUUID(),
      boardId: SHOPIFY_BOARD_ID,
      company: payload.company,
      contact: payload.contact,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      marketingStatus: payload.marketingStatus,
      status: "Нов",
      source: "shopify",
      shopifyCustomerId: payload.shopifyCustomerId,
    })
    .onConflictDoUpdate({
      target: clients.shopifyCustomerId,
      set: {
        company: payload.company,
        contact: payload.contact,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        marketingStatus: payload.marketingStatus,
        lastContactAt: new Date(),
      },
    })
    .returning({ id: clients.id });

  return row.id;
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

// noteId defaults to a fresh id, but callers that might run twice for the
// same order (e.g. the backfill route) should pass a deterministic one so
// re-running it doesn't duplicate the note.
export async function logOrderNote(
  clientId: string,
  subject: string,
  preview: string,
  noteId: string = randomUUID()
) {
  const db = getDb();
  await db
    .insert(clientCommunications)
    .values({ id: noteId, clientId, channel: "note", direction: "incoming", subject, preview })
    .onConflictDoNothing({ target: clientCommunications.id });
  await db.update(clients).set({ lastContactAt: new Date() }).where(eq(clients.id, clientId));
}

export interface OrderPayload {
  shopifyOrderId: string;
  clientId: string | null;
  name: string;
  totalPrice: number;
  currency: string;
  channel: string;
  occurredAt: Date;
}

// Idempotent by Shopify order id, so webhook redelivery or a re-run backfill
// never double-counts an order in the revenue numbers.
export async function upsertOrder(payload: OrderPayload) {
  const db = getDb();
  await db
    .insert(orders)
    .values({
      id: payload.shopifyOrderId,
      clientId: payload.clientId,
      name: payload.name,
      totalPrice: payload.totalPrice.toFixed(2),
      currency: payload.currency,
      channel: payload.channel,
      occurredAt: payload.occurredAt,
    })
    .onConflictDoUpdate({
      target: orders.id,
      set: {
        clientId: payload.clientId,
        name: payload.name,
        totalPrice: payload.totalPrice.toFixed(2),
        currency: payload.currency,
        channel: payload.channel,
      },
    });
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS_BG = ["Нед", "Пон", "Вт", "Ср", "Чет", "Пет", "Съб"];

function formatMoney(amount: number, currency = "EUR"): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return currency === "EUR" ? `${formatted} €` : `${formatted} ${currency}`;
}

function buildSparkline(values: number[]): string {
  if (values.length === 0) return "M2,18 L98,18";
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = 96 / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => {
    const x = 2 + i * stepX;
    const y = 32 - ((v - min) / range) * 28;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${points.join(" L")}`;
}

function pctChange(curr: number, prev: number): { trend: "up" | "down"; label: string } {
  if (prev === 0) {
    return curr === 0
      ? { trend: "up", label: "без промяна спрямо предходния период" }
      : { trend: "up", label: "ново спрямо предходния период" };
  }
  const pct = ((curr - prev) / prev) * 100;
  return {
    trend: pct >= 0 ? "up" : "down",
    label: `${Math.abs(pct).toFixed(1)}% спрямо предходния период`,
  };
}

export interface DashboardData {
  metrics: StatMetric[];
  weeklyRevenue: { day: string; amount: string; heightPct: number }[];
  channelRevenue: { channel: string; amount: string; pct: number }[];
  recentOrders: { client: string; number: string; amount: string }[];
  activity: { icon: "invoice" | "user"; text: string; time: string }[];
}

interface Bucket {
  label: string;
  start: Date;
  end: Date;
}

// For up to 14 days, one bucket per calendar day (weekday label). Beyond
// that, ~10 evenly-sized buckets with a short date label — the bar chart
// has no room for 90 individual daily bars.
function buildBuckets(now: Date, days: number): Bucket[] {
  if (days <= 14) {
    return Array.from({ length: days }, (_, i) => {
      const start = new Date(now.getTime() - (days - 1 - i) * DAY_MS);
      return { label: DAY_LABELS_BG[start.getDay()], start, end: new Date(start.getTime() + DAY_MS) };
    });
  }

  const bucketCount = 10;
  const bucketMs = (days * DAY_MS) / bucketCount;
  const rangeStart = new Date(now.getTime() - days * DAY_MS);
  return Array.from({ length: bucketCount }, (_, i) => {
    const start = new Date(rangeStart.getTime() + i * bucketMs);
    const end = new Date(rangeStart.getTime() + (i + 1) * bucketMs);
    return { label: `${start.getDate()}.${start.getMonth() + 1}`, start, end };
  });
}

// Everything the dashboard homepage needs, computed from real Shopify
// orders/clients instead of static mock data. Degrades gracefully to
// zeros/empty lists before any orders have synced. `days` is the current
// comparison period; the same length immediately before it is used as the
// "previous period" for trend percentages.
export async function getDashboardData(days = 7): Promise<DashboardData> {
  const db = getDb();
  const now = new Date();
  const since = new Date(now.getTime() - days * 2 * DAY_MS);
  const currentStart = new Date(now.getTime() - days * DAY_MS);

  const [orderRows, recentClientRows, recentOrderRows] = await Promise.all([
    db.select().from(orders).where(gte(orders.occurredAt, since)).orderBy(asc(orders.occurredAt)),
    db
      .select({ id: clients.id, company: clients.company, createdAt: clients.createdAt })
      .from(clients)
      .where(gte(clients.createdAt, since)),
    db
      .select({
        number: orders.name,
        amount: orders.totalPrice,
        currency: orders.currency,
        occurredAt: orders.occurredAt,
        company: clients.company,
      })
      .from(orders)
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .orderBy(desc(orders.occurredAt))
      .limit(5),
  ]);

  const currentOrders = orderRows.filter((o) => o.occurredAt >= currentStart);
  const previousOrders = orderRows.filter((o) => o.occurredAt < currentStart);
  const currentClients = recentClientRows.filter((c) => c.createdAt >= currentStart);
  const previousClients = recentClientRows.filter((c) => c.createdAt < currentStart);

  const sumRevenue = (rows: typeof orderRows) =>
    rows.reduce((acc, o) => acc + Number(o.totalPrice), 0);

  const currentRevenue = sumRevenue(currentOrders);
  const previousRevenue = sumRevenue(previousOrders);
  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;
  const currentAvg = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const previousAvg = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
  const currentNewCustomers = currentClients.length;
  const previousNewCustomers = previousClients.length;

  const buckets = buildBuckets(now, days);
  const inBucket = (d: Date, b: Bucket) => d >= b.start && d < b.end;

  const revenueSeries = buckets.map((b) =>
    currentOrders.filter((o) => inBucket(o.occurredAt, b)).reduce((acc, o) => acc + Number(o.totalPrice), 0)
  );
  const orderSeries = buckets.map((b) => currentOrders.filter((o) => inBucket(o.occurredAt, b)).length);
  const customerSeries = buckets.map(
    (b) => currentClients.filter((c) => inBucket(c.createdAt, b)).length
  );
  const avgSeries = buckets.map((_, i) => (orderSeries[i] > 0 ? revenueSeries[i] / orderSeries[i] : 0));

  const maxBucketRevenue = Math.max(1, ...revenueSeries);
  const weeklyRevenue = buckets.map((b, i) => ({
    day: b.label,
    amount: formatMoney(revenueSeries[i]),
    heightPct: Math.round((revenueSeries[i] / maxBucketRevenue) * 100),
  }));

  const periodLabel = `${days} дни`;
  const revenueTrend = pctChange(currentRevenue, previousRevenue);
  const ordersTrend = pctChange(currentOrderCount, previousOrderCount);
  const customersTrend = pctChange(currentNewCustomers, previousNewCustomers);
  const avgTrend = pctChange(currentAvg, previousAvg);

  const metrics: StatMetric[] = [
    {
      label: `Приходи (${periodLabel})`,
      value: formatMoney(currentRevenue),
      trendLabel: revenueTrend.label,
      trend: revenueTrend.trend,
      sparkline: buildSparkline(revenueSeries),
    },
    {
      label: `Поръчки (${periodLabel})`,
      value: String(currentOrderCount),
      trendLabel: ordersTrend.label,
      trend: ordersTrend.trend,
      sparkline: buildSparkline(orderSeries),
    },
    {
      label: `Нови клиенти (${periodLabel})`,
      value: String(currentNewCustomers),
      trendLabel: customersTrend.label,
      trend: customersTrend.trend,
      sparkline: buildSparkline(customerSeries),
    },
    {
      label: "Средна стойност на поръчка",
      value: formatMoney(currentAvg),
      trendLabel: avgTrend.label,
      trend: avgTrend.trend,
      sparkline: buildSparkline(avgSeries),
    },
  ];

  const channelTotals = new Map<string, number>();
  for (const o of currentOrders) {
    const key = o.channel || "Друго";
    channelTotals.set(key, (channelTotals.get(key) ?? 0) + Number(o.totalPrice));
  }
  const totalChannelRevenue = Array.from(channelTotals.values()).reduce((a, b) => a + b, 0) || 1;
  const channelRevenue = Array.from(channelTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([channel, amount]) => ({
      channel,
      amount: formatMoney(amount),
      pct: Math.round((amount / totalChannelRevenue) * 100),
    }));

  const recentOrders = recentOrderRows.map((r) => ({
    client: r.company ?? "Неизвестен клиент",
    number: r.number || "—",
    amount: formatMoney(Number(r.amount), r.currency),
  }));

  const activityItems = [
    ...recentOrderRows.map((o) => ({
      icon: "invoice" as const,
      text: `Поръчка ${o.number || ""} от ${o.company ?? "клиент"}`.trim(),
      time: formatRelativeBg(o.occurredAt, now),
      sortAt: o.occurredAt,
    })),
    ...recentClientRows
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((c) => ({
        icon: "user" as const,
        text: `${c.company} се присъедини като клиент`,
        time: formatRelativeBg(c.createdAt, now),
        sortAt: c.createdAt,
      })),
  ];
  const activity = activityItems
    .sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime())
    .slice(0, 5)
    .map(({ icon, text, time }) => ({ icon, text, time }));

  return { metrics, weeklyRevenue, channelRevenue, recentOrders, activity };
}
