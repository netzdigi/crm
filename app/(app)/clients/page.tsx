import { PageHeader } from "@/components/PageHeader";
import { ClientsKanban } from "@/components/ClientsKanban";

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Клиенти"
        subtitle="Плъзгай карта между дъските, за да преместиш клиент, или я отвори за подробности."
      />
      <ClientsKanban />
    </>
  );
}
