import { useState, useMemo } from "react";
import axios from "axios";
import type { InventoryItem } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export function useSelectionManager(
  filteredInventory: InventoryItem[],
  refreshData: () => void,
  showToast: (msg: string, type: "success" | "error") => void
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
    setIsDeleting(true);
    try {
      // Execute all deletes concurrently
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          axios.delete(`${API_URL}/inventory/${id}`)
        )
      );
      
      showToast(`Successfully deleted ${selectedIds.size} item(s).`, "success");
      
      // Refresh the data from the server
      refreshData();
      
      // Reset UI states
      cancelDeleteMode();
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showToast("Failed to delete selected items.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Derived State ---
  const selectedItemsData = useMemo(() => {
    return filteredInventory.filter((item) => selectedIds.has(item.id));
  }, [filteredInventory, selectedIds]);

  return {
    // States
    isDeleteMode,
    selectedIds,
    isConfirmModalOpen,
    isDeleting,
    selectedItemsData,
    
    // Setters
    setIsDeleteMode,
    setIsConfirmModalOpen,
    
    // Handlers
    handleToggleSelect,
    handleSelectAll,
    cancelDeleteMode,
    handleBulkDelete,
  };
}