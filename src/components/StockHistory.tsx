import { useState, useEffect } from "react";
import axios from "axios";
import { PlusIcon, ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";
import type { StockItem } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

const StockHistory = ({ inventoryId, itemName }: { inventoryId: string; itemName: string }) => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loadingStocks, setIsLoadingStocks] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setIsLoadingStocks(true);
        const res = await axios.get(`${API_URL}/stock/inventory/${inventoryId}`);
        const data = Array.isArray(res.data) ? res.data : [];
        setStocks(data);
      } catch (err) {
        console.error(`Failed to load inventory for ${itemName}: `, err);
      } finally {
        setIsLoadingStocks(false);
      }
    };

    fetchStock();
  }, [inventoryId, itemName]);

  return (
    <div className="mt-4">
      {/* Stocks Section Header */}
      <div className="flex justify-between items-center mb-3 border-t border-gray-200 pt-6">
        <h4 className="text-lg font-bold text-[#004385] font-['Raleway']">
          Stock History
        </h4>
        <button className="bg-[#2aa564] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#238f55] transition shadow-sm">
          <PlusIcon className="w-4 h-4" /> Add Stock
        </button>
      </div>

      {/* Conditional Rendering for Stocks: Loading, Empty, or Table */}
      {loadingStocks ? (
        <div className="bg-white rounded-lg border border-gray-200 flex justify-center items-center py-10 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385]"></div>
          <span className="ml-3 text-[#004385] font-medium">
            Loading stocks...
          </span>
        </div>
      ) : stocks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center py-12 text-gray-500 shadow-sm">
          <ArchiveBoxXMarkIcon className="w-12 h-12 mb-3 text-gray-300" />
          <p className="font-medium text-[#223843]">
            No stock history available
          </p>
          <p className="text-sm">Click 'Add Stock' to insert a new batch.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="py-3 px-4 font-semibold text-left">Barcode</th>
                <th className="py-3 px-4 font-semibold">Stocked On</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">
                  Expiration Date
                </th>
              </tr>
            </thead>
            <tbody className="text-[#223843] divide-y divide-gray-100">
              {stocks.map((stock) => (
                <tr
                  key={stock.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-left font-mono text-gray-500">
                    {stock.barcode}
                  </td>
                  <td className="py-3 px-4">{stock.restock_date || "N/A"}</td>
                  <td className="py-3 px-4 font-bold">{stock.amount || 0}</td>
                  <td className="py-3 px-4 text-right">
                    {stock.expiry_date || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockHistory;