"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("vezna-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Превключи към светла тема" : "Превключи към тъмна тема"}
      className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-ink-soft transition-colors duration-150 hover:bg-active cursor-pointer"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
