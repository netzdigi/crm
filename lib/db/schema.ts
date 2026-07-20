import {
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const clientStatusEnum = pgEnum("client_status", [
  "Активен",
  "Нов",
  "Неактивен",
]);

export const clientSourceEnum = pgEnum("client_source", ["manual", "shopify"]);

export const communicationChannelEnum = pgEnum("communication_channel", [
  "email",
  "call",
  "note",
]);

export const communicationDirectionEnum = pgEnum("communication_direction", [
  "incoming",
  "outgoing",
]);

export const pipelineBoards = pgTable("pipeline_boards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => pipelineBoards.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  contact: text("contact").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  status: clientStatusEnum("status").notNull().default("Нов"),
  notes: text("notes").notNull().default(""),
  source: clientSourceEnum("source").notNull().default("manual"),
  shopifyCustomerId: text("shopify_customer_id").unique(),
  lastContactAt: timestamp("last_contact_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const clientCommunications = pgTable("client_communications", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  channel: communicationChannelEnum("channel").notNull(),
  direction: communicationDirectionEnum("direction").notNull(),
  subject: text("subject").notNull(),
  preview: text("preview").notNull().default(""),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
});
