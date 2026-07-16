"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Topbar } from "@/components/Topbar";
import { StatCard } from "@/components/StatCard";
import { RevenueBarChart } from "@/components/RevenueBarChart";
import { ChannelChart } from "@/components/ChannelChart";
import { InvoicesPanel } from "@/components/InvoicesPanel";
import { BillingHealthPanel } from "@/components/BillingHealthPanel";
import { ActivityPanel } from "@/components/ActivityPanel";
import { statMetrics } from "@/lib/data";

export default function DashboardPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <Sidebar />
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statMetrics.map((metric, i) => (
              <StatCard key={metric.label} metric={metric} index={i} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueBarChart />
            <ChannelChart />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr_1.1fr]">
            <InvoicesPanel />
            <BillingHealthPanel />
            <ActivityPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
