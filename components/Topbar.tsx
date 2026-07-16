"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, Search, Bell, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { navItems } from "./SidebarNav";
import { useCompany } from "@/lib/company-context";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { slug } = useCompany();
  const current =
    navItems.find((item) => `/${slug}${item.path}` === pathname) ?? navItems[0];
  const CrumbIcon = current.icon;

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-5">
      <div className="flex items-center gap-3 text-[13.5px] font-semibold text-ink">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Отвори навигацията"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-soft hover:bg-active cursor-pointer lg:hidden"
        >
          <Menu size={17} />
        </button>
        <div className="flex items-center gap-2">
          <LayoutGrid size={15} strokeWidth={2} className="hidden text-ink-soft sm:block" />
          <span>{current.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          aria-label="Търсене"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-ink-soft transition-colors duration-150 hover:bg-active cursor-pointer"
        >
          <Search size={15} />
        </button>
        <button
          type="button"
          aria-label="Известия"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-ink-soft transition-colors duration-150 hover:bg-active cursor-pointer"
        >
          <Bell size={15} />
        </button>
        <ThemeToggle />
        <div className="ml-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-surface dark:bg-accent dark:text-accent-ink">
          М
        </div>
      </div>
    </header>
  );
}
