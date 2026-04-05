import type { Product } from "../pages/POSPage";

interface VariationModalProps {
  isOpen: boolean;
  selectedProduct: Product | null;
  variationQuantities: Record<string, number>;
  getQtyInCart: (productId: string, stockId: string) => number;
  updateVariationQty: (stockId: string, delta: number, maxAmount: number) => void;
  onClose: () => void;
  onRecordSale: () => void;
}

export default function VariationModal({
  isOpen,
  selectedProduct,
  variationQuantities,
  getQtyInCart,
  updateVariationQty,
  onClose,
  onRecordSale
}: VariationModalProps) {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative flex flex-col max-h-[85vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-[#73768c] hover:text-black transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.757 17.24L17 7m-10.243 0L17 17.24" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-black mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
          Which variation?
        </h2>

        <div className="w-full border-t border-[#bab6b6] mb-2 shrink-0"></div>

        <div className="w-full overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-37.5 pr-2">
          <table className="w-full text-center border-collapse min-w-125">
            <thead>
              <tr>
                <th className="pb-3 pt-2 font-normal text-[#ada7a7] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Bar Code</th>
                <th className="pb-3 pt-2 font-normal text-[#ada7a7] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Stocked On</th>
                <th className="pb-3 pt-2 font-normal text-[#ada7a7] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Amount</th>
                <th className="pb-3 pt-2 font-normal text-[#ada7a7] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Expiration Date</th>
                <th className="pb-3 pt-2 font-normal text-[#ada7a7] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Quantity</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'Raleway, sans-serif' }}>
              
              {(!selectedProduct.stock || selectedProduct.stock.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-gray-400 font-bold">No variations found for this product.</td>
                </tr>
              ) : (
                selectedProduct.stock.map((stockItem) => {
                  const qtyInCart = getQtyInCart(selectedProduct.id, stockItem.id);
                  const availableStock = Math.max(0, stockItem.amount - qtyInCart);

                  return (
                    <tr key={stockItem.id} className="border-b border-gray-100">
                      <td className="py-4 text-[#223843] text-sm font-medium">{stockItem.barcode || "N/A"}</td>
                      <td className="py-4 text-[#223843] text-sm font-medium">
                        {stockItem.restock_date ? new Date(stockItem.restock_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className={`py-4 text-sm font-bold ${availableStock === 0 ? 'text-red-500' : 'text-[#223843]'}`}>
                        {availableStock}
                      </td>
                      <td className="py-4 text-[#223843] text-sm font-medium">
                         {stockItem.expiry_date ? new Date(stockItem.expiry_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4">
                        <div className={`flex items-center bg-[#f9f9f9] border rounded-lg w-21.25 h-8 mx-auto overflow-hidden ${availableStock === 0 ? 'border-gray-300 opacity-50' : 'border-[#73768c]'}`}>
                          <button 
                            onClick={() => updateVariationQty(stockItem.id, -1, availableStock)}
                            disabled={availableStock === 0 || (variationQuantities[stockItem.id] || 0) <= 0}
                            className="w-6.5 h-full flex items-center justify-center hover:bg-gray-200 transition-colors border-r border-inherit disabled:cursor-not-allowed"
                          >
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M2 6h8" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                          <span className="flex-1 text-center font-semibold text-sm text-[#242323] pt-0.5" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                            {variationQuantities[stockItem.id] || 0}
                          </span>
                          <button 
                            onClick={() => updateVariationQty(stockItem.id, 1, availableStock)}
                            disabled={(variationQuantities[stockItem.id] || 0) >= availableStock}
                            className="w-6.5 h-full flex items-center justify-center hover:bg-gray-200 transition-colors border-l border-inherit disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M6 2v8M2 6h8" strokeWidth="2" strokeLinecap="round"/><path d="M6 2v8" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>

        <div className="w-full border-t border-[#bab6b6] mt-4 pt-4 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#b13e3e] hover:bg-red-800 text-[#e9e9e9] text-sm font-bold transition-all shadow-sm active:scale-95"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            Cancel
          </button>
          <button 
            onClick={onRecordSale}
            disabled={!selectedProduct.stock || selectedProduct.stock.length === 0 || Object.values(variationQuantities).every(qty => qty === 0)}
            className="px-6 py-2 rounded-lg bg-[#033860] hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-[#e9e9e9] text-sm font-bold transition-all shadow-sm active:scale-95"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            Record Sale
          </button>
        </div>

      </div>
    </div>
  );
}