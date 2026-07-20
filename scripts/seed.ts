import { loadEnvLocal } from "./load-env";

loadEnvLocal();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (checked process.env and .env.local). Aborting seed.");
  process.exit(1);
}

// Imported after env is loaded so lib/db/client.ts sees DATABASE_URL.
const { getDb } = await import("../lib/db/client");
const { pipelineBoards, clients, clientCommunications } = await import("../lib/db/schema");

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms);

async function main() {
  const db = getDb();

  const existingBoards = await db.select({ id: pipelineBoards.id }).from(pipelineBoards).limit(1);
  if (existingBoards.length > 0) {
    console.log("Boards already exist — database looks seeded. Skipping.");
    return;
  }

  await db.insert(pipelineBoards).values([
    { id: "sales", name: "Продажби" },
    { id: "support", name: "Поддръжка" },
  ]);

  await db.insert(clients).values([
    {
      id: "c1",
      boardId: "support",
      company: "Северен вятър ЕООД",
      contact: "Мартин Петров",
      phone: "+359 88 123 4567",
      email: "martin@severenvyatyr.bg",
      status: "Активен",
      notes: "Очаква оферта за годишен договор до петък.",
      lastContactAt: ago(2 * HOUR),
    },
    {
      id: "c2",
      boardId: "support",
      company: "Синева ООД",
      contact: "Диана Колева",
      phone: "+359 87 456 7890",
      email: "diana@sineva.bg",
      status: "Активен",
      notes: "Подновяване на договора — обади се преди 30 юли.",
      lastContactAt: ago(1 * DAY),
    },
    {
      id: "c3",
      boardId: "sales",
      company: "Дъбрава Студио",
      contact: "Йордан Тодоров",
      phone: "+359 89 234 5678",
      email: "yordan@dabravastudio.bg",
      status: "Нов",
      notes: "",
      lastContactAt: ago(3 * DAY),
    },
    {
      id: "c4",
      boardId: "sales",
      company: "Гранит Пропъртис",
      contact: "Радост Иванова",
      phone: "+359 88 345 6789",
      email: "radost@granitproperties.bg",
      status: "Неактивен",
      notes: "Не е отговорила на последните два имейла.",
      lastContactAt: ago(21 * DAY),
    },
    {
      id: "c5",
      boardId: "sales",
      company: "Ивелин Груп",
      contact: "Ивелин Стоянов",
      phone: "+359 89 567 1234",
      email: "ivelin@ivelingroup.bg",
      status: "Нов",
      notes: "Дойде през препоръка от Северен вятър ЕООД.",
      lastContactAt: ago(5 * HOUR),
    },
    {
      id: "c6",
      boardId: "support",
      company: "Балкан Логистика",
      contact: "Стефан Николов",
      phone: "+359 87 678 2345",
      email: "stefan@balkanlogistika.bg",
      status: "Активен",
      notes: "Доволен клиент — обмисля надграждане на плана.",
      lastContactAt: ago(6 * DAY),
    },
  ]);

  await db.insert(clientCommunications).values([
    {
      id: "c1-1",
      clientId: "c1",
      channel: "email",
      direction: "outgoing",
      subject: "Оферта за годишен договор",
      preview: "Изпратихме актуализираната оферта с намалена такса за обслужване при годишен план.",
      occurredAt: ago(40 * 60 * 1000),
    },
    {
      id: "c1-2",
      clientId: "c1",
      channel: "call",
      direction: "incoming",
      subject: "Обаждане относно условията",
      preview: "Мартин попита за възможност за поетапно плащане на годишния абонамент.",
      occurredAt: ago(2 * HOUR),
    },
    {
      id: "c1-3",
      clientId: "c1",
      channel: "email",
      direction: "incoming",
      subject: "Re: Фактура #1045",
      preview: "Потвърждение за получена фактура, ще бъде платена до края на седмицата.",
      occurredAt: ago(1 * DAY),
    },
    {
      id: "c1-4",
      clientId: "c1",
      channel: "note",
      direction: "outgoing",
      subject: "Вътрешна бележка",
      preview: "Клиентът е с най-висок приоритет — редовно плаща в срок и разширява екипа си.",
      occurredAt: ago(3 * DAY),
    },
    {
      id: "c2-1",
      clientId: "c2",
      channel: "call",
      direction: "outgoing",
      subject: "Обаждане за подновяване",
      preview: "Обсъдихме подновяването на договора преди изтичане на текущия план на 30 юли.",
      occurredAt: ago(1 * DAY),
    },
    {
      id: "c2-2",
      clientId: "c2",
      channel: "email",
      direction: "incoming",
      subject: "Въпрос за нов модул",
      preview: "Диана попита дали може да добави модул за интеграции към текущия план.",
      occurredAt: ago(4 * DAY),
    },
    {
      id: "c3-1",
      clientId: "c3",
      channel: "email",
      direction: "outgoing",
      subject: "Добре дошли във Vista",
      preview: "Изпратено приветствено писмо с данни за достъп до работното пространство.",
      occurredAt: ago(3 * DAY),
    },
    {
      id: "c4-1",
      clientId: "c4",
      channel: "email",
      direction: "outgoing",
      subject: "Проверка на активността",
      preview: "Изпратен имейл за проверка дали все още се нуждаят от абонамента.",
      occurredAt: ago(14 * DAY),
    },
    {
      id: "c4-2",
      clientId: "c4",
      channel: "email",
      direction: "outgoing",
      subject: "Второ напомняне",
      preview: "Второ напомняне за подновяване — без отговор.",
      occurredAt: ago(21 * DAY),
    },
    {
      id: "c5-1",
      clientId: "c5",
      channel: "email",
      direction: "incoming",
      subject: "Препоръка от Северен вятър ЕООД",
      preview: "Ивелин се свърза с нас след препоръка и поиска демонстрация на Vista.",
      occurredAt: ago(5 * HOUR),
    },
    {
      id: "c6-1",
      clientId: "c6",
      channel: "call",
      direction: "incoming",
      subject: "Въпрос за надграждане на плана",
      preview: "Стефан пита за разликите между текущия план и Vista Business.",
      occurredAt: ago(6 * DAY),
    },
  ]);

  console.log("Seed complete: 2 boards, 6 clients, 11 communications.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
