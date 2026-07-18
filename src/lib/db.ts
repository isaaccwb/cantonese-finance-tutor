import Database from "better-sqlite3";
import path from "path";
import {
  ExtractedTerm,
  ExtractTermsResponse,
  TermExplanation,
  TermWithExplanation,
} from "./types";

const DB_PATH = path.join(process.cwd(), "data", "terms.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      fileName TEXT NOT NULL,
      summary TEXT,
      pageCount INTEGER,
      termCount INTEGER,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS terms (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      termEn TEXT NOT NULL,
      termZh TEXT NOT NULL,
      category TEXT NOT NULL,
      contextSnippet TEXT,
      pageNumber INTEGER
    );

    CREATE TABLE IF NOT EXISTS explanations (
      termId TEXT PRIMARY KEY REFERENCES terms(id) ON DELETE CASCADE,
      academic TEXT,
      plainCantonese TEXT,
      researchContext TEXT,
      conclusionJson TEXT,
      inOtherWords TEXT,
      contrast TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_terms_documentId ON terms(documentId);
  `);
}

// === Documents ===

export interface DocumentRecord {
  id: string;
  title: string;
  fileName: string;
  summary: string | null;
  pageCount: number | null;
  termCount: number | null;
  createdAt: string;
}

export function listDocuments(): DocumentRecord[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM documents ORDER BY createdAt DESC")
    .all() as DocumentRecord[];
}

export function getDocument(id: string): DocumentRecord | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as
    | DocumentRecord
    | undefined;
}

export function saveDocument(
  id: string,
  data: ExtractTermsResponse,
  fileName: string,
  pageCount?: number
) {
  const db = getDb();
  const insertDoc = db.prepare(`
    INSERT OR REPLACE INTO documents (id, title, fileName, summary, pageCount, termCount)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertTerm = db.prepare(`
    INSERT OR REPLACE INTO terms (id, documentId, termEn, termZh, category, contextSnippet, pageNumber)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const txn = db.transaction(() => {
    insertDoc.run(
      id,
      data.documentTitle || fileName,
      fileName,
      data.documentSummary || null,
      pageCount || null,
      data.terms.length
    );
    for (const term of data.terms) {
      insertTerm.run(
        term.id,
        id,
        term.termEn,
        term.termZh,
        term.category,
        term.contextSnippet || null,
        term.pageNumber || null
      );
    }
  });
  txn();
}

export function renameDocument(id: string, title: string) {
  const db = getDb();
  db.prepare("UPDATE documents SET title = ? WHERE id = ?").run(title, id);
}

export function deleteDocument(id: string) {
  const db = getDb();
  // CASCADE will delete terms and explanations
  db.prepare("DELETE FROM documents WHERE id = ?").run(id);
}

// === Terms ===

export function getTermsByDocument(
  documentId: string
): TermWithExplanation[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT t.*,
              e.academic, e.plainCantonese, e.researchContext,
              e.conclusionJson, e.inOtherWords, e.contrast
       FROM terms t
       LEFT JOIN explanations e ON t.id = e.termId
       WHERE t.documentId = ?`
    )
    .all(documentId) as Array<
    ExtractedTerm & {
      academic?: string;
      plainCantonese?: string;
      researchContext?: string;
      conclusionJson?: string;
      inOtherWords?: string;
      contrast?: string;
    }
  >;

  return rows.map((row) => {
    const term: TermWithExplanation = {
      id: row.id,
      termEn: row.termEn,
      termZh: row.termZh,
      category: row.category,
      contextSnippet: row.contextSnippet,
      pageNumber: row.pageNumber,
    };

    if (row.academic) {
      term.explanation = {
        termId: row.id,
        academic: row.academic,
        plainCantonese: row.plainCantonese || "",
        researchContext: row.researchContext || "",
        conclusionChain: row.conclusionJson
          ? JSON.parse(row.conclusionJson)
          : { conclusion: "", evidence: "", translation: "" },
        inOtherWords: row.inOtherWords || "",
        contrast: row.contrast || "",
      };
    }

    return term;
  });
}

// === Explanations ===

export function saveExplanation(explanation: TermExplanation) {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO explanations
     (termId, academic, plainCantonese, researchContext, conclusionJson, inOtherWords, contrast)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    explanation.termId,
    explanation.academic,
    explanation.plainCantonese,
    explanation.researchContext,
    JSON.stringify(explanation.conclusionChain),
    explanation.inOtherWords,
    explanation.contrast
  );
}

// === Export ===

export function exportTermsAsJson(documentId: string) {
  const doc = getDocument(documentId);
  const terms = getTermsByDocument(documentId);
  return { document: doc, terms };
}

export function exportTermsAsCsv(documentId: string): string {
  const terms = getTermsByDocument(documentId);
  const headers = [
    "英文術語",
    "中文術語",
    "分類",
    "上下文",
    "頁碼",
    "學術版",
    "人話版",
    "即係話",
  ];
  const rows = terms.map((t) => [
    csvEscape(t.termEn),
    csvEscape(t.termZh),
    csvEscape(t.category),
    csvEscape(t.contextSnippet),
    t.pageNumber?.toString() || "",
    csvEscape(t.explanation?.academic || ""),
    csvEscape(t.explanation?.plainCantonese || ""),
    csvEscape(t.explanation?.inOtherWords || ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function csvEscape(str: string): string {
  if (!str) return "";
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// === Merge ===

export function mergeDocuments(
  documentIds: string[],
  newTitle: string
): string {
  const db = getDb();
  const newId = `doc-merged-${Date.now()}`;

  const txn = db.transaction(() => {
    // Collect all terms from source documents
    const allTerms: TermWithExplanation[] = [];
    const summaries: string[] = [];

    for (const docId of documentIds) {
      const doc = getDocument(docId);
      if (doc?.summary) summaries.push(doc.summary);
      const terms = getTermsByDocument(docId);
      allTerms.push(...terms);
    }

    // Deduplicate by termEn (keep first occurrence)
    const seen = new Set<string>();
    const uniqueTerms: TermWithExplanation[] = [];
    for (const term of allTerms) {
      const key = term.termEn.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTerms.push(term);
      }
    }

    // Create merged document
    db.prepare(
      `INSERT INTO documents (id, title, fileName, summary, termCount) VALUES (?, ?, ?, ?, ?)`
    ).run(
      newId,
      newTitle,
      "merged",
      summaries.join(" | "),
      uniqueTerms.length
    );

    // Insert terms with new IDs
    const insertTerm = db.prepare(
      `INSERT INTO terms (id, documentId, termEn, termZh, category, contextSnippet, pageNumber)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const insertExpl = db.prepare(
      `INSERT INTO explanations (termId, academic, plainCantonese, researchContext, conclusionJson, inOtherWords, contrast)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    for (let i = 0; i < uniqueTerms.length; i++) {
      const t = uniqueTerms[i];
      const newTermId = `${newId}-term-${String(i + 1).padStart(3, "0")}`;
      insertTerm.run(
        newTermId,
        newId,
        t.termEn,
        t.termZh,
        t.category,
        t.contextSnippet || null,
        t.pageNumber || null
      );
      if (t.explanation) {
        insertExpl.run(
          newTermId,
          t.explanation.academic,
          t.explanation.plainCantonese,
          t.explanation.researchContext,
          JSON.stringify(t.explanation.conclusionChain),
          t.explanation.inOtherWords,
          t.explanation.contrast
        );
      }
    }
  });
  txn();

  return newId;
}
