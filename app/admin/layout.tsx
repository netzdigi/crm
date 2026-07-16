import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/lib/db/queries";
import { LogoMark } from "@/components/Logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }
  if (!(await isPlatformAdmin(userId))) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Vista Admin
          </span>
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-mute">
          Платформа
        </span>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
