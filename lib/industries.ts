export type ModuleKey =
  | "dashboard"
  | "analytics"
  | "tasks"
  | "clients"
  | "integrations"
  | "api-keys"
  | "settings"
  | "billing";

export type Industry = "online_shop" | "transport" | "solar" | "other";

interface IndustryTemplate {
  label: string;
  modules: ModuleKey[];
}

const ALL_MODULES: ModuleKey[] = [
  "dashboard",
  "analytics",
  "tasks",
  "clients",
  "integrations",
  "api-keys",
  "settings",
  "billing",
];

export const industries: Record<Industry, IndustryTemplate> = {
  online_shop: {
    label: "Онлайн магазин",
    modules: ALL_MODULES,
  },
  transport: {
    label: "Транспортна фирма",
    modules: ["dashboard", "analytics", "tasks", "clients", "integrations", "settings", "billing"],
  },
  solar: {
    label: "Соларна фирма",
    modules: ["dashboard", "analytics", "tasks", "clients", "settings", "billing"],
  },
  other: {
    label: "Друго",
    modules: ["dashboard", "clients", "settings", "billing"],
  },
};

export function modulesForIndustry(industry: Industry): ModuleKey[] {
  return industries[industry]?.modules ?? industries.other.modules;
}
