import type { ChatMessage as Message, TafsirData, SearchResult } from "@/store/useChatStore";
import { BookOpen, User, Search, Copy, Check } from "lucide-react";
import Logo from "./Logo";
import { useState } from "react";

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
            ? "bg-teal-700 text-white"
            : "bg-white text-black border border-teal-100"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isUser ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/30 sm:h-8 sm:w-8">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-teal-100 p-0.5 sm:h-8 sm:w-8 sm:p-1">
              <Logo className="h-full w-full" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
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

function stripTags(html: string): string {
  return (html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback ignored
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2 py-1 text-[10px] font-medium text-teal-700 transition hover:bg-teal-50 sm:text-xs"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

function TranslateButton({ text, onTranslated }: { text: string; onTranslated: (translated: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    try {
      const translated = await import("@/services/api").then((m) => m.translateToIndonesian(text));
      onTranslated(translated);
    } catch (err: any) {
      setError("Gagal menerjemahkan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleTranslate}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-700 transition hover:bg-teal-100 disabled:opacity-60 sm:text-xs"
      >
        {loading ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-teal-300 border-t-teal-700" />
        ) : (
          <span>🇮🇩</span>
        )}
        {loading ? "Menerjemahkan…" : "Terjemahkan ke Indonesia"}
      </button>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
}

function TafsirView({ data }: { data: TafsirData }) {
  const [translatedTafsir, setTranslatedTafsir] = useState<string | null>(null);

  const ayahText = [
    `${data.surah_name} (${data.surah}:${data.ayah})`,
    data.ayah_arabic,
  ].join("\n\n");

  const translationText = [
    `${data.surah_name} (${data.surah}:${data.ayah})`,
    `Terjemahan — ${data.translation_name || "English"}`,
    data.ayah_translation,
  ].join("\n\n");

  const tafsirText = [
    `${data.surah_name} (${data.surah}:${data.ayah})`,
    `Tafsir — ${data.tafsir_source}`,
    stripTags(data.tafsir_text),
    `Sumber: Quran.com — ${data.tafsir_source}`,
  ].join("\n\n");

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-600 sm:text-sm">
        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="truncate">Tafsir {data.tafsir_source}</span>
      </div>

      <div className="rounded-xl bg-teal-50 p-3 sm:rounded-2xl sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 sm:text-sm">Ayat</p>
          <CopyButton text={ayahText} />
        </div>
        <p className="font-arabic text-2xl leading-normal text-black sm:text-3xl md:text-4xl md:leading-loose">
          {data.ayah_arabic}
        </p>
        <p className="mt-2 text-sm font-medium text-teal-700 sm:mt-3 sm:text-base">
          {data.surah_name} ({data.surah}:{data.ayah})
        </p>
      </div>

      {data.ayah_translation && (
        <div className="rounded-xl border border-teal-100 bg-white p-3 sm:rounded-2xl sm:p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 sm:text-sm">
              Terjemahan — {data.translation_name || "English"}
            </p>
            <CopyButton text={translationText} />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-black sm:text-base">
            {data.ayah_translation}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-teal-100 bg-white p-3 sm:rounded-2xl sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 sm:text-sm">Tafsir</p>
          <div className="flex items-center gap-2">
            <TranslateButton text={stripTags(data.tafsir_text)} onTranslated={setTranslatedTafsir} />
            <CopyButton text={tafsirText} />
          </div>
        </div>
        {data.tafsir_text ? (
          <div className="space-y-3">
            <div
              className="tafsir-html text-sm text-black sm:text-base"
              dangerouslySetInnerHTML={{ __html: data.tafsir_text }}
            />
            {translatedTafsir && (
              <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3">
                <p className="mb-1 text-xs font-semibold text-teal-700">Terjemahan Indonesia:</p>
                <p className="text-sm leading-relaxed text-black sm:text-base">{translatedTafsir}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-600 sm:text-base">Tafsir tidak tersedia untuk ayat ini.</p>
        )}
      </div>

      <p className="text-[10px] text-neutral-400 sm:text-xs">
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
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-600 sm:text-sm">
        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        Hasil Pencarian
      </div>
      <p className="text-sm text-black sm:text-base">
        Ditemukan {data.total} ayat untuk kata kunci “{data.query}”. Klik untuk lihat tafsir.
      </p>
      <div className="grid gap-2 sm:gap-3">
        {data.results.map((r) => (
          <button
            key={r.verse_key}
            onClick={() => onSelect?.(r.surah, r.ayah)}
            className="rounded-xl border border-teal-100 bg-teal-50 p-2.5 text-left transition hover:bg-teal-100 sm:rounded-2xl sm:p-3"
          >
            <p className="text-sm font-semibold text-black sm:text-base">
              {r.surah_name || `Surah ${r.surah}`} {r.ayah} ({r.verse_key})
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-neutral-700 sm:text-sm">{r.text_snippet}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
