import { useEffect, useState } from "react";
import axios from "axios";
import { PlusIcon, TrashIcon, MagnifyingGlassIcon, PrinterIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import InventoryRow from "../components/InventoryRow";
import InventorySidebar from "../components/InventorySidebar";
import type { InventoryItem } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState("Name");
  const [filtersOpen, setFiltersOpen] = useState({
    category: true, stockStatus: true, supplier: false, restock: false, expiry: false,
  });

  const toggleFilter = (key: keyof typeof filtersOpen) => setFiltersOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/inventory`);
        setInventory(Array.isArray(res.data.data) ? res.data.data : (res.data?.inventory ?? res.data?.items ?? []));
      } catch (err) {
        console.error("Failed to load inventory", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f3f4f6] font-['Work_Sans']">
        <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#004385]"></div>
          <span className="mt-4 text-[#004385] font-bold tracking-wide">Loading Inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden">
      <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>

      <div className="flex flex-1 overflow-hidden">
        <InventorySidebar activeSort={activeSort} setActiveSort={setActiveSort} filtersOpen={filtersOpen} toggleFilter={toggleFilter} />

        <main className="flex-1 p-8 overflow-y-scroll bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] transition-colors">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#004385] font-['Raleway'] mb-2">Inventory</h1>
              <p className="text-gray-500 text-sm">Manage your products and stock levels</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-gray-300 text-[#223843] px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 hover:bg-gray-50 transition font-medium text-sm"><PrinterIcon className="w-5 h-5" /> Export to PDF</button>
              <button className="bg-white border border-gray-300 text-[#223843] px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 hover:bg-gray-50 transition font-medium text-sm"><ArrowDownTrayIcon className="w-5 h-5" /> Import CSV</button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-1/3">
              <input type="text" placeholder="Search for Items in Inventory..." className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#087CA7] outline-none" />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
            </div>
            <div className="flex gap-3">
              <button className="bg-[#2aa564] text-white px-6 py-2.5 rounded shadow hover:bg-green-700 transition flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Add Item</button>
              <button className="bg-[#b13e3e] text-white px-6 py-2.5 rounded shadow hover:bg-red-800 transition flex items-center gap-2"><TrashIcon className="w-5 h-5" /> Delete Item</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-[#f8f9fa] text-[#033860] text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4 w-[5%] text-center">#</th>
                  <th className="p-4 w-[8%] text-center">Photo</th>
                  <th className="p-4 w-[16%] text-center">Name</th>
                  <th className="p-4 w-[12%] text-center">SKU</th>
                  <th className="p-4 w-[10%] text-center">Price</th>
                  <th className="p-4 w-[12%] text-center">Expiry Date</th>
                  <th className="p-4 w-[11%] text-center">Status</th>
                  <th className="p-4 w-[9%] text-center">Stocks</th>
                  <th className="p-4 w-[9%] text-center">Suggested</th>
                  <th className="p-4 w-[8%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {inventory.map((item, index) => <InventoryRow key={item.id} item={item} isEven={index % 2 === 0} />)}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryPage;