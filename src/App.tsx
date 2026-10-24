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

    const finalize = (assistant: { id?: string; role: "assistant"; content: string; type: any; data?: any }) => {
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
    <div className="flex min-h-screen flex-col bg-emerald-50/50">
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-4">
        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onSelectResult={handleSelectResult} />
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-3 shadow-lg">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <SurahAutocomplete
                chapters={chapters}
                value={selectedSurah}
                onChange={setSelectedSurah}
                placeholder="Pilih surah…"
              />
            </div>
            <div className="flex gap-2 sm:col-span-6">
              <input
                type="number"
                min={1}
                max={selectedSurah?.verses_count || 286}
                value={ayahInput}
                onChange={(e) => setAyahInput(e.target.value)}
                placeholder="Ayat"
                className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleManualTafsir}
                disabled={loading}
                className="shrink-0 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
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
              placeholder="Tanyakan tafsir atau kata kunci (contoh: QS 2:255 / sabar)"
              className="flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-emerald-900 shadow-sm hover:bg-amber-300 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={clearMessages}
              title="Hapus percakapan"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-emerald-500">
            <div className="flex flex-wrap items-center gap-2">
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
          </div>
        </div>
      </main>
    </div>
  );
}
