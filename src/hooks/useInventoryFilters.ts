import { useState, useEffect, useMemo } from "react";
import type { InventoryItem } from "../types";

export type FilterKey = "category" | "stockStatus" | "supplier" | "restock" | "expiry";

export function useInventoryFilters(inventory: InventoryItem[]) {
  // --- Text Search ---
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Sorting ---
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // --- Sidebar Filters ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [isRestockNeeded, setIsRestockNeeded] = useState(false);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  // --- UI Toggles (Accordions) ---
  const [filtersOpen, setFiltersOpen] = useState<Record<FilterKey, boolean>>({
    category: false,
    stockStatus: false,
    supplier: false,
    restock: false,
    expiry: false,
  });

  // --- Add Modal ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(true)

  const toggleFilterAccordion = (key: FilterKey) => {
    setFiltersOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Debounce Search Input ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // --- 1. Build Backend API Parameters ---
  // The main page will watch this object and trigger fetchInventory() when it changes
  const apiParams = useMemo(() => {
    let sortByParam = undefined;
    if (activeSort === "Price") sortByParam = "price";
    if (activeSort === "Name") sortByParam = "name";
    if (activeSort === "Stock Amount") sortByParam = "total_stock";
    if (activeSort === "Expiry Date") sortByParam = "nearest_expiry";

    const params: Record<string, any> = {
      search: searchQuery || undefined,
      sortBy: sortByParam,
      order: sortOrder,
      limit: 1000,
    };

    if (selectedCategories.length > 0) params.category = selectedCategories;
    if (selectedSuppliers.length > 0) params.supplier = selectedSuppliers;
    if (isRestockNeeded) params.restock_needed = true;
    if (isExpiringSoon) params.expiry_status = true;

    return params;
  }, [
    searchQuery,
    activeSort,
    sortOrder,
    selectedCategories,
    selectedSuppliers,
    isRestockNeeded,
    isExpiringSoon,
  ]);

  // --- 2. Frontend Derived State ---
  // Filters the raw inventory array locally based on stock status
  const filteredInventory = useMemo(() => {
    if (selectedStockStatuses.length === 0) return inventory;
    
    return inventory.filter((item) => {
      let status = "In Stock";
      if (item.total_stock === 0) status = "Out of Stock";
      else if (item.total_stock <= 10) status = "Low Stock"; // Assuming 10 is your local low stock threshold for the UI
      
      return selectedStockStatuses.includes(status);
    });
  }, [inventory, selectedStockStatuses]);

  // --- Reset Function ---
  const resetAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setActiveSort(null);
    setSortOrder("desc");
    setSelectedCategories([]);
    setSelectedStockStatuses([]);
    setSelectedSuppliers([]);
    setIsRestockNeeded(false);
    setIsExpiringSoon(false);
  };

  return {
    // States
    searchInput,
    activeSort,
    sortOrder,
    selectedCategories,
    selectedStockStatuses,
    selectedSuppliers,
    isRestockNeeded,
    isExpiringSoon,
    filtersOpen,
    isAddModalOpen,
    
    // Setters
    setSearchInput,
    setActiveSort,
    setSortOrder,
    setSelectedCategories,
    setSelectedStockStatuses,
    setSelectedSuppliers,
    setIsRestockNeeded,
    setIsExpiringSoon,
    setIsAddModalOpen,
    
    // Derived & Handlers
    apiParams,
    filteredInventory,
    toggleFilterAccordion,
    resetAllFilters,
  };
}