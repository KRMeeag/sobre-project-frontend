import { XMarkIcon, ExclamationTriangleIcon, ArchiveBoxXMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { InventoryItem } from "../../types";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedItems: InventoryItem[];
  isDeleting: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  selectedItems,
  isDeleting,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  // Check if ANY of the selected items have stock remaining
  const hasActiveStock = selectedItems.some((item) => item.total_stock > 0);

  return (
    <div className="fixed inset-0 bg-[#35435a]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Changes color based on severity */}
        <div className={`px-8 pt-6 pb-4 flex justify-between items-center border-b border-gray-100 ${hasActiveStock ? 'bg-red-50' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            {hasActiveStock ? (
              <ExclamationTriangleIcon className="w-7 h-7 text-[#b13e3e]" />
            ) : (
              <ArchiveBoxXMarkIcon className="w-7 h-7 text-[#004385]" />
            )}
            <h2 className={`text-xl font-bold font-['Raleway'] ${hasActiveStock ? 'text-[#b13e3e]' : 'text-[#004385]'}`}>
              {hasActiveStock ? "Warning: Active Stocks Detected" : "Confirm Deletion"}
            </h2>
          </div>
          <button onClick={onClose} disabled={isDeleting} className="text-gray-400 hover:text-[#b13e3e] transition-colors focus:outline-none">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 font-['Work_Sans'] bg-white">
          <p className="text-[#223843] mb-4 font-medium">
            {hasActiveStock 
              ? "You are about to delete items that currently have stock batches. Deleting these items will permanently delete all associated stock records. Are you absolutely sure?" 
              : "Are you sure you want to permanently delete the following items?"}
          </p>

          {/* List of items to be deleted */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-60 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{item.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#223843] truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold ${item.total_stock > 0 ? 'text-[#b13e3e]' : 'text-gray-500'}`}>
                    Stock: {item.total_stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end shrink-0 bg-gray-50 rounded-b-2xl gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-500 hover:bg-gray-200 font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-[#b13e3e] hover:bg-[#8c2d2d] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <TrashIcon className="w-5 h-5" />
            )}
            {isDeleting ? "Deleting..." : "Yes, Delete Items"}
          </button>
        </div>

      </div>
    </div>
  );
}