import { useMemo, useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Chapter } from "@/store/useChatStore";

interface Props {
  chapters: Chapter[];
  value: Chapter | null;
  onChange: (chapter: Chapter | null) => void;
  placeholder?: string;
}

export default function SurahAutocomplete({ chapters, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(q) ||
        String(c.id).includes(q)
    );
  }, [chapters, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-left text-sm text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:rounded-xl sm:px-3.5 sm:text-base"
      >
        <span className="truncate">
          {value ? `${value.id}. ${value.name_simple}` : placeholder || "Pilih surah…"}
        </span>
        <ChevronDown className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
      </button>

      {open && (
        <div className="absolute z-30 w-full overflow-hidden rounded-lg border border-teal-700 bg-teal-600 shadow-xl sm:rounded-xl" style={{ bottom: 'calc(100% + 6px)' }}>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari surah…"
            className="w-full border-b border-teal-500 bg-teal-700 px-3 py-2.5 text-sm text-white placeholder-teal-200 focus:outline-none focus:bg-teal-800 sm:px-3.5 sm:text-base"
          />
          <div className="max-h-48 overflow-y-auto sm:max-h-56">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-white transition hover:bg-teal-500 sm:px-3.5 sm:py-3 sm:text-base"
              >
                <span className="font-medium text-white">
                  {c.id}. {c.name_simple}
                </span>
                <span className="font-arabic text-teal-100">{c.name_arabic}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2.5 text-xs text-teal-100 sm:px-3.5 sm:py-3 sm:text-sm">Surah tidak ditemukan</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
