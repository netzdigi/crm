import { PageHeader } from "@/components/PageHeader";
import { IntegrationCard } from "@/components/IntegrationCard";
import { integrations } from "@/lib/data";

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Интеграции"
        subtitle="Свържи Vista с инструментите, които вече използваш."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </div>
    </>
  );
}
