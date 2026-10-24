import type { ChatMessage as Message, TafsirData, SearchResult } from "@/store/useChatStore";
import { BookOpen, User, Search } from "lucide-react";
import Logo from "./Logo";

interface Props {
  message: Message;
  onSelectResult?: (surah: number, ayah: number) => void;
}

export default function ChatMessage({ message, onSelectResult }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[92%] gap-2 rounded-xl px-2.5 py-2 shadow-sm sm:max-w-[90%] sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 md:max-w-[80%] ${
          isUser
            ? "bg-emerald-700 text-white"
            : "bg-white text-emerald-950 border border-emerald-100"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isUser ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/30 sm:h-8 sm:w-8">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 p-0.5 sm:h-8 sm:w-8 sm:p-1">
              <Logo className="h-full w-full" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
          {message.aiUsed && (
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 sm:text-xs">
              ✨ Dijelaskan dengan AI
            </div>
          )}
          {message.aiError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700 sm:text-xs">
              ⚠️ {message.aiError}
            </div>
          )}

          {message.type === "tafsir" && message.data && (
            <TafsirView data={message.data as TafsirData} />
          )}

          {message.type === "search" && message.data && (
            <SearchResultsView
              data={message.data as { query: string; results: SearchResult[]; total: number }}
              onSelect={onSelectResult}
            />
          )}

          {(message.type === "text" || message.type === "error" || message.type === "not_found") && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap sm:text-base">{message.content}</div>
          )}

          {message.type === "loading" && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 sm:text-base">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
              Mengambil data…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TafsirView({ data }: { data: TafsirData }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 sm:text-sm">
        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="truncate">Tafsir {data.tafsir_source}</span>
      </div>

      <div className="rounded-lg bg-emerald-50/70 p-3 text-right sm:rounded-xl sm:p-4">
        <p className="font-arabic text-2xl leading-normal text-emerald-950 sm:text-3xl md:text-4xl md:leading-loose">
          {data.ayah_arabic}
        </p>
        <p className="mt-2 text-sm font-medium text-emerald-700 sm:mt-3 sm:text-base">
          {data.surah_name} ({data.surah}:{data.ayah})
        </p>
      </div>

      {data.ayah_translation && (
        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3 sm:rounded-xl sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 sm:text-sm">
            Terjemahan — {data.translation_name || "English"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900 sm:text-base">
            {data.ayah_translation}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-emerald-100 bg-white p-3 sm:rounded-xl sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 sm:text-sm">Tafsir</p>
          {data.tafsir_text ? (
          <div
            className="tafsir-html mt-2 text-sm text-emerald-900 sm:mt-3 sm:text-base"
            dangerouslySetInnerHTML={{ __html: data.tafsir_text }}
          />
        ) : (
          <p className="mt-2 text-sm text-emerald-700 sm:mt-3 sm:text-base">Tafsir tidak tersedia untuk ayat ini.</p>
        )}
      </div>

      <p className="text-[10px] text-emerald-400 sm:text-xs">
        Sumber: Quran.com — {data.tafsir_source}
      </p>
    </div>
  );
}

function SearchResultsView({
  data,
  onSelect,
}: {
  data: { query: string; results: SearchResult[]; total: number };
  onSelect?: (surah: number, ayah: number) => void;
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 sm:text-sm">
        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        Hasil Pencarian
      </div>
      <p className="text-sm text-emerald-800 sm:text-base">
        Ditemukan {data.total} ayat untuk kata kunci “{data.query}”. Klik untuk lihat tafsir.
      </p>
      <div className="grid gap-2 sm:gap-3">
        {data.results.map((r) => (
          <button
            key={r.verse_key}
            onClick={() => onSelect?.(r.surah, r.ayah)}
            className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5 text-left transition hover:bg-emerald-100/60 sm:rounded-xl sm:p-3"
          >
            <p className="text-sm font-semibold text-emerald-800 sm:text-base">
              {r.surah_name || `Surah ${r.surah}`} {r.ayah} ({r.verse_key})
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-emerald-600 sm:text-sm">{r.text_snippet}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
