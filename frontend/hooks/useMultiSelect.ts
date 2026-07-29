// hooks/useMultiSelect.ts
// Generic multi-select state management for list screens that need to let
// the user long-press to enter "selection mode", tap to toggle individual
// items, select/deselect all, and then run a bulk action on the selection.
import { useCallback, useMemo, useState } from "react";

export function useMultiSelect<T extends string = string>() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  /** Long-press entry point: turns on selection mode and selects the
   * long-pressed item in one gesture. */
  const enterSelectionMode = useCallback((initialId: T) => {
    setSelectionMode(true);
    setSelectedIds(new Set([initialId]));
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggle = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: T) => selectedIds.has(id),
    [selectedIds],
  );

  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectionMode,
    selectedIds,
    selectedList,
    count: selectedIds.size,
    enterSelectionMode,
    exitSelectionMode,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
  };
}
