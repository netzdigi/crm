import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getMembershipsForUser, isPlatformAdmin } from "@/lib/db/queries";

export default async function RootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const memberships = await getMembershipsForUser(userId);
  if (memberships.length > 0) {
    redirect(`/${memberships[0].company.slug}`);
  }

  if (await isPlatformAdmin(userId)) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="max-w-sm">
        <h1 className="mb-2 font-display text-[20px] font-semibold">
          Все още нямаш работно пространство
        </h1>
        <p className="text-[13.5px] text-ink-soft">
          Свържи се с администратора на Vista, за да получиш достъп до фирмения си акаунт.
        </p>
      </div>
    </div>
  );
}
