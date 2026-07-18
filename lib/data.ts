export type Trend = "up" | "down";

export interface StatMetric {
  label: string;
  value: string;
  trendLabel: string;
  trend: Trend;
  sparkline: string;
}

export const statMetrics: StatMetric[] = [
  {
    label: "Активни потребители",
    value: "847",
    trendLabel: "3,1% спрямо миналата седмица",
    trend: "up",
    sparkline: "M2,24 C10,10 18,10 26,20 C34,30 42,30 50,18 C58,6 66,6 74,16 C82,26 90,26 98,14",
  },
  {
    label: "Приходи",
    value: "9 352 €",
    trendLabel: "12,4% спрямо миналата седмица",
    trend: "up",
    sparkline: "M2,28 C12,26 20,18 30,20 C40,22 46,12 56,10 C66,8 74,16 82,10 C88,6 94,4 98,2",
  },
  {
    label: "Реализация на сделки",
    value: "3,28%",
    trendLabel: "0,4% спрямо миналата седмица",
    trend: "down",
    sparkline: "M2,8 C16,10 30,14 44,18 C58,22 72,24 86,26 C90,27 94,27 98,26",
  },
  {
    label: "Нови регистрации",
    value: "142",
    trendLabel: "8,7% спрямо миналата седмица",
    trend: "up",
    sparkline: "M2,22 C10,26 18,10 26,14 C34,18 42,26 50,20 C58,14 66,8 74,12 C82,16 90,20 98,10",
  },
];

export const weeklyRevenue = [
  { day: "Пон", amount: "634 €", heightPct: 52 },
  { day: "Вт", amount: "552 €", heightPct: 46 },
  { day: "Ср", amount: "777 €", heightPct: 66 },
  { day: "Чет", amount: "823 €", heightPct: 70 },
  { day: "Пет", amount: "966 €", heightPct: 82 },
  { day: "Съб", amount: "752 €", heightPct: 64 },
  { day: "Нед", amount: "1 176 €", heightPct: 100 },
];

export const channelDateLabels = [
  "7 апр",
  "8 апр",
  "9 апр",
  "10 апр",
  "11 апр",
  "12 апр",
  "13 апр",
];

export const invoices = [
  { client: "Северен вятър ЕООД", number: "#1045", amount: "1 227,10 €" },
  { client: "Синева ООД", number: "#1044", amount: "455,05 €" },
  { client: "Дъбрава Студио", number: "#1043", amount: "2 617,81 €" },
];

export const activity = [
  {
    icon: "invoice" as const,
    text: "Фактура #1045 създадена",
    time: "Преди 2 часа",
  },
  {
    icon: "user" as const,
    text: "Йордан се присъедини към екипа",
    time: "Тази сутрин",
  },
  {
    icon: "mail" as const,
    text: "Седмично обобщение изпратено",
    time: "Вчера",
  },
];

// Analytics

export const analyticsMetrics: StatMetric[] = [
  {
    label: "Средна стойност на сделка",
    value: "2 940 €",
    trendLabel: "6,2% спрямо миналия месец",
    trend: "up",
    sparkline: "M2,26 C14,22 22,14 34,16 C46,18 54,8 66,10 C78,12 86,4 98,6",
  },
  {
    label: "Задържане на клиенти",
    value: "94,1%",
    trendLabel: "1,1% спрямо миналия месец",
    trend: "up",
    sparkline: "M2,14 C16,12 30,16 44,14 C58,12 72,10 86,8 C90,7 94,7 98,6",
  },
  {
    label: "Стойност през целия цикъл",
    value: "18 640 €",
    trendLabel: "3,4% спрямо миналия месец",
    trend: "up",
    sparkline: "M2,30 C14,24 22,20 34,18 C46,16 54,12 66,10 C78,8 86,6 98,4",
  },
  {
    label: "Цена на придобиване",
    value: "312 €",
    trendLabel: "2,8% спрямо миналия месец",
    trend: "down",
    sparkline: "M2,6 C16,10 30,12 44,16 C58,20 72,22 86,24 C90,25 94,25 98,26",
  },
];

export const channelPerformance = [
  { channel: "Онлайн магазин", sessions: "12 480", conversion: "4,1%", revenue: "38 210 €" },
  { channel: "Физически магазин", sessions: "6 902", conversion: "6,8%", revenue: "22 640 €" },
  { channel: "Партньорска мрежа", sessions: "3 114", conversion: "3,2%", revenue: "9 480 €" },
  { channel: "Директни запитвания", sessions: "1 578", conversion: "8,5%", revenue: "7 120 €" },
];

// Tasks & workflows

export type TaskStatus = "Предстояща" | "В процес" | "Завършена";

export const tasks: {
  title: string;
  assignee: string;
  status: TaskStatus;
  due: string;
}[] = [
  { title: "Подготовка на оферта — Северен вятър ЕООД", assignee: "М", status: "В процес", due: "18 юли" },
  { title: "Обаждане за подновяване — Синева ООД", assignee: "Й", status: "Предстояща", due: "19 юли" },
  { title: "Качване на нов договор в системата", assignee: "Р", status: "Завършена", due: "15 юли" },
  { title: "Ревизия на месечните фактури", assignee: "М", status: "В процес", due: "20 юли" },
  { title: "Онбординг на Дъбрава Студио", assignee: "Й", status: "Предстояща", due: "22 юли" },
];

