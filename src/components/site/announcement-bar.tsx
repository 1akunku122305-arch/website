"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Announcement } from "@/lib/types";

const TONES = {
  INFO: "bg-[#22d3ee] text-black",
  WARN: "bg-[#fbbf24] text-black",
  SUCCESS: "bg-[#c3ff3e] text-black",
} as const;

export function AnnouncementBar({ announcement }: { announcement: Announcement }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className={`${TONES[announcement.level]} border-b-[3px] border-black`} role="status">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <p className="text-xs font-black uppercase tracking-wide sm:text-sm">{announcement.body}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Tutup pengumuman"
          className="shrink-0 rounded-lg border-2 border-black bg-black/10 p-1 transition-colors hover:bg-black/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
