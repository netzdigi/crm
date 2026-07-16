"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, Search, Bell, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { navItems } from "./SidebarNav";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const current = navItems.find((item) => item.href === pathname) ?? navItems[0];
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
          <CrumbIcon size={15} strokeWidth={2} className="hidden text-ink-soft sm:block" />
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
        <UserMenu />
      </div>
    </header>
  );
}
