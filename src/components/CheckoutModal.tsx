import type { CartItem } from "../pages/POSPage";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  currentDiscount: number;
  payableAmount: number;
  tenderedAmount: number | "";
  setTenderedAmount: (val: number | "") => void;
  change: number;
  onFinalizeCheckout: () => void;
  isSubmitting: boolean; 
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  subtotal,
  currentDiscount,
  payableAmount,
  tenderedAmount,
  setTenderedAmount,
  change,
  onFinalizeCheckout,
  isSubmitting
}: CheckoutModalProps) {
  
  if (!isOpen) return null;

  const discountAmount = subtotal * (currentDiscount / 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white shadow-xl w-full max-w-3xl p-6 md:p-8 relative flex flex-col rounded-[15px] max-h-[90vh]">
        
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-[18px] text-[#73768c] font-normal" style={{ fontFamily: 'Raleway, sans-serif' }}>
            New Transaction Details
          </h2>
          <button 
            onClick={() => { onClose(); setTenderedAmount(""); }}
            className="text-gray-400 hover:text-black transition-colors focus:outline-none"
            disabled={isSubmitting} 
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full border-t border-gray-200 mb-2 shrink-0"></div>

        <div className="w-full overflow-x-auto custom-scrollbar flex-1 max-h-[35vh] mb-6">
          <table className="w-full text-center border-collapse min-w-[125px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 pt-2 font-medium text-[#a29898] text-sm text-left pl-2" style={{ fontFamily: 'Raleway, sans-serif' }}>Item</th>
                <th className="pb-3 pt-2 font-medium text-[#a29898] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Price Individual</th>
                <th className="pb-3 pt-2 font-medium text-[#a29898] text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>Amount</th>
                <th className="pb-3 pt-2 font-medium text-[#a29898] text-sm text-right pr-2" style={{ fontFamily: 'Raleway, sans-serif' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.productId} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-4 text-left pl-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#b4b4b4] shrink-0 flex items-center justify-center overflow-hidden text-[10px] text-white">
                        Img
                      </div>
                      <span className="font-bold text-[#223843] text-sm md:text-base" style={{ fontFamily: 'Raleway, sans-serif' }}>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-500 text-sm font-medium" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{Number(item.price).toFixed(2)}</td>
                  <td className="py-4 text-gray-500 text-sm font-medium" style={{ fontFamily: 'Work Sans, sans-serif' }}>{item.totalQuantity}</td>
                  <td className="py-4 text-gray-500 text-sm font-medium text-right pr-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{(Number(item.price) * item.totalQuantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-full border-t border-gray-300 mb-6 shrink-0"></div>

        <div className="flex flex-col md:flex-row justify-between gap-8 w-full shrink-0">
          
          <div className="flex flex-col gap-3 w-full md:w-1/2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            <div className="grid grid-cols-2 pr-4 md:pr-12">
              <span className="text-gray-800 text-[15px]">Subtotal:</span>
              <span className="text-gray-800 text-[15px] text-right">P{subtotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 pr-4 md:pr-12">
              <span className="text-gray-800 text-[15px]">Discount:</span>
              <span className="text-gray-800 text-[15px] text-right">
                {currentDiscount || 0}% (-P{discountAmount.toFixed(2)})
              </span>
            </div>

            <div className="grid grid-cols-2 pr-4 md:pr-12 mt-1">
              <span className="text-[18px] font-extrabold text-black">Total Price:</span>
              <span className="text-[18px] font-extrabold text-black text-right">P{payableAmount.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-gray-100 my-2 pr-4 md:pr-12"></div>

            <div className="grid grid-cols-2 pr-4 md:pr-12">
              <span className="text-gray-600 text-[14px]">Tendered Amount:</span>
              <span className="text-gray-600 text-[14px] text-right">P{typeof tenderedAmount === "number" ? tenderedAmount.toFixed(2) : "0.00"}</span>
            </div>
            <div className="grid grid-cols-2 pr-4 md:pr-12">
              <span className="text-[15px] font-bold text-black">Change:</span>
              <span className="text-[15px] font-bold text-black text-right">
                {(typeof tenderedAmount !== "number" || tenderedAmount === 0 || change < 0) ? "-----" : `P${change.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="flex flex-col w-full md:w-1/2 md:items-end justify-end">
            <div className="w-full md:w-60 flex flex-col gap-2 mb-6">
              <span className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Work Sans, sans-serif' }}>Tendered Amount:</span>
              <div className="relative w-full h-[45px] bg-white border border-gray-300 rounded-[8px] flex items-center px-3 focus-within:border-[#033860] focus-within:ring-1 focus-within:ring-[#033860] transition-all">
                <span className="text-gray-500 font-medium mr-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>P</span>
                <input 
                  type="number"
                  value={tenderedAmount}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setTenderedAmount("");
                    } else {
                      setTenderedAmount(Number(e.target.value));
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-transparent text-[16px] text-gray-800 outline-none font-medium disabled:opacity-50"
                  style={{ fontFamily: 'Work Sans, sans-serif' }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-[240px]">
              <button 
                onClick={() => { onClose(); setTenderedAmount(""); }}
                disabled={isSubmitting}
                className="flex-1 h-[45px] rounded-[6px] bg-[#b13e3e] hover:bg-red-800 disabled:opacity-50 text-white text-[14px] font-bold transition-all shadow-sm active:scale-95 focus:outline-none"
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                Cancel Sale
              </button>
              <button 
                onClick={onFinalizeCheckout}
                disabled={typeof tenderedAmount !== "number" || tenderedAmount < payableAmount || isSubmitting}
                className="flex-1 h-[45px] rounded-[6px] text-white disabled:opacity-50 disabled:cursor-not-allowed text-[14px] font-bold transition-all shadow-sm active:scale-95 focus:outline-none flex items-center justify-center"
                style={{ 
                  fontFamily: 'Raleway, sans-serif',
                  backgroundColor: (typeof tenderedAmount === "number" && tenderedAmount >= payableAmount && !isSubmitting) ? "#033860" : "#8c949e"
                }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Record Sale"
                )}
              </button>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}