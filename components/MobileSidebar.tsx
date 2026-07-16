"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col border-r border-border bg-surface px-3 py-4 lg:hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Затвори навигацията"
              className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-[7px] text-ink-soft hover:bg-active cursor-pointer"
            >
              <X size={15} />
            </button>
            <SidebarNav />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
