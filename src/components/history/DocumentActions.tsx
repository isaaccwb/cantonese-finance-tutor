"use client";

import { useState } from "react";
import { DocumentRecord } from "./types";

interface DocumentActionsProps {
  doc: DocumentRecord;
  onRenamed: () => void;
  onDeleted: () => void;
}

export function DocumentActions({
  doc,
  onRenamed,
  onDeleted,
}: DocumentActionsProps) {
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(doc.title);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === doc.title) {
      setRenaming(false);
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      onRenamed();
    } finally {
      setLoading(false);
      setRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${doc.title}」？所有術語同解釋都會一齊刪除。`)) {
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      onDeleted();
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    window.open(`/api/documents/${doc.id}/export?format=${format}`, "_blank");
  };

  if (renaming) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="w-48 rounded border border-gray-300 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
          autoFocus
          disabled={loading}
        />
        <button
          onClick={handleRename}
          disabled={loading}
          className="text-xs text-amber-600 hover:text-amber-700"
        >
          儲存
        </button>
        <button
          onClick={() => setRenaming(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
      <button
        onClick={() => setRenaming(true)}
        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
      >
        改名
      </button>
      <button
        onClick={() => handleExport("csv")}
        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
      >
        CSV
      </button>
      <button
        onClick={() => handleExport("json")}
        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
      >
        JSON
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
      >
        刪除
      </button>
    </div>
  );
}
