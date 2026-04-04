import { useState } from "react";
import FilterSection from "./FilterSection";
import SortChip from "./SortChip";
import type { FilterKey } from "../../pages/inventory/InventoryPage";

interface InventorySidebarProps {
  activeSort: string | null;
  setActiveSort: (sort: string | null) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  filtersOpen: Record<FilterKey, boolean>;
  toggleFilter: (key: FilterKey) => void;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStockStatuses: string[];
  setSelectedStockStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSuppliers: string[];
  setSelectedSuppliers: React.Dispatch<React.SetStateAction<string[]>>;
  isRestockNeeded: boolean;
  setIsRestockNeeded: (val: boolean) => void;
  isExpiringSoon: boolean;
  setIsExpiringSoon: (val: boolean) => void;
  resetAll: () => void;
  
  // Lifted state props
  existingCategories: string[];
  existingSuppliers: string[];
  loadingFilters: boolean;
}

const InventorySidebar = (props: InventorySidebarProps) => {
  const [supplierSearch, setSupplierSearch] = useState("");

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const filteredSuppliers = props.existingSuppliers.filter(sup => sup.toLowerCase().includes(supplierSearch.toLowerCase()));
  const isSortDisabled = !props.activeSort;

  return (
    <aside className="w-72 bg-[#dbd3d8] shrink-0 border-r border-[#c4bcc0] flex flex-col shadow-xl z-10 hidden lg:flex">
      <div className="p-6 border-b border-[#c4bcc0] bg-[#d4cdd2]">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#223843] font-['Raleway']">Filters</h2>
          <button onClick={props.resetAll} className="text-xs font-bold text-[#004385] hover:text-[#b13e3e] uppercase tracking-wide transition-colors">Reset All</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#dbd3d8] [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#004385] transition-colors">
        
        {/* Sort Section */}
        <div className="p-6 border-b border-[#c4bcc0]">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-[#033860] font-bold uppercase text-xs tracking-wider">Sort By</h3>
             {props.activeSort && (
               <button onClick={() => props.setActiveSort(null)} className="text-[10px] text-gray-500 hover:text-[#b13e3e] font-bold uppercase">Clear</button>
             )}
          </div>
          <div className="space-y-2">
            {["Price", "Name", "Stock Amount", "Expiry Date"].map((sort) => (
              <SortChip 
                key={sort} 
                label={sort} 
                isActive={props.activeSort === sort} 
                onClick={() => props.setActiveSort(sort === props.activeSort ? null : sort)} 
              />
            ))}
          </div>
          <div className="flex gap-2 mt-4 bg-white/50 p-1 rounded-lg">
            <button 
                onClick={() => props.setSortOrder("asc")}
                disabled={isSortDisabled}
                className={`flex-1 text-xs font-bold py-1.5 rounded text-center transition-colors 
                  ${isSortDisabled ? 'opacity-40 cursor-not-allowed text-gray-500' : 
                  props.sortOrder === 'asc' ? 'bg-white text-[#004385] shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                ASC
            </button>
            <button 
                onClick={() => props.setSortOrder("desc")}
                disabled={isSortDisabled}
                className={`flex-1 text-xs font-bold py-1.5 rounded text-center transition-colors 
                  ${isSortDisabled ? 'opacity-40 cursor-not-allowed text-gray-500' : 
                  props.sortOrder === 'desc' ? 'bg-white text-[#004385] shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}>
                DESC
            </button>
          </div>
        </div>

        {/* Dynamic Category Section */}
        <FilterSection title="Category" isOpen={props.filtersOpen.category} toggle={() => props.toggleFilter("category")} isScrollable={false}>
          {props.loadingFilters ? (
            <p className="text-xs text-gray-500 italic animate-pulse">Loading categories...</p>
          ) : props.existingCategories.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No categories found.</p>
          ) : (
            props.existingCategories.map((cat) => (
              <label key={cat} className="flex items-center space-x-3 text-[#223843] cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={props.selectedCategories.includes(cat)}
                  onChange={() => toggleArrayItem(props.setSelectedCategories, cat)}
                  className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] w-4 h-4 bg-white cursor-pointer shrink-0" 
                />
                <span className="group-hover:text-[#004385] transition-colors select-none">{cat}</span>
              </label>
            ))
          )}
        </FilterSection>

        {/* Stock Status Section */}
        <FilterSection title="Stock Status" isOpen={props.filtersOpen.stockStatus} toggle={() => props.toggleFilter("stockStatus")}>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer group">
            <input type="checkbox" checked={props.selectedStockStatuses.includes("In Stock")} onChange={() => toggleArrayItem(props.setSelectedStockStatuses, "In Stock")} className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white cursor-pointer shrink-0" />
            <span className="flex items-center gap-2 group-hover:text-[#004385] select-none">In Stock <span className="w-2.5 h-2.5 rounded-full bg-[#2aa564] shadow-sm"></span></span>
          </label>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer group">
            <input type="checkbox" checked={props.selectedStockStatuses.includes("Low Stock")} onChange={() => toggleArrayItem(props.setSelectedStockStatuses, "Low Stock")} className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white cursor-pointer shrink-0" />
            <span className="flex items-center gap-2 group-hover:text-[#004385] select-none">Low Stock <span className="w-2.5 h-2.5 rounded-full bg-[#e6d04f] shadow-sm"></span></span>
          </label>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer group">
            <input type="checkbox" checked={props.selectedStockStatuses.includes("Out of Stock")} onChange={() => toggleArrayItem(props.setSelectedStockStatuses, "Out of Stock")} className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white cursor-pointer shrink-0" />
            <span className="flex items-center gap-2 group-hover:text-[#004385] select-none">Out of Stock <span className="w-2.5 h-2.5 rounded-full bg-[#b13e3e] shadow-sm"></span></span>
          </label>
        </FilterSection>

        {/* Dynamic Supplier Section */}
        <FilterSection 
            title="Supplier" 
            isOpen={props.filtersOpen.supplier} 
            toggle={() => props.toggleFilter("supplier")} 
            hasSearch={true}
            searchValue={supplierSearch}
            onSearchChange={setSupplierSearch}
        >
          {props.loadingFilters ? (
            <p className="text-xs text-gray-500 italic animate-pulse">Loading suppliers...</p>
          ) : props.existingSuppliers.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No suppliers found.</p>
          ) : filteredSuppliers.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No matching suppliers.</p>
          ) : (
            filteredSuppliers.map((sup) => (
              <label key={sup} className="flex items-center space-x-3 text-[#223843] text-sm cursor-pointer group">
                <input 
                    type="checkbox" 
                    checked={props.selectedSuppliers.includes(sup)}
                    onChange={() => toggleArrayItem(props.setSelectedSuppliers, sup)}
                    className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white cursor-pointer shrink-0" 
                />
                <span className="truncate group-hover:text-[#004385] transition-colors select-none">{sup}</span>
              </label>
            ))
          )}
        </FilterSection>

        {/* Binary Toggles */}
        <FilterSection title="Restock Needed" isOpen={props.filtersOpen.restock} toggle={() => props.toggleFilter("restock")} isScrollable={false}>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer group">
            <input type="checkbox" checked={props.isRestockNeeded} onChange={(e) => props.setIsRestockNeeded(e.target.checked)} className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white cursor-pointer shrink-0" /> 
            <span className="group-hover:text-[#004385] select-none">Urgent Restock</span>
          </label>
        </FilterSection>

        <FilterSection title="Expiry Status" isOpen={props.filtersOpen.expiry} toggle={() => props.toggleFilter("expiry")} isScrollable={false}>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer group">
            <input type="checkbox" checked={props.isExpiringSoon} onChange={(e) => props.setIsExpiringSoon(e.target.checked)} className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white cursor-pointer shrink-0" /> 
            <span className="group-hover:text-[#004385] select-none">Expiring Soon</span>
          </label>
        </FilterSection>
      </div>

      <div className="p-4 border-t border-[#c4bcc0] text-center">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sobre POS System</p>
      </div>
    </aside>
  );
};

export default InventorySidebar;