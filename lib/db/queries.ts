import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";
import { getDb } from "./client";
import { clientCommunications, clients, orderLineItems, orders, pipelineBoards } from "./schema";
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
  ordersByClient: Record<string, ClientOrderSummary[]>;
}> {
  const db = getDb();
  const [clientRows, commRows, orderRows] = await Promise.all([
    db.select().from(clients).orderBy(asc(clients.createdAt)),
    db.select().from(clientCommunications).orderBy(asc(clientCommunications.occurredAt)),
    db.select().from(orders).orderBy(desc(orders.occurredAt)),
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

  const clientOrderRows = orderRows.filter((o) => o.clientId);
  const itemRows =
    clientOrderRows.length > 0
      ? await db
          .select()
          .from(orderLineItems)
          .where(inArray(orderLineItems.orderId, clientOrderRows.map((o) => o.id)))
      : [];
  const itemsByOrder = new Map<string, ClientOrderSummary["items"]>();
  for (const item of itemRows) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push({ title: item.title, quantity: item.quantity, imageUrl: item.imageUrl });
    itemsByOrder.set(item.orderId, list);
  }

  const ordersByClient: Record<string, ClientOrderSummary[]> = {};
  for (const o of clientOrderRows) {
    const summary: ClientOrderSummary = {
      id: o.id,
      number: o.name || `#${o.id}`,
      amount: formatMoney(Number(o.totalPrice), o.currency),
      time: formatRelativeBg(o.occurredAt, now),
      items: itemsByOrder.get(o.id) ?? [],
    };
    (ordersByClient[o.clientId as string] ??= []).push(summary);
  }

  return { clients: mappedClients, communications, ordersByClient };
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

export interface OrderLineItemPayload {
  title: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

// Always replaces an order's line items wholesale (delete then reinsert)
// rather than diffing — simpler, and safe to re-run for the same order
// since the whole payload comes fresh from Shopify each time.
export async function upsertOrderLineItems(orderId: string, items: OrderLineItemPayload[]) {
  const db = getDb();
  await db.delete(orderLineItems).where(eq(orderLineItems.orderId, orderId));
  if (items.length === 0) return;
  await db.insert(orderLineItems).values(
    items.map((item, i) => ({
      id: `${orderId}-${i}`,
      orderId,
      title: item.title,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      imageUrl: item.imageUrl,
    }))
  );
}

export interface ClientOrderSummary {
  id: string;
  number: string;
  amount: string;
  time: string;
  items: { title: string; quantity: number; imageUrl: string }[];
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
function buildBuckets(start: Date, end: Date): Bucket[] {
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS));

  if (totalDays <= 14) {
    return Array.from({ length: totalDays }, (_, i) => {
      const bStart = new Date(start.getTime() + i * DAY_MS);
      return { label: DAY_LABELS_BG[bStart.getDay()], start: bStart, end: new Date(bStart.getTime() + DAY_MS) };
    });
  }

  const bucketCount = 10;
  const bucketMs = (end.getTime() - start.getTime()) / bucketCount;
  return Array.from({ length: bucketCount }, (_, i) => {
    const bStart = new Date(start.getTime() + i * bucketMs);
    const bEnd = new Date(start.getTime() + (i + 1) * bucketMs);
    return { label: `${bStart.getDate()}.${bStart.getMonth() + 1}`, start: bStart, end: bEnd };
  });
}

function formatDateBg(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export interface DashboardRange {
  days?: number;
  from?: Date;
  to?: Date;
}

// Everything the dashboard homepage needs, computed from real Shopify
// orders/clients instead of static mock data. Degrades gracefully to
// zeros/empty lists before any orders have synced. Accepts either a preset
// day count or an explicit {from, to} range; the same-length period
// immediately before it is used as the "previous period" for trend
// percentages.
export async function getDashboardData(range: DashboardRange = {}): Promise<DashboardData> {
  const db = getDb();
  const now = new Date();

  let currentStart: Date;
  let currentEnd: Date;
  let periodLabel: string;

  if (range.from && range.to) {
    currentStart = range.from;
    currentEnd = new Date(range.to.getTime() + DAY_MS);
    periodLabel = `${formatDateBg(range.from)} – ${formatDateBg(range.to)}`;
  } else {
    const days = range.days ?? 7;
    currentStart = new Date(now.getTime() - days * DAY_MS);
    currentEnd = now;
    periodLabel = `${days} дни`;
  }

  const periodMs = currentEnd.getTime() - currentStart.getTime();
  const previousStart = new Date(currentStart.getTime() - periodMs);

  const [orderRows, recentClientRows, recentOrderRows] = await Promise.all([
    db.select().from(orders).where(gte(orders.occurredAt, previousStart)).orderBy(asc(orders.occurredAt)),
    db
      .select({ id: clients.id, company: clients.company, createdAt: clients.createdAt })
      .from(clients)
      .where(gte(clients.createdAt, previousStart)),
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
      .where(and(gte(orders.occurredAt, currentStart), lt(orders.occurredAt, currentEnd)))
      .orderBy(desc(orders.occurredAt))
      .limit(5),
  ]);

  const currentOrders = orderRows.filter((o) => o.occurredAt >= currentStart && o.occurredAt < currentEnd);
  const previousOrders = orderRows.filter((o) => o.occurredAt < currentStart);
  const currentClients = recentClientRows.filter(
    (c) => c.createdAt >= currentStart && c.createdAt < currentEnd
  );
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

  const buckets = buildBuckets(currentStart, currentEnd);
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
