import FilterSection from "./FilterSection";
import SortChip from "./SortChip";

// 1. Define the specific literal union type for your filter keys
export type FilterKey = "category" | "stockStatus" | "supplier" | "restock" | "expiry";

interface InventorySidebarProps {
  activeSort: string;
  setActiveSort: (sort: string) => void;
  // 2. Map the state and function specifically to those keys
  filtersOpen: Record<FilterKey, boolean>;
  toggleFilter: (key: FilterKey) => void;
}

const InventorySidebar = ({ activeSort, setActiveSort, filtersOpen, toggleFilter }: InventorySidebarProps) => {
  return (
    <aside className="w-72 bg-[#dbd3d8] shrink-0 border-r border-[#c4bcc0] flex flex-col shadow-xl z-10 hidden lg:flex">
      <div className="p-6 border-b border-[#c4bcc0] bg-[#d4cdd2]">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#223843] font-['Raleway']">Filters</h2>
          <button className="text-xs font-bold text-[#004385] hover:underline uppercase tracking-wide">Reset All</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#dbd3d8] [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#004385] transition-colors">
        <div className="p-6 border-b border-[#c4bcc0]">
          <h3 className="text-[#033860] font-bold uppercase text-xs tracking-wider mb-3">Sort By</h3>
          <div className="space-y-2">
            {["Price", "Name", "Stock Amount", "Expiry Date"].map((sort) => (
              <SortChip key={sort} label={sort} isActive={activeSort === sort} onClick={() => setActiveSort(sort)} />
            ))}
          </div>
          <div className="flex gap-2 mt-4 bg-white/50 p-1 rounded-lg">
            <button className="flex-1 text-xs font-bold py-1.5 rounded bg-white text-[#004385] shadow-sm text-center">ASC</button>
            <button className="flex-1 text-xs font-bold py-1.5 rounded text-gray-500 hover:bg-white/50 text-center">DESC</button>
          </div>
        </div>

        <FilterSection title="Category" isOpen={filtersOpen.category} toggle={() => toggleFilter("category")}>
          {["Snacks", "Frozen", "Canned", "Household", "Personal Care", "Drinks"].map((cat) => (
            <label key={cat} className="flex items-center space-x-3 text-[#223843] cursor-pointer group">
              <input type="checkbox" className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] w-4 h-4 bg-white" />
              <span className="group-hover:text-[#004385] transition-colors">{cat}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Stock Status" isOpen={filtersOpen.stockStatus} toggle={() => toggleFilter("stockStatus")}>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer">
            <input type="checkbox" className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white" />
            <span className="flex items-center gap-2">In Stock <span className="w-2 h-2 rounded-full bg-[#daf4a6]"></span></span>
          </label>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer">
            <input type="checkbox" className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white" />
            <span className="flex items-center gap-2">Low Stock <span className="w-2 h-2 rounded-full bg-[#fff5b8]"></span></span>
          </label>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer">
            <input type="checkbox" className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white" />
            <span className="flex items-center gap-2">Out of Stock <span className="w-2 h-2 rounded-full bg-[#ffccc7]"></span></span>
          </label>
        </FilterSection>

        <FilterSection title="Supplier" isOpen={filtersOpen.supplier} toggle={() => toggleFilter("supplier")} hasSearch={true}>
          {["Suy Sing Commercial", "World Wide Food", "Puregold Price Club"].map((sup) => (
            <label key={sup} className="flex items-center space-x-3 text-[#223843] text-sm cursor-pointer group">
              <input type="checkbox" className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white" />
              <span className="truncate group-hover:text-[#004385] transition-colors">{sup}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Restock Needed" isOpen={filtersOpen.restock} toggle={() => toggleFilter("restock")}>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer">
            <input type="checkbox" className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white" /> <span>Urgent Restock</span>
          </label>
        </FilterSection>

        <FilterSection title="Expiry Status" isOpen={filtersOpen.expiry} toggle={() => toggleFilter("expiry")}>
          <label className="flex items-center space-x-3 text-[#223843] cursor-pointer">
            <input type="checkbox" className="rounded border-gray-400 text-[#004385] focus:ring-[#004385] bg-white" /> <span>Expiring Soon</span>
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