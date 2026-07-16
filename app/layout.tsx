import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Везна — Табло за управление на бизнеса",
  description:
    "Прецизна система за фактуриране, клиенти и анализи за бизнеси, които не правят компромис с детайла.",
};

const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem('vezna-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="font-sans text-[14px] antialiased">{children}</body>
    </html>
  );
}
