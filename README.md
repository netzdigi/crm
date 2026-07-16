# Везна (Vezna)

Прецизно, премиум табло за управление на бизнес операции — фактуриране, клиенти,
приходи по канал и активност на екипа. Изградено с Next.js, React и Tailwind CSS.

## Стек

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS за токен-базирана дизайн система (светла/тъмна тема)
- Framer Motion за фини, премерени преходи
- lucide-react за иконите

## Разработка

```bash
npm install
npm run dev
```

Отвори [http://localhost:3000](http://localhost:3000).

## Структура

- `app/` — Next.js App Router (layout, страница, глобални стилове)
- `components/` — компоненти на таблото (странична навигация, горна лента, статистики, графики)
- `lib/data.ts` — примерни данни за таблото
