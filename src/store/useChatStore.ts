import { create } from "zustand";

export type MessageType = "text" | "tafsir" | "search" | "error" | "not_found" | "loading";

export interface TafsirData {
  surah: number;
  ayah: number;
  verse_key: string;
  surah_name: string;
  ayah_arabic: string;
  ayah_translation: string;
  translation_name: string;
  tafsir_text: string;
  tafsir_id: number;
  tafsir_source: string;
  summary?: string;
}

export interface SearchResult {
  surah: number;
  ayah: number;
  verse_key: string;
  surah_name: string;
  text_snippet: string;
  arabic: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: MessageType;
  data?: TafsirData | { query: string; results: SearchResult[]; total: number };
  aiError?: string;
  aiUsed?: boolean;
}

export interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

export interface TafsirResource {
  id: number;
  name: string;
  author_name?: string;
  language_name?: string;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  chapters: Chapter[];
  tafsirs: TafsirResource[];
  translations: TafsirResource[];
  selectedTafsirId: number;
  language: "id" | "en";
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setChapters: (chapters: Chapter[]) => void;
  setTafsirs: (tafsirs: TafsirResource[]) => void;
  setTranslations: (translations: TafsirResource[]) => void;
  setSelectedTafsirId: (id: number) => void;
  setLanguage: (lang: "id" | "en") => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "Tanyakan tafsir atau topik pembahasan",
      type: "text",
    },
  ],
  loading: false,
  chapters: [],
  tafsirs: [],
  translations: [],
  selectedTafsirId: 169,
  language: "id",
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
  setLoading: (loading) => set({ loading }),
  setChapters: (chapters) => set({ chapters }),
  setTafsirs: (tafsirs) => set({ tafsirs }),
  setTranslations: (translations) => set({ translations }),
  setSelectedTafsirId: (id) => set({ selectedTafsirId: id }),
  setLanguage: (language) => set({ language }),
  clearMessages: () =>
    set({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Tanyakan tafsir atau topik pembahasan",
          type: "text",
        },
      ],
    }),
}));
