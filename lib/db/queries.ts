import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import { companies, memberships, platformAdmins, type Company } from "./schema";

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const db = getDb();
  const [company] = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
  return company ?? null;
}

export async function getMembership(userId: string, companyId: string) {
  const db = getDb();
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.companyId, companyId)))
    .limit(1);
  return membership ?? null;
}

export async function getMembershipsForUser(userId: string) {
  const db = getDb();
  return db
    .select({ company: companies, role: memberships.role })
    .from(memberships)
    .innerJoin(companies, eq(memberships.companyId, companies.id))
    .where(eq(memberships.userId, userId));
}

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const db = getDb();
  const [admin] = await db
    .select()
    .from(platformAdmins)
    .where(eq(platformAdmins.userId, userId))
    .limit(1);
  return admin != null;
}

export async function listCompaniesWithMemberCount() {
  const db = getDb();
  const [allCompanies, allMemberships] = await Promise.all([
    db.select().from(companies).orderBy(companies.createdAt),
    db.select({ companyId: memberships.companyId }).from(memberships),
  ]);

  const counts = new Map<string, number>();
  for (const m of allMemberships) {
    counts.set(m.companyId, (counts.get(m.companyId) ?? 0) + 1);
  }

  return allCompanies.map((c) => ({ ...c, memberCount: counts.get(c.id) ?? 0 }));
}

export async function createCompany(input: {
  slug: string;
  name: string;
  industry: Company["industry"];
}): Promise<Company> {
  const db = getDb();
  const [company] = await db.insert(companies).values(input).returning();
  return company;
}

export async function addMembership(input: {
  userId: string;
  companyId: string;
  role?: "owner" | "member";
}) {
  const db = getDb();
  const [membership] = await db
    .insert(memberships)
    .values({ ...input, role: input.role ?? "owner" })
    .returning();
  return membership;
}
