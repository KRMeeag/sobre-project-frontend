import type { CartItem } from "../../pages/POSPage";

interface CartPanelProps {
  cart: CartItem[];
  subtotal: number;
  discountPercent: number | "";
  setDiscountPercent: (val: number | "") => void;
  discountAmount: number;
  payableAmount: number;
  onInitiateRemove: (productId: string) => void;
  onProceedCheckout: () => void;
}

export default function CartPanel({
  cart, subtotal, discountPercent, setDiscountPercent, discountAmount, payableAmount, onInitiateRemove, onProceedCheckout
}: CartPanelProps) {
  return (
    <aside className="w-[300px] lg:w-[350px] xl:w-[380px] h-full bg-white border-l border-[#b4b4b4] shadow-[-4px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-30 shrink-0">
      <div className="p-5 border-b border-gray-200 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-black" style={{ fontFamily: "Raleway, sans-serif" }}>Shopping Cart</h2>
      </div>

      <div className="flex-1 overflow-y-auto relative flex flex-col bg-slate-50/50 custom-scrollbar [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 px-4">
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50 pb-10">
            <svg className="w-20 h-20 md:w-24 md:h-24 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p className="text-xl font-bold text-[#767676]" style={{ fontFamily: "Raleway, sans-serif" }}>No Items in Cart!</p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between bg-[#e9e9e9] rounded-xl p-3">
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  
                  <span className="font-bold text-black text-lg md:text-xl w-6 text-center shrink-0" style={{ fontFamily: "Raleway, sans-serif" }}>
                    {item.totalQuantity}
                  </span>
                  
                  {/* UPDATED: Cart mini-thumbnail image with Letter Fallback */}
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-300 shrink-0 flex items-center justify-center overflow-hidden">
                    {item.photo ? (
                      <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-lg font-bold uppercase" style={{ fontFamily: "Raleway, sans-serif" }}>
                        {item.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col ml-1 overflow-hidden">
                    <span className="font-bold text-black text-sm md:text-base leading-tight truncate" style={{ fontFamily: "Work Sans, sans-serif" }}>{item.name}</span>
                    
                    <span className="text-black text-xs md:text-sm mt-0.5" style={{ fontFamily: "Work Sans, sans-serif" }}>
                      {item.discount > 0 ? (
                        <>
                          <span className="line-through text-gray-400 mr-1.5">P{(item.price * item.totalQuantity).toFixed(2)}</span>
                          <span className="text-[#033860] font-bold">P{((item.price - (item.price * (item.discount / 100))) * item.totalQuantity).toFixed(2)}</span>
                        </>
                      ) : (
                        `P${(item.price * item.totalQuantity).toFixed(2)}`
                      )}
                    </span>
                  </div>

                </div>
                
                {/* UPDATED: Moved Discount Badge next to the X button */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.discount > 0 && (
                    <span className="bg-[#e0f2fe] text-[#033860] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {item.discount}% OFF
                    </span>
                  )}
                  <button onClick={() => onInitiateRemove(item.productId)} className="w-7 h-7 flex items-center justify-center shrink-0 rounded-full hover:bg-red-100 group transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" className="fill-[#fd1d1d] opacity-80 group-hover:opacity-100">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25C6.615 2.25 2.25 6.615 2.25 12C2.25 17.385 6.615 21.75 12 21.75C17.385 21.75 21.75 17.385 21.75 12C21.75 6.615 17.385 2.25 12 2.25ZM10.28 9.22C9.988 8.927 9.513 8.927 9.22 9.22C8.927 9.513 8.927 9.988 9.22 10.28L10.94 12L9.22 13.72C8.927 14.013 8.927 14.488 9.22 14.78C9.513 15.073 9.988 15.073 10.28 14.78L12 13.06L13.72 14.78C14.013 15.073 14.488 15.073 14.78 14.78C15.073 14.488 15.073 14.013 14.78 13.72L13.06 12L14.78 10.28C15.073 9.988 15.073 9.513 14.78 9.22C14.488 8.927 14.013 8.927 13.72 9.22L12 10.94L10.28 9.22Z" />
                    </svg>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#dbd3d8] p-5 md:p-6 flex flex-col shrink-0">
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-base text-black font-medium" style={{ fontFamily: "Work Sans, sans-serif" }}>Subtotal:</span>
            <span className="text-base text-black font-semibold" style={{ fontFamily: "Work Sans, sans-serif" }}>P{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base text-black font-medium" style={{ fontFamily: "Work Sans, sans-serif" }}>Discount:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-50 hover:bg-white focus-within:bg-white focus-within:ring-1 focus-within:ring-[#033860] border border-gray-300 rounded px-2 py-1 transition-all">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => {
                    if (e.target.value === "") setDiscountPercent("");
                    else {
                      let val = Number(e.target.value);
                      if (val > 100) val = 100;
                      if (val < 0) val = 0;
                      setDiscountPercent(val);
                    }
                  }}
                  className="w-7 text-right text-sm font-bold text-[#73768c] bg-transparent outline-none focus:text-black transition-colors [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                  placeholder="0"
                />
                <span className="text-sm font-bold text-[#73768c] ml-0.5" style={{ fontFamily: "Work Sans, sans-serif" }}>%</span>
              </div>
              <div className="text-base text-black font-medium" style={{ fontFamily: "Work Sans, sans-serif" }}>
                <span className="text-sm text-black font-semibold" style={{ fontFamily: "Work Sans, sans-serif" }}>P{discountAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-xl font-bold text-black" style={{ fontFamily: "Raleway, sans-serif" }}>Payable Amount:</span>
            <span className="text-2xl font-bold text-black" style={{ fontFamily: "Raleway, sans-serif" }}>P{payableAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={onProceedCheckout}
          className="w-full py-3.5 bg-[#2aa564] hover:bg-[#218b52] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-[10px] flex items-center justify-center gap-2 transition-colors shrink-0 active:scale-[0.98]"
        >
          <span className="text-lg md:text-xl font-bold text-[#f5f5f5]" style={{ fontFamily: "Raleway, sans-serif" }}>Proceed to Checkout</span>
          <svg width="24" height="24" viewBox="0 0 24 24" className="fill-[#f5f5f5]">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.71 15.71C13.61 15.8 13.48 15.85 13.35 15.85C13.22 15.85 13.09 15.8 13 15.71C12.8 15.51 12.8 15.2 13 15L15.29 12.71L8.35 12.71C8.07 12.71 7.85 12.49 7.85 12.21C7.85 11.93 8.07 11.71 8.35 11.71L15.29 11.71L13 9.42C12.8 9.22 12.8 8.91 13 8.71C13.2 8.51 13.51 8.51 13.71 8.71L16.65 11.65C16.85 11.85 16.85 12.16 16.65 12.36L13.71 15.71Z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}