"use client";

import { createContext, useContext } from "react";
import type { ModuleKey } from "@/lib/industries";

export interface CompanyContextValue {
  slug: string;
  name: string;
  enabledModules: ModuleKey[];
  isPlatformAdmin: boolean;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({
  value,
  children,
}: {
  value: CompanyContextValue;
  children: React.ReactNode;
}) {
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return ctx;
}
