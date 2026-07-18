import { create } from "zustand";
import {
  TermWithExplanation,
  TermCategory,
  ExtractTermsResponse,
  TermExplanation,
} from "@/lib/types";

interface TermsState {
  documentId: string;
  documentTitle: string;
  documentSummary: string;
  terms: TermWithExplanation[];
  searchQuery: string;
  activeCategory: TermCategory | "全部";

  setTerms: (response: ExtractTermsResponse & { documentId?: string }) => void;
  loadFromDb: (documentId: string) => Promise<void>;
  setExplanation: (termId: string, explanation: TermExplanation) => void;
  setExplanationLoading: (termId: string, loading: boolean) => void;
  setStreamingText: (termId: string, text: string) => void;
  clearStreamingText: (termId: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: TermCategory | "全部") => void;
  reset: () => void;
  getFilteredTerms: () => TermWithExplanation[];
  getTermById: (id: string) => TermWithExplanation | undefined;
}

export const useTermsStore = create<TermsState>((set, get) => ({
  documentId: "",
  documentTitle: "",
  documentSummary: "",
  terms: [],
  searchQuery: "",
  activeCategory: "全部",

  setTerms: (response) =>
    set({
      documentId: response.documentId || "",
      documentTitle: response.documentTitle,
      documentSummary: response.documentSummary,
      terms: response.terms.map((t) => ({ ...t })),
      searchQuery: "",
      activeCategory: "全部",
    }),

  loadFromDb: async (documentId: string) => {
    const res = await fetch(`/api/documents/${documentId}`);
    if (!res.ok) throw new Error("載入失敗");
    const data = await res.json();
    set({
      documentId: data.documentId,
      documentTitle: data.documentTitle,
      documentSummary: data.documentSummary,
      terms: data.terms,
      searchQuery: "",
      activeCategory: "全部",
    });
  },

  setExplanation: (termId, explanation) =>
    set((state) => ({
      terms: state.terms.map((t) =>
        t.id === termId
          ? { ...t, explanation, explanationLoading: false }
          : t
      ),
    })),

  setExplanationLoading: (termId, loading) =>
    set((state) => ({
      terms: state.terms.map((t) =>
        t.id === termId ? { ...t, explanationLoading: loading } : t
      ),
    })),

  setStreamingText: (termId, text) =>
    set((state) => ({
      terms: state.terms.map((t) =>
        t.id === termId ? { ...t, streamingText: text } : t
      ),
    })),

  clearStreamingText: (termId) =>
    set((state) => ({
      terms: state.terms.map((t) =>
        t.id === termId ? { ...t, streamingText: undefined } : t
      ),
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),

  reset: () =>
    set({
      documentId: "",
      documentTitle: "",
      documentSummary: "",
      terms: [],
      searchQuery: "",
      activeCategory: "全部",
    }),

  getFilteredTerms: () => {
    const { terms, searchQuery, activeCategory } = get();
    return terms.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.termEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.termZh.includes(searchQuery);
      const matchesCategory =
        activeCategory === "全部" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  },

  getTermById: (id) => get().terms.find((t) => t.id === id),
}));
