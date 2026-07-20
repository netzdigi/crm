export type Trend = "up" | "down";

export interface StatMetric {
  label: string;
  value: string;
  trendLabel: string;
  trend: Trend;
  sparkline: string;
}

// Dashboard homepage stats/revenue/channel/activity are now computed from
// real Shopify data — see lib/db/queries.ts (getDashboardData).

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

// Clients & communication — now backed by the database, see lib/db/queries.ts
// and lib/types.ts for the Client/PipelineBoard/ClientCommunication shapes.

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
