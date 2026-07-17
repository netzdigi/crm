"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";

export function UserMenu() {
  const { user } = useUser();
  const { signOut, loaded } = useClerk();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      // Hard navigation, not router.push: guarantees a fresh request to
      // /login regardless of any client-router/cache state, and there's
      // no component left afterwards for setSigningOut(false) to matter.
      window.location.href = "/login";
    }
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initial =
    user?.fullName?.[0]?.toUpperCase() ?? user?.primaryEmailAddress?.emailAddress[0]?.toUpperCase() ?? "М";
  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Профил";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Отвори меню на профила"
        aria-expanded={open}
        className="ml-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-surface transition-opacity duration-150 hover:opacity-90 cursor-pointer dark:bg-accent dark:text-accent-ink"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-[10px] border border-border bg-surface shadow-popover">
          <div className="border-b border-border px-3.5 py-3">
            <div className="truncate text-[13px] font-medium">{displayName}</div>
            {user?.primaryEmailAddress && (
              <div className="truncate text-[11.5px] text-ink-soft">
                {user.primaryEmailAddress.emailAddress}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut || !loaded}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-negative transition-colors duration-150 hover:bg-active cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={14} />
            {signingOut ? "Излизане…" : "Изход"}
          </button>
        </div>
      )}
    </div>
  );
}
