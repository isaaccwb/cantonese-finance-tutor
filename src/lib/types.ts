export type TermCategory =
  | "統計學"
  | "計量經濟學"
  | "金融市場"
  | "風險管理"
  | "投資學"
  | "會計學"
  | "宏觀經濟"
  | "機器學習"
  | "其他";

export interface ExtractedTerm {
  id: string;
  termEn: string;
  termZh: string;
  category: TermCategory;
  contextSnippet: string;
  pageNumber?: number;
}

export interface TermExplanation {
  termId: string;
  academic: string;
  plainCantonese: string;
  researchContext: string;
  conclusionChain: {
    conclusion: string;
    evidence: string;
    translation: string;
  };
  inOtherWords: string;
  contrast: string;
}

export interface TermWithExplanation extends ExtractedTerm {
  explanation?: TermExplanation;
  explanationLoading?: boolean;
}

export interface ExtractTermsResponse {
  terms: ExtractedTerm[];
  documentTitle: string;
  documentSummary: string;
}

export interface ExplainTermResponse {
  explanation: TermExplanation;
}

export type UploadStatus =
  | { stage: "idle" }
  | { stage: "reading"; fileName: string }
  | { stage: "extracting"; fileName: string }
  | { stage: "done"; termCount: number }
  | { stage: "error"; message: string };
