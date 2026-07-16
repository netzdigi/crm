"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 218 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden flex-shrink-0 flex-col border-r border-border bg-surface px-3 py-4 lg:flex"
    >
      <SidebarNav
        collapsed={collapsed}
        footerExtra={
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Разгъни навигацията" : "Свий навигацията"}
            className="mb-3 ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-surface transition-opacity duration-150 hover:opacity-85 cursor-pointer dark:bg-accent dark:text-accent-ink"
          >
            {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
          </button>
        }
      />
    </motion.aside>
  );
}
