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
        className={`flex max-w-[90%] gap-3 rounded-2xl px-4 py-3 shadow-sm md:max-w-[80%] ${
          isUser
            ? "bg-emerald-700 text-white"
            : "bg-white text-emerald-950 border border-emerald-100"
        }`}
      >
        <div className="mt-1 shrink-0">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/30">
              <User className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 p-1">
              <Logo />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
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
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
          )}

          {message.type === "loading" && (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
              Mengambil data dari Quran.com API…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TafsirView({ data }: { data: TafsirData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
        <BookOpen className="h-4 w-4" />
        Tafsir {data.tafsir_source}
      </div>

      <div className="rounded-xl bg-emerald-50/70 p-4 text-right">
        <p className="font-arabic text-2xl leading-loose text-emerald-950 md:text-3xl">
          {data.ayah_arabic}
        </p>
        <p className="mt-3 text-sm font-medium text-emerald-700">
          {data.surah_name} ({data.surah}:{data.ayah})
        </p>
      </div>

      {data.ayah_translation && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Terjemahan — {data.translation_name || "English"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900">
            {data.ayah_translation}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-emerald-100 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Tafsir</p>
          {data.tafsir_text ? (
          <div
            className="tafsir-html mt-2 text-emerald-900"
            dangerouslySetInnerHTML={{ __html: data.tafsir_text }}
          />
        ) : (
          <p className="mt-2 text-sm text-emerald-700">Tafsir tidak tersedia untuk ayat ini.</p>
        )}
      </div>

      <p className="text-[10px] text-emerald-400">
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
        <Search className="h-4 w-4" />
        Hasil Pencarian
      </div>
      <p className="text-sm text-emerald-800">
        Ditemukan {data.total} ayat untuk kata kunci “{data.query}”. Klik untuk lihat tafsir.
      </p>
      <div className="grid gap-2">
        {data.results.map((r) => (
          <button
            key={r.verse_key}
            onClick={() => onSelect?.(r.surah, r.ayah)}
            className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-left transition hover:bg-emerald-100/60"
          >
            <p className="text-sm font-semibold text-emerald-800">
              {r.surah_name || `Surah ${r.surah}`} {r.ayah} ({r.verse_key})
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-emerald-600">{r.text_snippet}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