export const workflows = [
  { name: "Напомняне за просрочена фактура", trigger: "Фактура неплатена 7 дни", active: true },
  { name: "Приветствено писмо за нов клиент", trigger: "Нов клиент добавен", active: true },
  { name: "Ескалация на застояла сделка", trigger: "Без активност 14 дни", active: false },
];

// Clients & communication

export type ClientStatus = "Активен" | "Нов" | "Неактивен";

export interface PipelineBoard {
  id: string;
  name: string;
}

export const initialPipelineBoards: PipelineBoard[] = [
  { id: "sales", name: "Продажби" },
  { id: "support", name: "Поддръжка" },
];

export interface Client {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  status: ClientStatus;
  boardId: string;
  lastContact: string;
  notes: string;
}

export const clients: Client[] = [
  {
    id: "c1",
    company: "Северен вятър ЕООД",
    contact: "Мартин Петров",
    phone: "+359 88 123 4567",
    email: "martin@severenvyatyr.bg",
    status: "Активен",
    boardId: "support",
    lastContact: "Преди 2 часа",
    notes: "Очаква оферта за годишен договор до петък.",
  },
  {
    id: "c2",
    company: "Синева ООД",
    contact: "Диана Колева",
    phone: "+359 87 456 7890",
    email: "diana@sineva.bg",
    status: "Активен",
    boardId: "support",
    lastContact: "Вчера",
    notes: "Подновяване на договора — обади се преди 30 юли.",
  },
  {
    id: "c3",
    company: "Дъбрава Студио",
    contact: "Йордан Тодоров",
    phone: "+359 89 234 5678",
    email: "yordan@dabravastudio.bg",
    status: "Нов",
    boardId: "sales",
    lastContact: "Преди 3 дни",
    notes: "",
  },
  {
    id: "c4",
    company: "Гранит Пропъртис",
    contact: "Радост Иванова",
    phone: "+359 88 345 6789",
    email: "radost@granitproperties.bg",
    status: "Неактивен",
    boardId: "sales",
    lastContact: "Преди 3 седмици",
    notes: "Не е отговорила на последните два имейла.",
  },
  {
    id: "c5",
    company: "Ивелин Груп",
    contact: "Ивелин Стоянов",
    phone: "+359 89 567 1234",
    email: "ivelin@ivelingroup.bg",
    status: "Нов",
    boardId: "sales",
    lastContact: "Преди 5 часа",
    notes: "Дойде през препоръка от Северен вятър ЕООД.",
  },
  {
    id: "c6",
    company: "Балкан Логистика",
    contact: "Стефан Николов",
    phone: "+359 87 678 2345",
    email: "stefan@balkanlogistika.bg",
    status: "Активен",
    boardId: "support",
    lastContact: "Преди 6 дни",
    notes: "Доволен клиент — обмисля надграждане на плана.",
  },
];

export const communications = [
  { icon: "mail" as const, text: "Имейл до Северен вятър ЕООД относно офертата", time: "Преди 40 мин" },
  { icon: "user" as const, text: "Обаждане със Синева ООД — подновяване на договор", time: "Преди 3 часа" },
  { icon: "invoice" as const, text: "Изпратена фактура #1045 до Северен вятър ЕООД", time: "Преди 2 часа" },
];

// Per-client communication history (shown in the large client detail panel).
// Placeholder data for now — this thread is where synced Gmail messages will
// land once the Gmail integration is connected.

export type CommunicationChannel = "email" | "call" | "note";
export type CommunicationDirection = "incoming" | "outgoing";

export interface ClientCommunication {
  id: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject: string;
  preview: string;
  time: string;
}

