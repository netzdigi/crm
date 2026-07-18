import { PageHeader } from "@/components/PageHeader";
import { ClientsKanban } from "@/components/ClientsKanban";
import { CommunicationsPanel } from "@/components/CommunicationsPanel";

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Клиенти и комуникация"
        subtitle="Плъзгай карта между дъските, за да преместиш клиент, или я отвори за подробности."
      />
      <ClientsKanban />
      <div className="mt-4">
        <CommunicationsPanel />
      </div>
    </>
  );
}
