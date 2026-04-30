import { useState, useMemo } from "react";
import axios from "axios";
import type { InventoryItem } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export function useSelectionManager(
  filteredInventory: InventoryItem[],
  refreshData: () => void,
  showToast: (msg: string, type: "success" | "error") => void,
  userId: string | null,
  storeId: string | null,
) {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Handlers ---
  
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredInventory.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const cancelDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedIds(new Set());
  };

 const handleBulkDelete = async () => {
    // 3. Failsafe to prevent firing if auth isn't loaded
    if (!userId || !storeId) {
      showToast("Authentication error. Cannot delete.", "error");
      return;
    }

    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          // 4. ATTACH THE SECURITY PARAMS HERE
          axios.delete(`${API_URL}/inventory/${id}?users_id=${userId}&store_id=${storeId}`)
        )
      );
      
      showToast(`Successfully deleted ${selectedIds.size} item(s).`, "success");
      refreshData();
      cancelDeleteMode();
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showToast("Failed to delete selected items.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedItemsData = useMemo(() => {
    return filteredInventory.filter((item) => selectedIds.has(item.id));
  }, [filteredInventory, selectedIds]);

  return {
    isDeleteMode,
    selectedIds,
    isConfirmModalOpen,
    isDeleting,
    selectedItemsData,
    setIsDeleteMode,
    setIsConfirmModalOpen,
    handleToggleSelect,
    handleSelectAll,
    cancelDeleteMode,
    handleBulkDelete,
  };
}