export const clientCommunications: Record<string, ClientCommunication[]> = {
  c1: [
    {
      id: "c1-1",
      channel: "email",
      direction: "outgoing",
      subject: "Оферта за годишен договор",
      preview: "Изпратихме актуализираната оферта с намалена такса за обслужване при годишен план.",
      time: "Преди 40 мин",
    },
    {
      id: "c1-2",
      channel: "call",
      direction: "incoming",
      subject: "Обаждане относно условията",
      preview: "Мартин попита за възможност за поетапно плащане на годишния абонамент.",
      time: "Преди 2 часа",
    },
    {
      id: "c1-3",
      channel: "email",
      direction: "incoming",
      subject: "Re: Фактура #1045",
      preview: "Потвърждение за получена фактура, ще бъде платена до края на седмицата.",
      time: "Вчера",
    },
    {
      id: "c1-4",
      channel: "note",
      direction: "outgoing",
      subject: "Вътрешна бележка",
      preview: "Клиентът е с най-висок приоритет — редовно плаща в срок и разширява екипа си.",
      time: "Преди 3 дни",
    },
  ],
  c2: [
    {
      id: "c2-1",
      channel: "call",
      direction: "outgoing",
      subject: "Обаждане за подновяване",
      preview: "Обсъдихме подновяването на договора преди изтичане на текущия план на 30 юли.",
      time: "Вчера",
    },
    {
      id: "c2-2",
      channel: "email",
      direction: "incoming",
      subject: "Въпрос за нов модул",
      preview: "Диана попита дали може да добави модул за интеграции към текущия план.",
      time: "Преди 4 дни",
    },
  ],
  c3: [
    {
      id: "c3-1",
      channel: "email",
      direction: "outgoing",
      subject: "Добре дошли във Vista",
      preview: "Изпратено приветствено писмо с данни за достъп до работното пространство.",
      time: "Преди 3 дни",
    },
  ],
  c4: [
    {
      id: "c4-1",
      channel: "email",
      direction: "outgoing",
      subject: "Проверка на активността",
      preview: "Изпратен имейл за проверка дали все още се нуждаят от абонамента.",
      time: "Преди 2 седмици",
    },
    {
      id: "c4-2",
      channel: "email",
      direction: "outgoing",
      subject: "Второ напомняне",
      preview: "Второ напомняне за подновяване — без отговор.",
      time: "Преди 3 седмици",
    },
  ],
  c5: [
    {
      id: "c5-1",
      channel: "email",
      direction: "incoming",
      subject: "Препоръка от Северен вятър ЕООД",
      preview: "Ивелин се свърза с нас след препоръка и поиска демонстрация на Vista.",
      time: "Преди 5 часа",
    },
  ],
  c6: [
    {
      id: "c6-1",
      channel: "call",
      direction: "incoming",
      subject: "Въпрос за надграждане на плана",
      preview: "Стефан пита за разликите между текущия план и Vista Business.",
      time: "Преди 6 дни",
    },
  ],
};

// Integrations

export const integrations = [
  { name: "Google Workspace", description: "Синхронизация на календар и имейли", connected: true },
  { name: "Slack", description: "Известия за екипа в реално време", connected: true },
  { name: "Stripe", description: "Обработка на плащания и фактуриране", connected: true },
  { name: "QuickBooks", description: "Счетоводна синхронизация", connected: false },
  { name: "Zapier", description: "Автоматизация между над 5000 приложения", connected: false },
  { name: "HubSpot", description: "Импорт на контакти и сделки", connected: false },
];

// API keys

export type ApiKeyStatus = "Активен" | "Оттеглен";

export const apiKeys: {
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  status: ApiKeyStatus;
}[] = [
  { name: "Продукция — сървър", prefix: "vst_live_4f2a…9c31", created: "12 май 2026", lastUsed: "Преди 5 мин", status: "Активен" },
  { name: "Тестова среда", prefix: "vst_test_88b1…e207", created: "3 юни 2026", lastUsed: "Вчера", status: "Активен" },
  { name: "Интеграция с счетоводство", prefix: "vst_live_a01c…44df", created: "28 юни 2026", lastUsed: "Преди 4 дни", status: "Активен" },
];

// Billing

export type BillingStatus = "Платена" | "Предстояща" | "Неуспешна";

export const billingHistory: {
  date: string;
  description: string;
  amount: string;
  status: BillingStatus;
}[] = [
  { date: "1 авг 2026", description: "Абонамент Vista — август", amount: "249,00 €", status: "Предстояща" },
  { date: "1 юли 2026", description: "Абонамент Vista — юли", amount: "249,00 €", status: "Платена" },
  { date: "1 юни 2026", description: "Абонамент Vista — юни", amount: "249,00 €", status: "Платена" },
  { date: "15 май 2026", description: "Неуспешен опит за плащане", amount: "249,00 €", status: "Неуспешна" },
  { date: "1 май 2026", description: "Абонамент Vista — май (повторен опит)", amount: "249,00 €", status: "Платена" },
];

export const currentPlan = {
  name: "Vista Business",
  price: "249,00 €",
  cycle: "на месец",
  renews: "Подновява се на 1 август 2026",
  features: [
    "Неограничен брой клиенти",
    "Разширени анализи",
    "Приоритетна поддръжка",
    "До 10 членове на екипа",
  ],
};

export const paymentMethod = {
  brand: "Visa",
  last4: "4242",
  expiry: "08/28",
  name: "Мартин Петров",
};

// Settings

export const workspaceSettings = {
  companyName: "Vista ООД",
  language: "Български",
  timezone: "Европа/София (UTC+3)",
};

export const notificationPreferences: {
  label: string;
  description: string;
  enabled: boolean;
}[] = [
  { label: "Известия по имейл", description: "Обобщения и важни промени по имейл.", enabled: true },
  { label: "Седмично обобщение", description: "Обобщение на представянето всеки понеделник.", enabled: true },
  { label: "Нови сделки", description: "Известие при създаване на нова сделка.", enabled: false },
  { label: "Просрочени фактури", description: "Напомняне при просрочено плащане.", enabled: true },
];
