import { pgTable, uuid, text, timestamp, pgEnum, unique } from "drizzle-orm/pg-core";

export const industryEnum = pgEnum("industry", ["online_shop", "transport", "solar", "other"]);
export const roleEnum = pgEnum("role", ["owner", "member"]);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  industry: industryEnum("industry").notNull().default("other"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(), // Clerk user id
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.companyId)]
);

export const platformAdmins = pgTable("platform_admins", {
  userId: text("user_id").primaryKey(), // Clerk user id
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
