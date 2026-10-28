import axios from "axios";
import type { Chapter, TafsirResource, TafsirData, SearchResult } from "@/store/useChatStore";
import { extractSurahAyah, nameToSurahId, getSurahById } from "@/lib/surahNames";
const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL as string) || "";
const USE_BACKEND_RAW = ((import.meta as any).env?.VITE_USE_BACKEND as string) === "true";
const QURAN_API = "https://api.quran.com/api/v4";
// Backend aktif jika VITE_USE_BACKEND=true atau VITE_API_BASE_URL di-set (full URL atau /api)
const USE_BACKEND = USE_BACKEND_RAW || Boolean(API_BASE);

// Kalau API_BASE adalah full URL (http...), jadikan baseURL axios.
// Kalau API_BASE kosong atau hanya "/api", endpoint dipanggil dengan path absolut agar tidak double prefix.
const backendClient = axios.create({
  baseURL: API_BASE.startsWith("http") ? API_BASE : undefined,
  timeout: 45000,
});

const quranClient = axios.create({
  baseURL: QURAN_API,
  timeout: 15000,
});

// Endpoint backend selalu diawali /api sesuai definisi FastAPI.
const API_PREFIX = "/api";

let translationMap: TafsirResource[] = [];
let currentLanguage: "id" | "en" = "id";
let defaultTranslationId = 33; // fallback bahasa Indonesia

const ALLOWED_TAFSIR_IDS = [14, 90]; // Ibn Kathir (Arabic), Al-Qurtubi (Arabic)

export function getDefaultTranslationId(language: "id" | "en"): number {
  const lang = language === "id" ? "indonesian" : "english";
  const found = translationMap.find((t) => (t.language_name || "").toLowerCase() === lang);
  return found?.id || defaultTranslationId;
}

export async function initDefaults(language: "id" | "en" = "id") {
  currentLanguage = language;
  try {
    const res = await quranClient.get("/resources/translations");
    translationMap = (res.data.translations || []) as TafsirResource[];
    const id = getDefaultTranslationId(language);
    if (id) defaultTranslationId = id;
  } catch {
    // fallback 33 (Indonesia) / 85 (English)
    defaultTranslationId = language === "id" ? 33 : 85;
  }
}

export function setApiLanguage(language: "id" | "en") {
  currentLanguage = language;
  const id = getDefaultTranslationId(language);
  if (id) defaultTranslationId = id;
}

export function getCurrentLanguage(): "id" | "en" {
  return currentLanguage;
}

