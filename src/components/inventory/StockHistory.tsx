import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { 
  PlusIcon, 
  ArchiveBoxXMarkIcon, 
  TrashIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  CheckIcon 
} from "@heroicons/react/24/outline";
import type { StockItem } from "../../types";
import ConfirmDeleteStockModal from "./ConfirmDeleteStockModal";

const API_URL = import.meta.env.VITE_API_URL;

interface StockHistoryProps {
  inventoryId: string;
  itemName: string;
  onUpdate?: () => void;
}

const StockHistory = ({ inventoryId, itemName, onUpdate }: StockHistoryProps) => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loadingStocks, setIsLoadingStocks] = useState(false);

  // --- Deletion States ---
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Inline Add States ---
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ amount: "", expiry_date: "" });
  const [isSavingAdd, setIsSavingAdd] = useState(false);

  // --- Inline Edit States ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", expiry_date: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // --- Helpers ---
  const formatDisplayDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchStock = useCallback(async () => {
    try {
      setIsLoadingStocks(true);
      const res = await axios.get(`${API_URL}/stock/inventory/${inventoryId}`);
      setStocks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(`Failed to load inventory for ${itemName}: `, err);
    } finally {
      setIsLoadingStocks(false);
    }
  }, [inventoryId, itemName]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  // --- Summary Calculations ---
  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalAmount = 0;
    let expiredCount = 0;
    let earliestExpiryDate: Date | null = null;

    stocks.forEach(stock => {
      totalAmount += stock.amount;
      if (stock.expiry_date) {
        const expDate = new Date(stock.expiry_date);
        if (expDate < today) {
          expiredCount += stock.amount;
        } else {
          if (!earliestExpiryDate || expDate < earliestExpiryDate) {
            earliestExpiryDate = expDate;
          }
        }
      }
    });

    const formattedExpiry = earliestExpiryDate 
      ? (earliestExpiryDate as Date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
      : "None Active";

    return {
      totalAmount,
      expiredCount,
      earliestExpiry: formattedExpiry
    };
  }, [stocks]);

  // --- Handlers: Delete ---
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => axios.delete(`${API_URL}/stock/${id}`)));
      await fetchStock();
      if (onUpdate) onUpdate();
      setIsDeleteMode(false);
      setSelectedIds(new Set());
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error("Failed to delete stocks", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Handlers: Add ---
  const submitAdd = async () => {
    if (!addForm.amount || !addForm.expiry_date) return alert("Amount and Expiry Date are required.");
    setIsSavingAdd(true);
    try {
      await axios.post(`${API_URL}/stock`, {
        inventory_id: inventoryId,
        amount: Number(addForm.amount),
        expiry_date: addForm.expiry_date
      });
      await fetchStock();
      if (onUpdate) onUpdate();
      setIsAdding(false);
      setAddForm({ amount: "", expiry_date: "" });
    } catch (err) {
      console.error("Failed to add stock", err);
    } finally {
      setIsSavingAdd(false);
    }
  };

  // --- Handlers: Edit ---
  const startEdit = (stock: StockItem) => {
    setEditingId(stock.id);
    setEditForm({ 
      amount: stock.amount.toString(), 
      expiry_date: stock.expiry_date ? new Date(stock.expiry_date).toISOString().split('T')[0] : "" 
    });
  };

  const submitEdit = async (id: string) => {
    if (!editForm.amount || !editForm.expiry_date) return alert("Amount and Expiry Date are required.");
    setIsSavingEdit(true);
    try {
      await axios.patch(`${API_URL}/stock/${id}`, {
        amount: Number(editForm.amount),
        expiry_date: editForm.expiry_date
      });
      await fetchStock();
      if (onUpdate) onUpdate();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to edit stock", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="mt-8 font-['Work_Sans']">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Stock</p>
          <p className={`text-2xl font-bold ${summary.totalAmount > 0 ? 'text-[#2aa564]' : 'text-gray-800'}`}>
            {summary.totalAmount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expired Items</p>
          <p className={`text-2xl font-bold ${summary.expiredCount > 0 ? 'text-[#b13e3e]' : 'text-gray-800'}`}>
            {summary.expiredCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Expiry Date</p>
          <p className="text-2xl font-bold text-[#087CA7]">{summary.earliestExpiry}</p>
        </div>
      </div>

      {/* Header & Action Controls */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-[#004385] font-['Raleway']">Batch Records</h4>
        
        <div className="flex gap-2 h-[36px]">
          {isDeleteMode ? (
            <>
              <button 
                onClick={() => { setIsDeleteMode(false); setSelectedIds(new Set()); }} 
                className="bg-white text-gray-600 border border-gray-300 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2 font-bold text-xs"
              >
                <XMarkIcon className="w-4 h-4" /> Cancel Delete
              </button>
              <button 
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={selectedIds.size === 0}
                className={`text-white px-4 rounded-lg shadow transition flex items-center gap-2 font-bold text-xs ${selectedIds.size > 0 ? 'bg-[#b13e3e] hover:bg-[#8c2d2d]' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                <TrashIcon className="w-4 h-4" /> Confirm Delete {selectedIds.size > 0 && `(${selectedIds.size})`}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setIsAdding(true); setEditingId(null); }} 
                disabled={isAdding}
                className="bg-[#2aa564] text-white px-4 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#238f55] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-4 h-4" /> Add Batch
              </button>
              <button 
                onClick={() => { setIsDeleteMode(true); setIsAdding(false); setEditingId(null); }} 
                className="bg-white border border-[#b13e3e] text-[#b13e3e] px-4 rounded-lg shadow-sm hover:bg-red-50 transition flex items-center gap-2 font-bold text-xs"
              >
                <TrashIcon className="w-4 h-4" /> Delete Batches
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Table */}
      {loadingStocks ? (
        <div className="bg-white rounded-lg border border-gray-200 flex justify-center items-center py-10 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#f8f9fa] text-[#033860] text-xs uppercase tracking-wider font-bold border-b border-gray-200">
              <tr>
                {isDeleteMode && <th className="py-3 px-4 w-[5%] text-center"></th>}
                <th className="py-3 px-4 text-center w-[20%]">Barcode</th>
                <th className="py-3 px-4 text-center w-[25%]">Stocked On</th>
                <th className="py-3 px-4 text-center w-[15%]">Amount</th>
                <th className="py-3 px-4 text-center w-[25%]">Expiration Date</th>
                {!isDeleteMode && <th className="py-3 px-4 w-[15%] text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="text-[#223843] divide-y divide-gray-100">
              
              {/* INLINE ADD ROW */}
              {isAdding && (
                <tr className="bg-green-50/50">
                  <td className="py-2 px-4 text-center text-xs text-gray-400 italic">Auto-generated</td>
                  <td className="py-2 px-4 text-center text-xs text-gray-400 italic">Today</td>
                  <td className="py-2 px-4">
                    <input 
                      type="number" min="1" 
                      value={addForm.amount} onChange={e => setAddForm({...addForm, amount: e.target.value})}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:border-[#2aa564]" 
                      placeholder="Qty" autoFocus
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input 
                      type="date" 
                      value={addForm.expiry_date} onChange={e => setAddForm({...addForm, expiry_date: e.target.value})}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:border-[#2aa564]" 
                    />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={submitAdd} disabled={isSavingAdd} className="p-1.5 bg-[#2aa564] text-white rounded hover:bg-[#238f55] transition shadow-sm disabled:opacity-50" title="Save">
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsAdding(false)} disabled={isSavingAdd} className="p-1.5 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition shadow-sm disabled:opacity-50" title="Cancel">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* EMPTY STATE */}
              {stocks.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={isDeleteMode ? 5 : 5} className="py-12 text-center text-gray-500">
                    <ArchiveBoxXMarkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-[#223843]">No stock history available</p>
                  </td>
                </tr>
              )}

              {/* DATA ROWS */}
              {stocks.map((stock) => {
                const isEditing = editingId === stock.id;
                const isExpired = stock.expiry_date && new Date(stock.expiry_date) < new Date(new Date().setHours(0,0,0,0));

                return (
                  <tr key={stock.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(stock.id) ? "bg-red-50/40" : ""} ${isEditing ? "bg-yellow-50/30" : ""}`}>
                    
                    {/* Delete Checkbox */}
                    {isDeleteMode && (
                      <td className="py-3 px-4 text-center">
                        <input type="checkbox" checked={selectedIds.has(stock.id)} onChange={() => toggleSelect(stock.id)} className="rounded border-gray-400 w-4 h-4 text-[#b13e3e] focus:ring-[#b13e3e] cursor-pointer mx-auto" />
                      </td>
                    )}

                    <td className="py-3 px-4 text-center font-mono text-gray-500 text-xs">
                      {stock.barcode || "N/A"}
                    </td>
                    
                    <td className="py-3 px-4 text-center text-sm">
                      {formatDisplayDate(stock.restock_date)}
                    </td>
                    
                    {/* Amount Cell (View or Edit) */}
                    <td className="py-3 px-4 text-center font-bold text-sm">
                      {isEditing ? (
                        <input type="number" min="0" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="w-20 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:border-[#e6d04f]" />
                      ) : (
                        <span className={stock.amount === 0 ? "text-gray-400" : ""}>{stock.amount}</span>
                      )}
                    </td>
                    
                    {/* Expiry Cell (View or Edit) */}
                    <td className="py-3 px-4 text-center text-sm">
                      {isEditing ? (
                        <input type="date" value={editForm.expiry_date} onChange={e => setEditForm({...editForm, expiry_date: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:border-[#e6d04f]" />
                      ) : (
                        <span className={isExpired ? "text-[#b13e3e] font-bold bg-red-50 px-2 py-1 rounded" : ""}>
                          {formatDisplayDate(stock.expiry_date)}
                        </span>
                      )}
                    </td>

                    {/* Actions Cell */}
                    {!isDeleteMode && (
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-1">
                            <button onClick={() => submitEdit(stock.id)} disabled={isSavingEdit} className="p-1.5 bg-[#2aa564] text-white rounded hover:bg-[#238f55] transition shadow-sm disabled:opacity-50" title="Save">
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} disabled={isSavingEdit} className="p-1.5 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition shadow-sm disabled:opacity-50" title="Cancel">
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { startEdit(stock); setIsAdding(false); }} className="p-1.5 text-gray-400 hover:text-[#e6d04f] transition-colors rounded-full hover:bg-gray-100 mx-auto" title="Edit Batch">
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteStockModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleBulkDelete}
        selectedStocks={stocks.filter(s => selectedIds.has(s.id))}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StockHistory;