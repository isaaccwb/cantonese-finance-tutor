"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DocumentActions } from "./DocumentActions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DocumentRecord } from "./types";

export function DocumentList() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);
  const [mergeTitle, setMergeTitle] = useState("");

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMerge = async () => {
    if (selected.size < 2) return;
    setMerging(true);
    try {
      const res = await fetch("/api/documents/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: Array.from(selected),
          title: mergeTitle || "合併文件",
        }),
      });
      if (res.ok) {
        setSelected(new Set());
        setMergeTitle("");
        fetchDocuments();
      }
    } finally {
      setMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">未有歷史記錄</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          上載第一份 PDF
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Merge bar */}
      {selected.size >= 2 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950">
          <span className="text-sm text-amber-800 dark:text-amber-300">
            已選 {selected.size} 份文件
          </span>
          <input
            type="text"
            value={mergeTitle}
            onChange={(e) => setMergeTitle(e.target.value)}
            placeholder="合併後標題"
            className="w-48 rounded border border-amber-300 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleMerge}
            disabled={merging}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {merging ? "合併中..." : "合併術語"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            取消選擇
          </button>
        </div>
      )}

      {/* Document list */}
      <div className="flex flex-col gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`rounded-xl border bg-white transition-all dark:bg-gray-900 ${
              selected.has(doc.id)
                ? "border-amber-400 ring-1 ring-amber-200 dark:border-amber-600 dark:ring-amber-800"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
              {/* Checkbox for merge */}
              <input
                type="checkbox"
                checked={selected.has(doc.id)}
                onChange={() => toggleSelect(doc.id)}
                className="h-4 w-4 rounded border-gray-300 accent-amber-600"
              />

              {/* Document info - clickable */}
              <Link
                href={`/terms?doc=${doc.id}`}
                className="flex flex-1 items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-gray-900 hover:text-amber-700 dark:text-gray-100 dark:hover:text-amber-400">
                    {doc.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span>{doc.fileName}</span>
                    {doc.pageCount && <span>{doc.pageCount} 頁</span>}
                    <span>{doc.termCount} 個術語</span>
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString("zh-HK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Actions */}
              <DocumentActions
                doc={doc}
                onRenamed={fetchDocuments}
                onDeleted={fetchDocuments}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
