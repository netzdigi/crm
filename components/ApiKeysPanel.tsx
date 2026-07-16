"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { apiKeys as initialKeys, type ApiKeyStatus } from "@/lib/data";

function randomPrefix() {
  const hex = () => Math.random().toString(16).slice(2, 6);
  return `vst_live_${hex()}…${hex()}`;
}

export function ApiKeysPanel() {
  const [keys, setKeys] = useState(initialKeys);

  function createKey() {
    setKeys((prev) => [
      {
        name: "Нов ключ",
        prefix: randomPrefix(),
        created: "Днес",
        lastUsed: "Никога",
        status: "Активен" as ApiKeyStatus,
      },
      ...prev,
    ]);
  }

  function revoke(name: string, created: string) {
    setKeys((prev) =>
      prev.map((k) =>
        k.name === name && k.created === created ? { ...k, status: "Оттеглен" as ApiKeyStatus } : k
      )
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5">
      <div className="mb-4.5 flex items-center justify-between gap-3">
        <div className="text-[12.5px] text-ink-soft">
          Ключове за достъп до Vista API.
        </div>
        <Button variant="primary" onClick={createKey}>
          <Plus size={13} /> Създай нов ключ
        </Button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
              Име
            </th>
            <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
              Ключ
            </th>
            <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
              Създаден
            </th>
            <th className="border-b border-border pb-2.5 text-left text-[12px] font-medium text-ink-soft">
              Последно използван
            </th>
            <th className="border-b border-border pb-2.5 text-right text-[12px] font-medium text-ink-soft">
              Статус
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k, i) => (
            <tr key={`${k.name}-${k.created}`} className={i < keys.length - 1 ? "border-b border-border" : ""}>
              <td className="py-2.5 text-[13px] font-medium">{k.name}</td>
              <td className="py-2.5 font-mono text-[12px] text-ink-mute">{k.prefix}</td>
              <td className="py-2.5 text-[13px] text-ink-soft">{k.created}</td>
              <td className="py-2.5 text-[13px] text-ink-soft">{k.lastUsed}</td>
              <td className="py-2.5 text-right">
                {k.status === "Активен" ? (
                  <button
                    type="button"
                    onClick={() => revoke(k.name, k.created)}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-negative hover:opacity-80 cursor-pointer"
                  >
                    <Trash2 size={12} /> Оттегли
                  </button>
                ) : (
                  <Badge tone="neutral">Оттеглен</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
