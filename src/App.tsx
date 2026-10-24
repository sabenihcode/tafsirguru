import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, BookOpen } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { fetchChapters, fetchTafsirs, fetchTranslations, chatWithBot, initDefaults, setApiLanguage } from "@/services/api";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import SurahAutocomplete from "@/components/SurahAutocomplete";
import type { Chapter } from "@/store/useChatStore";

export default function App() {
  const {
    messages,
    loading,
    chapters,
    tafsirs,
    selectedTafsirId,
    language,
    addMessage,
    setLoading,
    setChapters,
    setTafsirs,
    setTranslations,
    setSelectedTafsirId,
    setLanguage,
    clearMessages,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<Chapter | null>(null);
  const [ayahInput, setAyahInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initDefaults(language);
    fetchChapters().then(setChapters).catch(() => setError("Gagal memuat daftar surah."));
    fetchTafsirs().then(setTafsirs).catch(() => {});
    fetchTranslations().then((list) => {
      setTranslations(list);
      setApiLanguage(language);
    }).catch(() => {});
  }, [setChapters, setTafsirs, setTranslations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question) return;

    setInput("");
    setError(null);
    addMessage({ id: crypto.randomUUID(), role: "user", content: question, type: "text" });
    setLoading(true);
    addMessage({ id: crypto.randomUUID(), role: "assistant", content: "", type: "loading" });

    const finalize = (assistant: { id?: string; role: "assistant"; content: string; type: any; data?: any; aiError?: string; aiUsed?: boolean }) => {
      const current = useChatStore.getState().messages;
      const withoutLoading = current.filter((m) => m.type !== "loading");
      useChatStore.setState({ messages: [...withoutLoading, { ...assistant, id: assistant.id || crypto.randomUUID() }] });
    };

    try {
      const res = await chatWithBot(question, selectedTafsirId, language);
      finalize({
        role: "assistant",
        content: res.answer,
        type: res.type === "search" ? "search" : res.type === "not_found" ? "not_found" : res.type === "error" ? "error" : "tafsir",
        data: res.source_data,
        aiError: res.ai_error,
        aiUsed: res.type === "tafsir" && !res.ai_error,
      });
    } catch (err: any) {
      finalize({
        role: "assistant",
        content: err?.response?.data?.detail || "Gagal terhubung ke server tafsir, coba lagi.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualTafsir = async () => {
    if (!selectedSurah || !ayahInput) {
      setError("Pilih surah dan masukkan nomor ayat.");
      return;
    }
    const ayah = parseInt(ayahInput, 10);
    if (Number.isNaN(ayah) || ayah < 1 || ayah > selectedSurah.verses_count) {
      setError(`Ayat harus antara 1-${selectedSurah.verses_count} untuk ${selectedSurah.name_simple}.`);
      return;
    }
    const question = `Surah ${selectedSurah.name_simple} ayat ${ayah}`;
    await handleSend(question);
    setAyahInput("");
  };

  const handleSelectResult = async (surah: number, ayah: number) => {
    const name = chapters.find((c) => c.id === surah)?.name_simple || String(surah);
    const question = `Surah ${name} ayat ${ayah}`;
    setInput(question);
    await handleSend(question);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-emerald-50/50">
      <Header />

      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-3 sm:space-y-4 sm:py-4">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onSelectResult={handleSelectResult} />
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-emerald-100 bg-white p-2 shadow-lg sm:rounded-2xl sm:p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
            <div className="sm:col-span-7">
              <SurahAutocomplete
                chapters={chapters}
                value={selectedSurah}
                onChange={setSelectedSurah}
                placeholder="Pilih surah…"
              />
            </div>
            <div className="flex gap-2 sm:col-span-5">
              <input
                type="number"
                min={1}
                max={selectedSurah?.verses_count || 286}
                value={ayahInput}
                onChange={(e) => setAyahInput(e.target.value)}
                placeholder="Ayat"
                className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-sm text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:rounded-xl sm:px-3.5 sm:text-base"
              />
              <button
                type="button"
                onClick={handleManualTafsir}
                disabled={loading}
                className="shrink-0 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 sm:rounded-xl sm:px-3.5 sm:text-base"
              >
                Tafsir
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tanyakan tafsir atau kata kunci…"
              className="flex-1 rounded-lg border border-emerald-200 bg-white px-3.5 py-2.5 text-sm text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:rounded-xl sm:px-4 sm:py-3 sm:text-base"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-emerald-900 shadow-sm hover:bg-amber-300 disabled:opacity-60 sm:h-11 sm:w-11 sm:rounded-xl"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={clearMessages}
              title="Hapus percakapan"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 sm:h-11 sm:w-11 sm:rounded-xl"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-emerald-500 sm:text-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>Tafsir:</span>
                <select
                  value={selectedTafsirId}
                  onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
                  className="rounded border border-emerald-200 bg-white px-1 py-0.5 text-emerald-700 focus:outline-none"
                >
                  {tafsirs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                  {tafsirs.length === 0 && <option value={169}>Ibn Kathir (Abridged)</option>}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span>Bahasa:</span>
                <select
                  value={language}
                  onChange={(e) => {
                    const lang = e.target.value as "id" | "en";
                    setLanguage(lang);
                    setApiLanguage(lang);
                  }}
                  className="rounded border border-emerald-200 bg-white px-1 py-0.5 text-emerald-700 focus:outline-none"
                >
                  <option value="id">Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <span className="hidden sm:inline">Format: Surah [nama] ayat [nomor]</span>
          </div>
        </div>
      </main>
    </div>
  );
}
