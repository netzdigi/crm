"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart3,
  ClipboardList,
  Users,
  Globe,
  KeyRound,
  Settings,
  CreditCard,
  HelpCircle,
  FileText,
} from "lucide-react";
import { LogoMark } from "./Logo";
import { useCompany } from "@/lib/company-context";
import type { ModuleKey } from "@/lib/industries";

const navGroups = [
  {
    label: "Продукт",
    items: [
      { icon: LayoutGrid, label: "Табло", path: "", moduleKey: "dashboard" as ModuleKey },
      { icon: BarChart3, label: "Анализи", path: "/analytics", moduleKey: "analytics" as ModuleKey },
      { icon: ClipboardList, label: "Задачи и процеси", path: "/tasks", moduleKey: "tasks" as ModuleKey },
    ],
  },
  {
    label: "Работно пространство",
    items: [
      { icon: Users, label: "Клиенти и комуникация", path: "/clients", moduleKey: "clients" as ModuleKey },
      { icon: Globe, label: "Интеграции", path: "/integrations", moduleKey: "integrations" as ModuleKey },
      { icon: KeyRound, label: "API ключове", path: "/api-keys", moduleKey: "api-keys" as ModuleKey },
    ],
  },
  {
    label: "Управление",
    items: [
      { icon: Settings, label: "Настройки", path: "/settings", moduleKey: "settings" as ModuleKey },
      { icon: CreditCard, label: "Фактуриране", path: "/billing", moduleKey: "billing" as ModuleKey },
    ],
  },
];

export const navItems = navGroups.flatMap((group) => group.items);

export function SidebarNav({
  collapsed = false,
  footerExtra,
  onNavigate,
}: {
  collapsed?: boolean;
  footerExtra?: React.ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { slug, enabledModules } = useCompany();

  return (
    <>
      <Link href={`/${slug}`} className="flex items-center gap-2 px-1 pb-5 pt-1" onClick={onNavigate}>
        <LogoMark />
        {!collapsed && (
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Vista
          </span>
        )}
      </Link>

      <nav className="flex flex-1 flex-col gap-4 overflow-hidden">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => enabledModules.includes(item.moduleKey));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              {!collapsed && (
                <div className="px-2 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-mute">
                  {group.label}
                </div>
              )}
              <ul className="flex flex-col gap-[2px]">
                {visibleItems.map((item) => {
                  const href = `/${slug}${item.path}`;
                  const isActive = pathname === href;
                  return (
                    <li key={item.label}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        className={`flex w-full items-center gap-2.5 rounded-[7px] px-2 py-[7px] text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                          isActive
                            ? "bg-active text-ink font-semibold"
                            : "text-ink-soft hover:bg-active/60"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <item.icon
                          size={15}
                          strokeWidth={2}
                          className={isActive ? "text-accent" : ""}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto">
        {footerExtra}
        {!collapsed && (
          <>
            <div className="border-t border-border px-2 pb-3 pt-3.5 text-[12px]">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-mute">
                Промени в продукта
              </div>
              <div className="mb-0.5 font-semibold">Продуктова актуализация</div>
              <div className="mb-1.5 leading-[1.4] text-ink-soft">
                По-добра производителност и прецизирани детайли в интерфейса.
              </div>
              <div className="cursor-pointer font-medium text-ink underline decoration-border underline-offset-2">
                Научи повече
              </div>
            </div>
            <div className="flex flex-col gap-2 px-2 pb-1 pt-2.5 text-[12.5px] text-ink-soft">
              <div className="flex cursor-pointer items-center gap-2 hover:text-ink">
                <HelpCircle size={14} />
                Помощен център
              </div>
              <div className="flex cursor-pointer items-center gap-2 hover:text-ink">
                <FileText size={14} />
                Документация
              </div>
            </div>
            <div className="px-2 pt-2 text-[11px] text-ink-mute">
              © 2026 Vista ООД
            </div>
          </>
        )}
      </div>
    </>
  );
}
