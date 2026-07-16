"use client";

import { useState } from "react";
import { Mail, MessageSquare, CreditCard, Calculator, Zap, Users, Globe, Check } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { integrations } from "@/lib/data";

const iconMap: Record<string, typeof Globe> = {
  "Google Workspace": Mail,
  Slack: MessageSquare,
  Stripe: CreditCard,
  QuickBooks: Calculator,
  Zapier: Zap,
  HubSpot: Users,
};

export function IntegrationCard({ integration }: { integration: (typeof integrations)[number] }) {
  const [connected, setConnected] = useState(integration.connected);
  const Icon = iconMap[integration.name] ?? Globe;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface px-5 py-4.5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-active text-ink-soft">
          <Icon size={16} strokeWidth={2} />
        </div>
        <Badge tone={connected ? "positive" : "neutral"}>
          {connected ? "Свързан" : "Не е свързан"}
        </Badge>
      </div>
      <div className="mb-1 text-[14px] font-semibold">{integration.name}</div>
      <div className="mb-4 flex-1 text-[12.5px] leading-[1.5] text-ink-soft">
        {integration.description}
      </div>
      <Button
        variant={connected ? "secondary" : "primary"}
        className="w-full"
        onClick={() => setConnected((v) => !v)}
      >
        {connected ? (
          "Прекъсни връзката"
        ) : (
          <>
            <Check size={13} /> Свържи
          </>
        )}
      </Button>
    </div>
  );
}
