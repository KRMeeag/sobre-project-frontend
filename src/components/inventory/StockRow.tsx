import {
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { StockItem } from "../../types";

interface StockRowProps {
  stock: StockItem;
  isEditing: boolean;
  isDeleteMode: boolean;
  isSelected: boolean;
  editForm: { amount: string; expiry_date: string };
  isSavingEdit: boolean;
  onToggleSelect: (id: string) => void;
  onEditChange: (field: string, value: string) => void;
  onStartEdit: (stock: StockItem) => void;
  onSubmitEdit: (id: string) => void;
  onCancelEdit: () => void;
  formatDisplayDate: (date?: string | null) => string;
}

export default function StockRow({
  stock,
  isEditing,
  isDeleteMode,
  isSelected,
  editForm,
  isSavingEdit,
  onToggleSelect,
  onEditChange,
  onStartEdit,
  onSubmitEdit,
  onCancelEdit,
  formatDisplayDate,
}: StockRowProps) {
  const isExpired =
    stock.expiry_date &&
    new Date(stock.expiry_date) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-red-50/40" : ""} ${isEditing ? "bg-yellow-50/30" : ""}`}
    >
      {isDeleteMode && (
        <td className="py-3 px-4 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(stock.id)}
            className="rounded border-gray-400 w-4 h-4 text-[#b13e3e] focus:ring-[#b13e3e] cursor-pointer mx-auto"
          />
        </td>
      )}
      <td className="py-3 px-4 text-center font-mono text-gray-500 text-xs">
        {stock.barcode || "N/A"}
      </td>
      <td className="py-3 px-4 text-center text-sm">
        {formatDisplayDate(stock.restock_date)}
      </td>
      <td className="py-3 px-4 text-center font-bold text-sm">
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={editForm.amount}
            onChange={(e) => onEditChange("amount", e.target.value)}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:border-[#e6d04f]"
          />
        ) : (
          <span className={stock.amount === 0 ? "text-gray-400" : ""}>
            {stock.amount}
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-center text-sm">
        {isEditing ? (
          <input
            type="date"
            value={editForm.expiry_date}
            onChange={(e) => onEditChange("expiry_date", e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:border-[#e6d04f]"
          />
        ) : (
          <span
            className={
              isExpired
                ? "text-[#b13e3e] font-bold bg-red-50 px-2 py-1 rounded"
                : ""
            }
          >
            {formatDisplayDate(stock.expiry_date)}
          </span>
        )}
      </td>
      {!isDeleteMode && (
        <td className="py-3 px-4 text-center">
          {isEditing ? (
            <div className="flex justify-center gap-1">
              <button
                onClick={() => onSubmitEdit(stock.id)}
                disabled={isSavingEdit}
                className="p-1.5 bg-[#2aa564] text-white rounded hover:bg-[#238f55] transition shadow-sm disabled:opacity-50"
                title="Save"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
                disabled={isSavingEdit}
                className="p-1.5 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition shadow-sm disabled:opacity-50"
                title="Cancel"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartEdit(stock)}
              className="p-1.5 text-gray-400 hover:text-[#e6d04f] transition-colors rounded-full hover:bg-gray-100 mx-auto"
              title="Edit Batch"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
