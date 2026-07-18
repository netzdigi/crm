import { PageHeader } from "@/components/PageHeader";
import { ClientsKanban } from "@/components/ClientsKanban";
import { getBoards, getClientsWithCommunications } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [boards, { clients, communications }] = await Promise.all([
    getBoards(),
    getClientsWithCommunications(),
  ]);

  return (
    <>
      <PageHeader
        title="Клиенти"
        subtitle="Плъзгай карта между дъските, за да преместиш клиент, или я отвори за подробности."
      />
      <ClientsKanban
        initialBoards={boards}
        initialClients={clients}
        communications={communications}
      />
    </>
  );
}
