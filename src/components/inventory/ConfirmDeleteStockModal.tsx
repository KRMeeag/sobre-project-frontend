import {
  XMarkIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/outline";
import type { StockItem } from "../../types";

interface ConfirmDeleteStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedStocks: StockItem[];
  isDeleting: boolean;
}

export default function ConfirmDeleteStockModal({
  isOpen,
  onClose,
  onConfirm,
  selectedStocks,
  isDeleting,
}: ConfirmDeleteStockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#35435a]/80 z-100 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 pt-6 pb-4 flex justify-between items-center border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <ArchiveBoxXMarkIcon className="w-7 h-7 text-[#b13e3e]" />
            <h2 className="text-xl font-bold font-['Raleway'] text-[#b13e3e]">
              Confirm Batch Deletion
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-[#b13e3e] transition-colors focus:outline-none"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 font-['Work_Sans'] bg-white">
          <p className="text-[#223843] mb-4 font-medium">
            Are you sure you want to permanently delete the following stock
            batches? This action cannot be undone.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-60 overflow-y-auto custom-scrollbar p-4 space-y-2">
            {selectedStocks.map((stock) => (
              <div
                key={stock.id}
                className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
              >
                <div>
                  <p className="text-xs text-gray-500 font-mono">
                    Barcode: {stock.barcode || "N/A"}
                  </p>
                  <p className="text-sm font-bold text-[#223843]">
                    Exp:{" "}
                    {stock.expiry_date
                      ? new Date(stock.expiry_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm font-bold text-[#b13e3e]">
                    {stock.amount}
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
            {isDeleting ? "Deleting..." : "Yes, Delete Batches"}
          </button>
        </div>
      </div>
    </div>
  );
}
