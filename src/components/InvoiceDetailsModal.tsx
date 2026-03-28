import { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL;

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptId: string | null;
}

export default function InvoiceDetailsModal({ isOpen, onClose, receiptId }: InvoiceDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && receiptId) {
      setLoading(true);
      axios.get(`${API_URL}/sales/${receiptId}`)
        .then(res => setData(res.data))
        .catch(err => console.error("Error fetching receipt:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, receiptId]);

  if (!isOpen) return null;

  const receipt = data?.receipt;
  const items = data?.items || [];

  const subtotal = Number(receipt?.subtotal || 0);
  const discountAmt = Number(receipt?.discount || 0); 
  const total = Number(receipt?.total_price || 0);
  
  const discountPct = subtotal > 0 ? Math.round((discountAmt / subtotal) * 100) : 0;
  
  const tendered = Number(receipt?.amount_tendered || 0);
  const changeAmt = Number(receipt?.change || 0);

  return (
    <div className="fixed inset-0 bg-[#35435a]/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Matched to Sales Page: max-w-175, rounded-3xl, specific animate-in effects */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-175 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="pt-6 px-8 pb-4 flex justify-between items-center">
          <h2 className="text-[15px] font-['Work_Sans'] text-gray-500">
            Details for Invoice No. <span className="font-bold text-slate-800">{receipt?.invoice_no || "..."}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (List) */}
        <div className="px-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <p className="text-center py-8 text-gray-500 font-['Work_Sans']">Loading invoice details...</p>
          ) : (
            <table className="w-full text-left">
              <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-100">
                <tr>
                  <th className="pb-4 pl-12 text-left font-normal">Item</th>
                  <th className="pb-4 text-center font-normal">
                    Price
                    <br />
                    Individual
                  </th>
                  <th className="pb-4 text-center font-normal">Amount</th>
                  <th className="pb-4 text-center font-normal">Subtotal</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {items.map((item: any, idx: number) => {
                  
                  const itemPrice = Number(item.price_at_sale || 0); 
                  const itemQty = Number(item.quantity || 0);
                  const itemSubtotal = itemPrice * itemQty;

                  return (
                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                            <span className="text-gray-400 text-[10px] font-medium">Img</span>
                          </div>
                          <span className="font-bold text-slate-800 leading-tight max-w-30 truncate">
                            {item.product_name || "Item"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-center text-gray-500">P{itemPrice.toFixed(2)}</td>
                      <td className="py-4 text-center text-gray-500">{itemQty}</td>
                      <td className="py-4 text-center text-gray-500">P{itemSubtotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-8 flex justify-between items-start border-t border-gray-100">
          
          {/* Left Column (Main Totals) */}
          <div className="space-y-2 text-[15px]">
            <div className="flex justify-between w-64">
              <span className="font-bold text-slate-800">Subtotal:</span>
              <span className="text-slate-800 font-medium">P{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="font-bold text-slate-800">Discount:</span>
              <span className="text-slate-800 font-medium text-red-500">
                {discountPct > 0 ? `${discountPct}% ` : ''}(-P{discountAmt.toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between w-64 pt-3 text-lg">
              <span className="font-extrabold text-slate-800">Total Price:</span>
              <span className="font-extrabold text-slate-800">P{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Right Column (Tendered & Change) */}
          <div className="space-y-2 text-[15px] pt-1">
            <div className="flex justify-between w-56">
              <span className="font-bold text-gray-500">Tendered Amount:</span>
              <span className="text-gray-700 font-medium">P{tendered.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-56">
              <span className="font-bold text-slate-800">Change:</span>
              <span className="text-slate-800 font-medium">P{changeAmt.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}