function stripTags(html: string): string {
  let text = html || "";
  // Hapus tag <sup> beserta nomor catatan kaki/footnote
  text = text.replace(/<sup[^>]*>.*?<\/sup>/gi, "");
  // Hapus sisa tag HTML
  text = text.replace(/<[^>]+>/g, "");
  // Rapikan spasi berlebih
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export async function fetchChapters(): Promise<Chapter[]> {
  if (USE_BACKEND) {
    const res = await backendClient.get(`${API_PREFIX}/chapters`);
    return res.data.chapters;
  }
  const res = await quranClient.get("/chapters");
  return res.data.chapters;
}

export async function fetchTafsirs(): Promise<TafsirResource[]> {
  if (USE_BACKEND) {
    const res = await backendClient.get(`${API_PREFIX}/tafsirs`);
    return res.data.tafsirs;
  }
  const res = await quranClient.get("/resources/tafsirs");
  const all: TafsirResource[] = res.data.tafsirs || [];
  const filtered = all.filter((t) => ALLOWED_TAFSIR_IDS.includes(t.id));
  const order: Record<number, number> = { 14: 0, 90: 1 };
  filtered.sort((a, b) => (order[a.id] ?? 999) - (order[b.id] ?? 999));
  return filtered;
}

export async function fetchTranslations(): Promise<TafsirResource[]> {
  if (USE_BACKEND) {
    const res = await backendClient.get(`${API_PREFIX}/translations`);
    return res.data.translations;
  }
  const res = await quranClient.get("/resources/translations");
  return res.data.translations;
}

export async function fetchTafsir(
  surah: number,
  ayah: number,
  tafsirId: number
): Promise<TafsirData> {
  if (USE_BACKEND) {
    const res = await backendClient.get(`${API_PREFIX}/tafsir/${surah}/${ayah}`, {
      params: { tafsir_id: tafsirId, translation_id: defaultTranslationId, summarize: false },
    });
    const data = res.data;
    // Backend bisa return object dengan field "error" jika gagal
    if (data && data.error && !data.tafsir_text && !data.ayah_arabic) {
      throw new Error(data.error);
    }
    return data;
  }

  const verseKey = `${surah}:${ayah}`;
  const [tafsirRes, arabicRes, transRes] = await Promise.all([
    quranClient.get(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`),
    quranClient.get(`/quran/verses/uthmani?verse_key=${verseKey}`),
    quranClient.get(`/quran/translations/${defaultTranslationId}?verse_key=${verseKey}`),
  ]);

  const tafsir = tafsirRes.data.tafsir || {};
  const arabicVerses = arabicRes.data.verses || [];
  const translations = transRes.data.translations || [];

  return {
    surah,
    ayah,
    verse_key: verseKey,
    surah_name: getSurahById(surah)?.english || `Surah ${surah}`,
    ayah_arabic: arabicVerses[0]?.text_uthmani || "",
    ayah_translation: stripTags(translations[0]?.text || ""),
    translation_name: transRes.data.meta?.translation_name || "",
    tafsir_text: tafsir.text || "",
    tafsir_id: tafsirId,
    tafsir_source: tafsir.resource_name || "Quran.com Tafsir",
  };
}

export async function searchAyahs(query: string): Promise<{ total: number; results: SearchResult[] }> {
  const lang = currentLanguage === "id" ? "id" : "en";
  if (USE_BACKEND) {
    const res = await backendClient.get(`${API_PREFIX}/search`, { params: { q: query, size: 10, language: lang } });
    return { total: res.data.total, results: res.data.results };
  }

  const res = await quranClient.get("/search", { params: { q: query, size: 10, language: lang } });
  const raw: Array<{
    verse_key: string;
    text?: string;
    translations?: Array<{ text: string }>;
  }> = res.data.search?.results || [];

    const results: SearchResult[] = raw.map((item) => {
      const [s, a] = item.verse_key.split(":");
      const surah = parseInt(s, 10);
      const ayah = parseInt(a, 10);
      const snippet = item.translations?.length
        ? stripTags(item.translations[0].text)
        : (item.text || "").slice(0, 200);
      return {
        surah,
        ayah,
        verse_key: item.verse_key,
        surah_name: getSurahById(surah)?.english || `Surah ${surah}`,
        text_snippet: snippet,
        arabic: item.text || "",
      };
    });

  return { total: res.data.search?.total_results || 0, results };
}

export async function translateToIndonesian(text: string): Promise<string> {
  if (USE_BACKEND) {
    const encoded = encodeURIComponent(text);
    const res = await backendClient.get(`${API_PREFIX}/translate?q=${encoded}`);
    return res.data.translated_text;
  }
  // Direct mode: tidak tersedia tanpa backend
  throw new Error("Fitur translate memerlukan backend");
}

export async function aiChat(question: string): Promise<{ answer: string }> {
  if (USE_BACKEND) {
    const res = await backendClient.post(`${API_PREFIX}/ai-chat`, { question });
    return res.data;
  }
  throw new Error("Fitur AI chat memerlukan backend");
}

export async function chatWithBot(
  question: string,
  tafsirId: number,
  language: "id" | "en" = currentLanguage
): Promise<{
  answer: string;
  type: "tafsir" | "search" | "not_found" | "error";
  source_data: TafsirData | { query: string; results: SearchResult[]; total: number };
}> {
  if (USE_BACKEND) {
    const res = await backendClient.post(`${API_PREFIX}/chat`, { question, tafsir_id: tafsirId, language });
    return res.data;
  }

  // Direct mode: replicate backend logic in browser
  const ref = extractSurahAyah(question);
  if (ref) {
    try {
      const data = await fetchTafsir(ref.surah, ref.ayah, tafsirId);
      return { answer: data.tafsir_text, type: "tafsir", source_data: data };
    } catch (err: any) {
      return {
        answer: err?.response?.data?.detail || "Gagal mengambil tafsir dari Quran.com API.",
        type: "error",
        source_data: { query: question, results: [], total: 0 },
      };
    }
  }

  try {
    const searchRes = await searchAyahs(question);
    if (!searchRes.results.length) {
      return {
        answer:
          "Tidak ditemukan hasil untuk pertanyaan ini. Coba gunakan format: 'Surah [nama] ayat [nomor]' atau kata kunci lain.",
        type: "not_found",
        source_data: { query: question, results: [], total: 0 },
      };
    }
    return {
      answer: `Ditemukan ${searchRes.total} ayat yang relevan dengan kata kunci '${question}'.`,
      type: "search",
      source_data: { query: question, ...searchRes },
    };
  } catch (err: any) {
    return {
      answer: "Gagal terhubung ke server tafsir, coba lagi.",
      type: "error",
      source_data: { query: question, results: [], total: 0 },
    };
  }
}

export { nameToSurahId };
