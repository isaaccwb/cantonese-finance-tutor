export interface DocumentRecord {
  id: string;
  title: string;
  fileName: string;
  summary: string | null;
  pageCount: number | null;
  termCount: number | null;
  createdAt: string;
}
