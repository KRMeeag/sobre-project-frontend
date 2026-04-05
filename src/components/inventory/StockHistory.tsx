import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  PlusIcon,
  ArchiveBoxXMarkIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import type { StockItem } from "../../types";
import ConfirmDeleteStockModal from "./ConfirmDeleteStockModal";
import StatCard from "../general/StatCard";
import StockRow from "./StockRow";
import { supabase } from "../../lib/supabase";
import { getTomorrowDateString } from "../../utils/csvValidators";
import { useAddStock } from "../../hooks/useAddStock";

const API_URL = import.meta.env.VITE_API_URL;

interface StockHistoryProps {
  inventoryId: string;
  itemName: string;
  onUpdate?: () => void;
}

const StockHistory = ({ inventoryId, onUpdate }: StockHistoryProps) => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loadingStocks, setIsLoadingStocks] = useState(false);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  // ADDED supplier to edit form state
  const [editForm, setEditForm] = useState({
    amount: "",
    expiry_date: "",
    supplier: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const {
    isAdding,
    setIsAdding,
    form: addForm,
    updateForm: updateAddForm,
    isSaving: isSavingAdd,
    isAmountValid,
    isExpValid,
    isSupplierValid, // DESTRUCTURED new validation flag
    isValid: isAddFormValid,
    submit: submitAdd,
    cancel: cancelAdd,
  } = useAddStock(inventoryId, () => {
    fetchStock();
    if (onUpdate) onUpdate();
  });

  const formatDisplayDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchStock = useCallback(async () => {
    try {
      setIsLoadingStocks(true);
      const res = await axios.get(`${API_URL}/stock/inventory/${inventoryId}`);
      setStocks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStocks(false);
    }
  }, [inventoryId]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let totalAmount = 0;
    let expiredCount = 0;
    let earliestExpiryDate: Date | null = null;

    stocks.forEach((stock) => {
      const safeAmount = Number(stock.amount || 0);
      totalAmount += safeAmount;
      if (stock.expiry_date) {
        const expDate = new Date(stock.expiry_date);
        if (expDate < today) expiredCount += safeAmount;
        else if (!earliestExpiryDate || expDate < earliestExpiryDate)
          earliestExpiryDate = expDate;
      }
    });

    const formattedExpiry = earliestExpiryDate
      ? (earliestExpiryDate as Date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "None Active";
    return { totalAmount, expiredCount, earliestExpiry: formattedExpiry };
  }, [stocks]);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      new Set(prev).has(id)
        ? (prev.delete(id), new Set(prev))
        : new Set(prev).add(id),
    );

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || "";

      await Promise.all(
        Array.from(selectedIds).map((id) =>
          axios.delete(`${API_URL}/stock/${id}?users_id=${userId}`),
        ),
      );
      await fetchStock();
      if (onUpdate) onUpdate();
      setIsDeleteMode(false);
      setSelectedIds(new Set());
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (stock: StockItem) => {
    setEditingId(stock.id);
    setIsAdding(false);
    setEditForm({
      amount: stock.amount.toString(),
      expiry_date: stock.expiry_date
        ? new Date(stock.expiry_date).toISOString().split("T")[0]
        : "",
      supplier: stock.supplier || "", // LOAD existing supplier
    });
  };

  const submitEdit = async (id: string) => {
    if (!editForm.amount) return alert("Amount is required.");
    if (!editForm.supplier?.trim()) return alert("Supplier is required."); // STRICT check

    setIsSavingEdit(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || "";

      await axios.patch(`${API_URL}/stock/${id}?users_id=${userId}`, {
        amount: Number(editForm.amount),
        expiry_date: editForm.expiry_date || null,
        supplier: editForm.supplier.trim(), // INJECT payload
      });
      await fetchStock();
      if (onUpdate) onUpdate();
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="mt-8 font-['Work_Sans']">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Stock"
          value={summary.totalAmount}
          valueColorClass={
            summary.totalAmount > 0 ? "text-[#2aa564]" : "text-gray-800"
          }
        />
        <StatCard
          label="Expired Items"
          value={summary.expiredCount}
          valueColorClass={
            summary.expiredCount > 0 ? "text-[#b13e3e]" : "text-gray-800"
          }
        />
        <StatCard
          label="Next Expiry Date"
          value={summary.earliestExpiry}
          valueColorClass="text-[#087CA7]"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-[#004385] font-['Raleway']">
          Batch Records
        </h4>
        <div className="flex gap-2 h-9">
          {isDeleteMode ? (
            <>
              <button
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedIds(new Set());
                }}
                className="bg-white text-gray-600 border border-gray-300 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2 font-bold text-xs"
              >
                <XMarkIcon className="w-4 h-4" /> Cancel Delete
              </button>
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={selectedIds.size === 0}
                className={`text-white px-4 rounded-lg shadow transition flex items-center gap-2 font-bold text-xs ${selectedIds.size > 0 ? "bg-[#b13e3e] hover:bg-[#8c2d2d]" : "bg-gray-400 cursor-not-allowed"}`}
              >
                <TrashIcon className="w-4 h-4" /> Confirm Delete{" "}
                {selectedIds.size > 0 && `(${selectedIds.size})`}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingId(null);
                }}
                disabled={isAdding}
                className="bg-[#2aa564] text-white px-4 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#238f55] transition shadow-sm disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4" /> Add Batch
              </button>
              <button
                onClick={() => {
                  setIsDeleteMode(true);
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="bg-white border border-[#b13e3e] text-[#b13e3e] px-4 rounded-lg shadow-sm hover:bg-red-50 transition flex items-center gap-2 font-bold text-xs"
              >
                <TrashIcon className="w-4 h-4" /> Delete Batches
              </button>
            </>
          )}
        </div>
      </div>

      {loadingStocks ? (
        <div className="bg-white rounded-lg border border-gray-200 flex justify-center items-center py-10 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#f8f9fa] text-[#033860] text-xs uppercase tracking-wider font-bold border-b border-gray-200">
              <tr>
                {isDeleteMode && (
                  <th className="py-3 px-4 w-[5%] text-center"></th>
                )}
                {/* ADJUSTED width percentages for the new column */}
                <th className="py-3 px-4 text-center w-[15%]">Barcode</th>
                <th className="py-3 px-4 text-center w-[20%]">Stocked On</th>
                <th className="py-3 px-4 text-center w-[20%]">Supplier</th>
                <th className="py-3 px-4 text-center w-[15%]">Amount</th>
                <th className="py-3 px-4 text-center w-[15%]">
                  Expiration Date
                </th>
                {!isDeleteMode && (
                  <th className="py-3 px-4 w-[10%] text-center">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="text-[#223843] divide-y divide-gray-100">
              {isAdding && (
                <tr className="bg-green-50/50">
                  {isDeleteMode && <td className="py-2 px-4"></td>}
                  <td className="py-2 px-4 text-center text-xs text-gray-400 italic">
                    Auto-generated
                  </td>
                  <td className="py-2 px-4 text-center text-xs text-gray-400 italic">
                    Today
                  </td>
                  {/* NEW Supplier Input Cell */}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={addForm.supplier}
                      onChange={(e) =>
                        updateAddForm("supplier", e.target.value)
                      }
                      className={`w-full border rounded px-2 py-1 text-center text-sm outline-none transition focus:ring-1 ${!isSupplierValid && addForm.supplier !== "" ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#2aa564] focus:ring-[#2aa564]"}`}
                      placeholder="Supplier Name *"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min="1"
                      value={addForm.amount}
                      onChange={(e) => updateAddForm("amount", e.target.value)}
                      className={`w-full border rounded px-2 py-1 text-center text-sm outline-none transition focus:ring-1 ${!isAmountValid && addForm.amount !== "" ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#2aa564] focus:ring-[#2aa564]"}`}
                      placeholder="Qty"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="date"
                      min={getTomorrowDateString()}
                      value={addForm.expiry_date}
                      onChange={(e) =>
                        updateAddForm("expiry_date", e.target.value)
                      }
                      className={`w-full border rounded px-2 py-1 text-center text-sm outline-none transition focus:ring-1 ${!isExpValid ? "border-red-400 text-red-600 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#2aa564] focus:ring-[#2aa564]"}`}
                    />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={submitAdd}
                        disabled={isSavingAdd || !isAddFormValid}
                        className={`p-1.5 rounded transition shadow-sm ${isAddFormValid ? "bg-[#2aa564] text-white hover:bg-[#238f55]" : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}
                        title={
                          isAddFormValid ? "Save Batch" : "Enter valid details"
                        }
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelAdd}
                        disabled={isSavingAdd}
                        className="p-1.5 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition shadow-sm disabled:opacity-50"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {stocks.length === 0 && !isAdding && (
                <tr>
                  <td
                    colSpan={isDeleteMode ? 7 : 6} // INCREASED colSpan by 1
                    className="py-12 text-center text-gray-500"
                  >
                    <ArchiveBoxXMarkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-[#223843]">
                      No stock history available
                    </p>
                  </td>
                </tr>
              )}

              {stocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  isEditing={editingId === stock.id}
                  isDeleteMode={isDeleteMode}
                  isSelected={selectedIds.has(stock.id)}
                  editForm={editForm}
                  isSavingEdit={isSavingEdit}
                  onToggleSelect={toggleSelect}
                  onEditChange={(field, value) =>
                    setEditForm((prev) => ({ ...prev, [field]: value }))
                  }
                  onStartEdit={startEdit}
                  onSubmitEdit={submitEdit}
                  onCancelEdit={() => setEditingId(null)}
                  formatDisplayDate={formatDisplayDate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteStockModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleBulkDelete}
        selectedStocks={stocks.filter((s) => selectedIds.has(s.id))}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StockHistory;
