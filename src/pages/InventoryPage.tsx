import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import InventoryRow from "../components/inventory/InventoryRow";
import InventorySidebar from "../components/inventory/InventorySidebar";
import type { InventoryItem } from "../types";
import { supabase } from "../lib/supabase";
import AddItemModal from "../components/inventory/AddItemModal";
import ConfirmDeleteModal from "../components/inventory/ConfirmDeleteModal";
import Toast from "../components/general/Toast";
import type { ToastType } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export type FilterKey =
  | "category"
  | "stockStatus"
  | "supplier"
  | "restock"
  | "expiry";

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Refs & Toasts ---
  const mainScrollRef = useRef<HTMLElement>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // --- Deletion States ---
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Filter & Sort States ---
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>(
    [],
  );
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [isRestockNeeded, setIsRestockNeeded] = useState(false);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  // --- Lifted States for Filters ---
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingSuppliers, setExistingSuppliers] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // --- Modal & Store States ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState<Record<FilterKey, boolean>>({
    category: false,
    stockStatus: false,
    supplier: false,
    restock: false,
    expiry: false,
  });

  const toggleFilter = (key: FilterKey) =>
    setFiltersOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const showToast = (message: string, type: ToastType = "success") =>
    setToast({ message, type, isVisible: true });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        setStoreId(userRes.data?.store_id || null);
      } catch (err) {
        console.error("Failed to load user store_id:", err);
      }
    };
    fetchStoreId();
  }, []);

  const fetchFilters = useCallback(async () => {
    if (!storeId) return;
    try {
      setLoadingFilters(true);
      const [catRes, supRes] = await Promise.all([
        axios.get(`${API_URL}/inventory/categories`, {
          params: { store_id: storeId },
        }),
        axios.get(`${API_URL}/inventory/suppliers`, {
          params: { store_id: storeId },
        }),
      ]);
      setExistingCategories(
        catRes.data.map((c: { category: string }) => c.category),
      );
      setExistingSuppliers(
        supRes.data.map((s: { supplier: string }) => s.supplier),
      );
    } catch (e) {
      console.error("Failed to fetch filters:", e);
    } finally {
      setLoadingFilters(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      let sortByParam = undefined;
      if (activeSort === "Price") sortByParam = "price";
      if (activeSort === "Name") sortByParam = "name";
      if (activeSort === "Stock Amount") sortByParam = "total_stock";
      if (activeSort === "Expiry Date") sortByParam = "nearest_expiry";

      const params: any = {
        search: searchQuery || undefined,
        sortBy: sortByParam,
        order: sortOrder,
        limit: 1000,
      };

      if (selectedCategories.length > 0) params.category = selectedCategories;
      if (selectedSuppliers.length > 0) params.supplier = selectedSuppliers;
      if (isRestockNeeded) params.restock_needed = true;
      if (isExpiringSoon) params.expiry_status = true;

      const res = await axios.get(`${API_URL}/inventory`, { params });
      setInventory(
        Array.isArray(res.data.data)
          ? res.data.data
          : (res.data?.inventory ?? res.data?.items ?? []),
      );
    } catch (err) {
      console.error("Failed to load inventory", err);
      showToast("Failed to load inventory data.", "error");
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    activeSort,
    sortOrder,
    selectedCategories,
    selectedSuppliers,
    isRestockNeeded,
    isExpiringSoon,
  ]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredInventory = useMemo(() => {
    if (selectedStockStatuses.length === 0) return inventory;
    return inventory.filter((item) => {
      let status = "In Stock";
      if (item.total_stock === 0) status = "Out of Stock";
      else if (item.total_stock <= 10) status = "Low Stock";
      return selectedStockStatuses.includes(status);
    });
  }, [inventory, selectedStockStatuses]);

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

  // --- Deletion Logic ---
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
          axios.delete(`${API_URL}/inventory/${id}`),
        ),
      );
      showToast(`Successfully deleted ${selectedIds.size} item(s).`, "success");
      fetchInventory();
      fetchFilters();
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
    return inventory.filter((item) => selectedIds.has(item.id));
  }, [inventory, selectedIds]);

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>

      <div className="flex flex-1 overflow-hidden">
        <InventorySidebar
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filtersOpen={filtersOpen}
          toggleFilter={toggleFilter}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStockStatuses={selectedStockStatuses}
          setSelectedStockStatuses={setSelectedStockStatuses}
          selectedSuppliers={selectedSuppliers}
          setSelectedSuppliers={setSelectedSuppliers}
          isRestockNeeded={isRestockNeeded}
          setIsRestockNeeded={setIsRestockNeeded}
          isExpiringSoon={isExpiringSoon}
          setIsExpiringSoon={setIsExpiringSoon}
          resetAll={resetAllFilters}
          existingCategories={existingCategories}
          existingSuppliers={existingSuppliers}
          loadingFilters={loadingFilters}
        />

        <main
          ref={mainScrollRef}
          className="flex-1 p-8 overflow-y-scroll bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] transition-colors"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#004385] font-['Raleway'] mb-2">
                Inventory
              </h1>
              <p className="text-gray-500 text-sm">
                Manage your products and stock levels
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-gray-300 text-[#223843] px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 hover:bg-gray-50 transition font-medium text-sm">
                <PrinterIcon className="w-5 h-5" /> Export to PDF
              </button>
              <button className="bg-white border border-gray-300 text-[#223843] px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 hover:bg-gray-50 transition font-medium text-sm">
                <ArrowDownTrayIcon className="w-5 h-5" /> Import CSV
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-1/3">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for Items in Inventory..."
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#087CA7] outline-none"
                disabled={isDeleteMode}
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
            </div>

            <div className="flex gap-3 h-11">
              {isDeleteMode ? (
                <>
                  <button
                    onClick={cancelDeleteMode}
                    className="bg-white text-gray-600 border border-gray-300 px-6 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2 font-bold text-sm"
                  >
                    <XMarkIcon className="w-5 h-5" /> Cancel Delete
                  </button>
                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    disabled={selectedIds.size === 0}
                    className={`text-white px-6 rounded-lg shadow transition flex items-center gap-2 font-bold text-sm ${selectedIds.size > 0 ? "bg-[#b13e3e] hover:bg-[#8c2d2d]" : "bg-gray-400 cursor-not-allowed"}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                    Confirm Delete{" "}
                    {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#2aa564] text-white px-6 rounded-lg shadow hover:bg-[#238f55] transition flex items-center gap-2 font-bold text-sm"
                  >
                    <PlusIcon className="w-5 h-5" /> Add Item
                  </button>
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="bg-white border border-[#b13e3e] text-[#b13e3e] px-6 rounded-lg shadow-sm hover:bg-red-50 transition flex items-center gap-2 font-bold text-sm"
                  >
                    <TrashIcon className="w-5 h-5" /> Delete Items
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed transition-all">
              <thead className="bg-[#f8f9fa] text-[#033860] text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4 w-[5%] text-center">
                    {isDeleteMode ? (
                      <input
                        type="checkbox"
                        className="rounded border-gray-400 text-[#b13e3e] focus:ring-[#b13e3e] w-4 h-4 cursor-pointer"
                        checked={
                          selectedIds.size === filteredInventory.length &&
                          filteredInventory.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    ) : (
                      "#"
                    )}
                  </th>
                  <th className="p-4 w-[8%] text-center">Photo</th>
                  <th className="p-4 w-[16%] text-center">Name</th>
                  <th className="p-4 w-[12%] text-center">SKU</th>
                  <th className="p-4 w-[10%] text-center">Price</th>
                  <th className="p-4 w-[12%] text-center">Expiry Date</th>
                  <th className="p-4 w-[11%] text-center">Status</th>
                  <th className="p-4 w-[9%] text-center">Stocks</th>
                  <th className="p-4 w-[9%] text-center">Suggested</th>
                  {!isDeleteMode && (
                    <th className="p-4 w-[8%] text-center">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#223843]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385] mx-auto mb-2"></div>
                      Loading Data...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500">
                      No items match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item, index) => (
                    <InventoryRow
                      key={item.id}
                      item={item}
                      isEven={index % 2 === 0}
                      isDeleteMode={isDeleteMode}
                      isSelected={selectedIds.has(item.id)}
                      onToggleSelect={handleToggleSelect}
                      onUpdate={fetchInventory}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        storeId={storeId}
        existingCategories={existingCategories}
        existingSuppliers={existingSuppliers}
        onSuccess={(itemName: string) => {
          fetchInventory();
          fetchFilters();
          showToast(`Successfully added ${itemName} to inventory.`, "success");
          mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleBulkDelete}
        selectedItems={selectedItemsData}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default InventoryPage;
