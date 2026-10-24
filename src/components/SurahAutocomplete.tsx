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
        className="flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-white px-2.5 py-2 text-left text-xs text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:rounded-xl sm:px-3 sm:text-sm"
      >
        <span className="truncate">
          {value ? `${value.id}. ${value.name_simple}` : placeholder || "Pilih surah…"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-lg sm:rounded-xl">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari surah…"
            className="w-full border-b border-emerald-100 px-2.5 py-2 text-xs text-emerald-900 placeholder-emerald-300 focus:outline-none sm:px-3 sm:text-sm"
          />
          <div className="max-h-44 overflow-y-auto sm:max-h-52">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs hover:bg-emerald-50 sm:px-3 sm:py-2 sm:text-sm"
              >
                <span className="text-emerald-900">
                  {c.id}. {c.name_simple}
                </span>
                <span className="font-arabic text-emerald-600">{c.name_arabic}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2.5 py-1.5 text-[11px] text-emerald-400 sm:px-3 sm:py-2 sm:text-xs">Surah tidak ditemukan</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
