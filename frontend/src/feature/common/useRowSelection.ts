"use client";

import { useCallback, useState } from "react";

export function useRowSelection<TId extends string | number>() {
  const [selectedIds, setSelectedIds] = useState<TId[]>([]);

  const toggleOne = useCallback((id: TId) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  return {
    clearSelection,
    selectedCount: selectedIds.length,
    selectedIds,
    setSelectedIds,
    toggleOne,
  };
}
