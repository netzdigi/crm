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
    value: "18 290 лв.",
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
  { day: "Пон", amount: "1 240 лв.", heightPct: 52 },
  { day: "Вт", amount: "1 080 лв.", heightPct: 46 },
  { day: "Ср", amount: "1 520 лв.", heightPct: 66 },
  { day: "Чет", amount: "1 610 лв.", heightPct: 70 },
  { day: "Пет", amount: "1 890 лв.", heightPct: 82 },
  { day: "Съб", amount: "1 470 лв.", heightPct: 64 },
  { day: "Нед", amount: "2 300 лв.", heightPct: 100 },
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
  { client: "Северен вятър ЕООД", number: "#1045", amount: "2 400,00 лв." },
  { client: "Синева ООД", number: "#1044", amount: "890,00 лв." },
  { client: "Дъбрава Студио", number: "#1043", amount: "5 120,00 лв." },
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
