"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createCompany, addMembership, isPlatformAdmin } from "@/lib/db/queries";
import { slugify } from "@/lib/utils";
import type { Industry } from "@/lib/industries";

const RESERVED_SLUGS = new Set(["admin", "login", "sso-callback", "api", "_next"]);

export async function createCompanyAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId || !(await isPlatformAdmin(userId))) {
    throw new Error("Нямаш права да извършиш това действие.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const industry = String(formData.get("industry") ?? "other") as Industry;
  const ownerUserId = String(formData.get("ownerUserId") ?? "").trim();

  if (!name) {
    throw new Error("Името на фирмата е задължително.");
  }

  const slug = slugify(slugInput || name);
  if (!slug) {
    throw new Error("Не може да се генерира валиден адрес от това име.");
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`Адресът "${slug}" е запазен и не може да се използва.`);
  }

  const company = await createCompany({ name, slug, industry });

  if (ownerUserId) {
    await addMembership({ userId: ownerUserId, companyId: company.id, role: "owner" });
  }

  redirect("/admin");
}
