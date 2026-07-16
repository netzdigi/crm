import { PageHeader } from "@/components/PageHeader";
import { ApiKeysPanel } from "@/components/ApiKeysPanel";

export default function ApiKeysPage() {
  return (
    <>
      <PageHeader
        title="API ключове"
        subtitle="Управлявай ключовете за достъп до Vista API."
      />
      <ApiKeysPanel />
    </>
  );
}
