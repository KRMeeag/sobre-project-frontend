import { useEffect, useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  FunnelIcon, // <-- NEW ICON FOR MOBILE FILTER TOGGLE
} from "@heroicons/react/24/outline";
import {
  InventoryRow,
  InventorySidebar,
  AddItemModal,
  ConfirmDeleteModal,
  ImportWizardModal,
} from "../../components/inventory/index";
import Toast from "../../components/general/Toast";
import {
  useInventoryData,
  useInventoryFilters,
  useSelectionManager,
  useExportManager,
  useToast,
  useCSVAPI,
} from "../../hooks/";

const InventoryPage = () => {
  const mainScrollRef = useRef<HTMLElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { toast, showToast, hideToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // NEW: State to control the mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. Data Fetching
  const {
    inventory,
    loading,
    storeId,
    userId,
    fetchInventory,
    fetchFilters,
    existingCategories,
    existingSuppliers,
    loadingFilters,
  } = useInventoryData();

  // 3. Filtering & UI State
  const filterState = useInventoryFilters(inventory);
  const {
    searchInput,
    setSearchInput,
    apiParams,
    filteredInventory,
    activeSort,
    setActiveSort,
    sortOrder,
    setSortOrder,
    filtersOpen,
    toggleFilterAccordion,
    selectedCategories,
    setSelectedCategories,
    selectedStockStatuses,
    setSelectedStockStatuses,
    selectedSuppliers,
    setSelectedSuppliers,
    isRestockNeeded,
    setIsRestockNeeded,
    isExpiringSoon,
    setIsExpiringSoon,
    resetAllFilters,
  } = filterState;

  // 4. Selections & Deletions
  const selectionState = useSelectionManager(
    filteredInventory,
    () => {
      fetchInventory(apiParams, true);
      fetchFilters();
    },
    showToast,
    userId,
    storeId,
  );
  const {
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
  } = selectionState;

  // 5. Exports
  const {
    isExporting,
    isExportMenuOpen,
    setIsExportMenuOpen,
    handleExportPDF,
  } = useExportManager(userId, showToast);

  // --- Side Effects ---
  useEffect(() => {
    fetchInventory(apiParams);
  }, [apiParams, fetchInventory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsExportMenuOpen]);

  // 6. CSV Import
  const { submitImport } = useCSVAPI({
    onSuccess: () => {
      fetchInventory(apiParams);
      fetchFilters();
      setIsImportModalOpen(false);
    },
    showToast,
  });

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <div className="hidden lg:block h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>
      <div className="flex flex-1 overflow-hidden relative">
        {/* MOBILE SIDEBAR OVERLAY */}
        {/* Clicking this dark background closes the sidebar on mobile */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* SIDEBAR WRAPPER */}
        {/* Slides in on mobile, fixed permanently on large screens */}
        <div
          className={`h-full fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <InventorySidebar
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            filtersOpen={filtersOpen}
            toggleFilter={toggleFilterAccordion}
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
        </div>

        {/* MAIN CONTENT */}
        <main
          ref={mainScrollRef}
          className="flex-1 p-4 md:p-8 overflow-y-scroll bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] transition-colors w-full"
        >
          {/* Header */}
          {/* Stacked on mobile, side-by-side on md+ */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-[#004385] font-['Raleway'] mb-1 md:mb-2">
                Inventory
              </h1>
              <p className="text-gray-500 text-sm">
                Manage your products and stock levels
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              {/* Dropdown Export Wrapper */}
              <div className="relative w-full sm:w-auto" ref={exportMenuRef}>
                <button
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  disabled={isExporting}
                  className="w-full sm:w-auto bg-white border border-gray-300 text-[#223843] px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PrinterIcon className="w-5 h-5" />
                  )}
                  {isExporting ? "Generating..." : "Export"}
                </button>
                {isExportMenuOpen && !isExporting && (
                  <div className="absolute right-0 mt-2 w-full sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <button
                      onClick={() => handleExportPDF("operational")}
                      className="w-full text-left px-4 py-3 text-sm text-[#223843] hover:bg-gray-50 transition border-b border-gray-100 font-medium"
                    >
                      Operational Report
                    </button>
                    <button
                      onClick={() => handleExportPDF("financial")}
                      className="w-full text-left px-4 py-3 text-sm text-[#223843] hover:bg-gray-50 transition font-medium"
                    >
                      Financial Value Report
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex-1 sm:flex-none justify-center bg-white border border-gray-300 text-[#223843] px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 hover:bg-gray-50 transition font-medium text-sm"
              >
                <ArrowDownTrayIcon className="w-5 h-5" /> Import CSV
              </button>
            </div>
          </div>

          {/* Toolbar */}
          {/* Stacked layout for mobile to ensure search fits completely */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex w-full lg:w-1/3 gap-2">
              {/* MOBILE FILTER BUTTON */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center bg-white border border-gray-300 text-[#004385] px-3 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition"
              >
                <FunnelIcon className="w-5 h-5" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Inventory..."
                  className="w-full bg-white pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#087CA7] outline-none"
                  disabled={isDeleteMode}
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {isDeleteMode ? (
                <>
                  <button
                    onClick={cancelDeleteMode}
                    className="flex-1 lg:flex-none justify-center bg-white text-gray-600 border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2 font-bold text-sm"
                  >
                    <XMarkIcon className="w-5 h-5" /> Cancel
                  </button>
                  <button
                    onClick={() => setIsConfirmModalOpen(true)}
                    disabled={selectedIds.size === 0}
                    className={`flex-1 lg:flex-none justify-center text-white px-4 py-2.5 rounded-lg shadow transition flex items-center gap-2 font-bold text-sm ${selectedIds.size > 0 ? "bg-[#b13e3e] hover:bg-[#8c2d2d]" : "bg-gray-400 cursor-not-allowed"}`}
                  >
                    <TrashIcon className="w-5 h-5" /> Delete{" "}
                    {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex-1 lg:flex-none justify-center bg-[#2aa564] text-white px-4 py-2.5 rounded-lg shadow hover:bg-[#238f55] transition flex items-center gap-2 font-bold text-sm"
                  >
                    <PlusIcon className="w-5 h-5" /> Add Item
                  </button>
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="flex-1 lg:flex-none justify-center bg-white border border-[#b13e3e] text-[#b13e3e] px-4 py-2.5 rounded-lg shadow-sm hover:bg-red-50 transition flex items-center gap-2 font-bold text-sm"
                  >
                    <TrashIcon className="w-5 h-5" /> Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Table Container */}
          {/* overflow-x-auto allows horizontal swiping on mobile. min-w-[1000px] stops columns from crushing together. */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto w-full">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px] transition-all">
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
                      onUpdate={() => fetchInventory(apiParams, true)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modals remain structurally the same */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        storeId={storeId}
        existingCategories={existingCategories}
        existingSuppliers={existingSuppliers}
        onSuccess={(itemName: string) => {
          fetchInventory(apiParams);
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

      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingInventory={inventory}
        existingCategories={existingCategories}
        existingSuppliers={existingSuppliers}
        onConfirm={submitImport}
      />
    </div>
  );
};

export default InventoryPage;
