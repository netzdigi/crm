import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/AppShell";
import { CompanyProvider } from "@/lib/company-context";
import { getCompanyBySlug, getMembership, isPlatformAdmin } from "@/lib/db/queries";
import { modulesForIndustry } from "@/lib/industries";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ company: string }>;
}) {
  const { company: slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const company = await getCompanyBySlug(slug);
  if (!company) {
    notFound();
  }

  const [membership, admin] = await Promise.all([
    getMembership(userId, company.id),
    isPlatformAdmin(userId),
  ]);

  if (!membership && !admin) {
    notFound();
  }

  return (
    <CompanyProvider
      value={{
        slug: company.slug,
        name: company.name,
        enabledModules: modulesForIndustry(company.industry),
        isPlatformAdmin: admin,
      }}
    >
      <AppShell>{children}</AppShell>
    </CompanyProvider>
  );
}
