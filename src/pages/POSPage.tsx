import { useState, useEffect } from "react";

// Updated Interfaces
interface StockItem {
  id: string;
  barcode: string;
  restock_date: string; 
  amount: number;       
  expiry_date: string;
}

interface Product {
  id: string; 
  name: string;
  category: string;
  price: number;
  stock: StockItem[]; 
}

interface CartItem {
  productId: string; 
  name: string;
  price: number;
  totalQuantity: number;
  variations: { stockId: string; variationCode: string; quantity: number }[]; 
}

const POSPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number | "">(0); 
  const [variationQuantities, setVariationQuantities] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [tenderedAmount, setTenderedAmount] = useState<number | "">("");

  const categories = [
    "All", "Snacks", "Frozen", "Canned", "Drinks", 
    "Household", "Personal Care", "Restricted", "Electronics", "Apparel"
  ];

  // 🚀 BACKEND INTEGRATION
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (activeCategory !== "All") params.append("category", activeCategory);
        if (searchQuery.trim() !== "") params.append("search", searchQuery.trim());

        const response = await fetch(`http://localhost:5000/api/inventory?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();

        if (result && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          console.error("Backend did not return data in expected { data: [] } format:", result);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchInventory();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeCategory, searchQuery]); 

  // ==========================================
  // NEW VIRTUAL STOCK LOGIC
  // ==========================================

  // Check how many of a specific stock item are currently in the cart
  const getQtyInCart = (productId: string, stockId: string) => {
    const cartItem = cart.find(item => item.productId === productId);
    if (!cartItem) return 0;
    const variation = cartItem.variations.find(v => v.stockId === stockId);
    return variation ? variation.quantity : 0;
  };

  // Check the total available stock for a product (subtracting cart items)
  const getTotalAvailableStock = (product: Product) => {
    if (!product.stock) return 0;
    return product.stock.reduce((total, s) => {
      return total + Math.max(0, s.amount - getQtyInCart(product.id, s.id));
    }, 0);
  };

  // ==========================================

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    const initialQtys: Record<string, number> = {};
    if (product.stock && product.stock.length > 0) {
      product.stock.forEach(stockItem => {
        initialQtys[stockItem.id] = 0;
      });
    }
    setVariationQuantities(initialQtys);
  };

  const updateVariationQty = (stockId: string, delta: number, maxAmount: number) => {
    setVariationQuantities(prev => {
      const currentQty = prev[stockId] || 0;
      const newQty = Math.max(0, Math.min(currentQty + delta, maxAmount));
      return { ...prev, [stockId]: newQty };
    });
  };

  const handleRecordSale = () => {
    if (!selectedProduct || !selectedProduct.stock) return;

    let addedTotal = 0;
    const addedVariations: { stockId: string; variationCode: string; quantity: number }[] = [];

    selectedProduct.stock.forEach(stockItem => {
      const qty = variationQuantities[stockItem.id] || 0;
      if (qty > 0) {
        addedTotal += qty;
        addedVariations.push({ stockId: stockItem.id, variationCode: stockItem.barcode, quantity: qty });
      }
    });

    if (addedTotal === 0) return;

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === selectedProduct.id);
      
      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        const item = updatedCart[existingItemIndex];
        
        const mergedVariations = [...item.variations];
        addedVariations.forEach(addedVar => {
          const varIndex = mergedVariations.findIndex(v => v.stockId === addedVar.stockId);
          if (varIndex >= 0) mergedVariations[varIndex].quantity += addedVar.quantity;
          else mergedVariations.push(addedVar);
        });

        updatedCart[existingItemIndex] = {
          ...item,
          totalQuantity: item.totalQuantity + addedTotal,
          variations: mergedVariations
        };
        return updatedCart;
      } else {
        return [...prevCart, {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          totalQuantity: addedTotal,
          variations: addedVariations
        }];
      }
    });

    setSelectedProduct(null);
    setVariationQuantities({});
  };

  const removeFromCart = (productIdToRemove: string) => {
    setCart((prev) => prev.filter(item => item.productId !== productIdToRemove));
  };

  const handleFinalizeCheckout = async () => {
    try {
      // Temporarily grab the store_id from the loaded products to prevent Supabase foreign key errors
      const storeId = products.length > 0 ? (products[0] as any).store_id : null;

      if (!storeId) {
        alert("Error: No store_id found. Cannot record sale.");
        return;
      }

      const payload = {
        store_id: storeId,
        user_id: null, // Replace with actual user ID later when auth is complete
        subtotal: subtotal,
        discount: discountAmount,
        total_price: payableAmount,
        cart: cart
      };

      const response = await fetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to record sale in backend");
      }

      const result = await response.json();
      console.log("Sale Success:", result);
      
      alert(`Sale Recorded Successfully! Invoice No: ${result.receipt.invoice_no}`);
      
      // Clear cart and close modal
      setCart([]);
      setIsCheckoutOpen(false);
      setTenderedAmount("");
      setDiscountPercent(0);

      // Force page to reload to instantly fetch the new deducted stock numbers!
      window.location.reload(); 

    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to record sale. Check console for details.");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.totalQuantity), 0);
  const currentDiscount = typeof discountPercent === "number" ? discountPercent : 0;
  const discountAmount = subtotal * (currentDiscount / 100); 
  const payableAmount = subtotal - discountAmount;
  const change = typeof tenderedAmount === "number" ? tenderedAmount - payableAmount : 0;


  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden text-gray-800">
      
      <div className="h-3 md:h-4 w-full bg-[#033860] shadow-sm z-40 shrink-0"></div>

      <div className="flex flex-1 overflow-hidden min-w-0 w-full">
        
        {/* LEFT SIDE: MAIN POS AREA */}
        <div className="flex-1 flex flex-col h-full px-4 pt-4 md:px-6 md:pt-5 min-w-0 max-w-full">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 shrink-0 w-full">
            <h1 className="text-xl md:text-2xl font-bold text-[#223843] tracking-tight truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Hello, User101
            </h1>
            
            <div className="relative w-full md:max-w-xs lg:max-w-sm h-10 flex items-center bg-white border border-gray-300 rounded-lg px-3 shrink-0 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-[#087ca7] focus-within:border-transparent">
              <input 
                type="text" 
                placeholder="Search for Items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-gray-700 focus:outline-none bg-transparent"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              />
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#087ca7] animate-spin ml-2 shrink-0"></div>
              ) : (
                <svg className="w-4 h-4 text-gray-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              )}
            </div>
          </div>

          {/* Categories Section */}
          <div className="w-full max-w-full shrink-0 mb-4 relative group/scroll">
            <div className="bg-white rounded-[15px] shadow-sm border border-gray-100 p-2 w-full max-w-full">
              <div className="flex flex-nowrap gap-2 overflow-x-auto touch-pan-x snap-x snap-mandatory pb-1 
                [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent 
                group-hover/scroll:[&::-webkit-scrollbar-thumb]:bg-[#b4b4b4] hover:[&::-webkit-scrollbar-thumb]:!bg-[#73768c] 
                [&::-webkit-scrollbar-thumb]:rounded-full transition-all duration-300">
                {categories.map((category) => (
                  <button 
                    key={category}
                    title={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-[calc((100%-3rem)/7)] flex-none px-1 py-1.5 flex items-center justify-center text-xs md:text-sm font-bold transition-all rounded-lg border-2 snap-start
                      ${activeCategory === category ? 'bg-[#087ca7]/10 border-[#087ca7] text-[#087ca7]' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`}
                    style={{ fontFamily: 'Raleway, sans-serif' }}
                  >
                    <span className="truncate px-1">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <main className="flex-1 overflow-y-auto pb-6 pr-2 custom-scrollbar [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {!isLoading && products.length === 0 ? (
               <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-bold">
                 <p>No products found.</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product) => {
                  // NEW: Check if product has any available stock left
                  const availableTotal = getTotalAvailableStock(product);
                  const isOutOfStock = availableTotal <= 0;

                  return (
                    <button 
                      key={product.id} 
                      onClick={() => !isOutOfStock && handleProductClick(product)}
                      disabled={isOutOfStock}
                      className={`bg-white rounded-[15px] shadow-sm border border-gray-100 flex flex-col items-center p-3 transition-all shrink-0 group 
                        ${isOutOfStock ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:shadow-md hover:border-[#087ca7]/30 hover:-translate-y-0.5'}`}
                    >
                      <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 border border-gray-200 rounded-full mb-2 flex items-center justify-center overflow-hidden shrink-0 transition-colors ${!isOutOfStock && 'group-hover:border-[#087ca7]/50'}`}>
                         <span className="text-gray-400 text-[10px] font-medium">Img</span>
                      </div>
                      <h3 className="text-xs md:text-sm font-bold text-gray-800 text-center leading-snug mb-1 line-clamp-2" style={{ fontFamily: 'Raleway, sans-serif' }}>
                        {product.name}
                      </h3>
                      <p className={`text-sm md:text-base font-bold mt-auto ${isOutOfStock ? 'text-red-500' : 'text-[#087ca7]'}`} style={{ fontFamily: 'Work Sans, sans-serif' }}>
                        {isOutOfStock ? "Out of Stock" : `P${Number(product.price).toFixed(2)}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </main>

        </div>

        {/* RIGHT SIDE: CART PANEL */}
        <aside className="w-[300px] lg:w-[350px] xl:w-[380px] h-full bg-white border-l border-[#b4b4b4] shadow-[-4px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-30 shrink-0">
          
          <div className="p-5 border-b border-gray-200 shrink-0">
            <h2 className="text-xl md:text-2xl font-bold text-black" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Shopping Cart
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto relative flex flex-col bg-slate-50/50 custom-scrollbar [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 px-4">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-50 pb-10">
                 <svg className="w-20 h-20 md:w-24 md:h-24 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                 </svg>
                 <p className="text-xl font-bold text-[#767676]" style={{ fontFamily: 'Raleway, sans-serif' }}>
                   No Items in Cart!
                 </p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between bg-[#e9e9e9] rounded-xl p-3">
                    <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                      <span className="font-bold text-black text-lg md:text-xl w-6 text-center shrink-0" style={{ fontFamily: 'Raleway, sans-serif' }}>
                        {item.totalQuantity}
                      </span>
                      <div className="flex flex-col ml-1 overflow-hidden">
                        <span className="font-bold text-black text-sm md:text-base leading-tight truncate" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                          {item.name}
                        </span>
                        <span className="text-black text-xs md:text-sm mt-0.5" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                          P{(Number(item.price) * item.totalQuantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="w-7 h-7 flex items-center justify-center shrink-0 rounded-full hover:bg-red-100 group transition-colors ml-2"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" className="fill-[#fd1d1d] opacity-80 group-hover:opacity-100">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25C6.615 2.25 2.25 6.615 2.25 12C2.25 17.385 6.615 21.75 12 21.75C17.385 21.75 21.75 17.385 21.75 12C21.75 6.615 17.385 2.25 12 2.25ZM10.28 9.22C9.988 8.927 9.513 8.927 9.22 9.22C8.927 9.513 8.927 9.988 9.22 10.28L10.94 12L9.22 13.72C8.927 14.013 8.927 14.488 9.22 14.78C9.513 15.073 9.988 15.073 10.28 14.78L12 13.06L13.72 14.78C14.013 15.073 14.488 15.073 14.78 14.78C15.073 14.488 15.073 14.013 14.78 13.72L13.06 12L14.78 10.28C15.073 9.988 15.073 9.513 14.78 9.22C14.488 8.927 14.013 8.927 13.72 9.22L12 10.94L10.28 9.22Z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#dbd3d8] p-5 md:p-6 flex flex-col shrink-0">
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-base text-black font-medium" style={{ fontFamily: 'Work Sans, sans-serif' }}>Subtotal:</span>
                <span className="text-base text-black font-semibold" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base text-black font-medium" style={{ fontFamily: 'Work Sans, sans-serif' }}>Discount:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-50 hover:bg-white focus-within:bg-white focus-within:ring-1 focus-within:ring-[#033860] border border-gray-300 rounded px-2 py-1 transition-all">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setDiscountPercent("");
                        } else {
                          let val = Number(e.target.value);
                          if (val > 100) val = 100;
                          if (val < 0) val = 0;
                          setDiscountPercent(val);
                        }
                      }}
                      className="w-7 text-right text-sm font-bold text-[#73768c] bg-transparent outline-none focus:text-black transition-colors [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                      style={{ fontFamily: 'Work Sans, sans-serif' }}
                      placeholder="0"
                    />
                    <span className="text-sm font-bold text-[#73768c] ml-0.5" style={{ fontFamily: 'Work Sans, sans-serif' }}>%</span>
                  </div>

                  <div className="text-base text-black font-medium" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                    <span className="text-sm text-black font-semibold" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{discountAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="text-xl font-bold text-black" style={{ fontFamily: 'Raleway, sans-serif' }}>Payable Amount:</span>
                <span className="text-2xl font-bold text-black" style={{ fontFamily: 'Raleway, sans-serif' }}>P{payableAmount.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3.5 bg-[#2aa564] hover:bg-[#218b52] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-[10px] flex items-center justify-center gap-2 transition-colors shrink-0 active:scale-[0.98]"
            >
               <span className="text-lg md:text-xl font-bold text-[#f5f5f5]" style={{ fontFamily: 'Raleway, sans-serif' }}>
                 Proceed to Checkout
               </span>
               <svg width="24" height="24" viewBox="0 0 24 24" className="fill-[#f5f5f5]">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.71 15.71C13.61 15.8 13.48 15.85 13.35 15.85C13.22 15.85 13.09 15.8 13 15.71C12.8 15.51 12.8 15.2 13 15L15.29 12.71L8.35 12.71C8.07 12.71 7.85 12.49 7.85 12.21C7.85 11.93 8.07 11.71 8.35 11.71L15.29 11.71L13 9.42C12.8 9.22 12.8 8.91 13 8.71C13.2 8.51 13.51 8.51 13.71 8.71L16.65 11.65C16.85 11.85 16.85 12.16 16.65 12.36L13.71 15.71Z" />
               </svg>
            </button>
          </div>
        </aside>

      </div>

      {/* --- WHICH VARIATION MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative flex flex-col max-h-[85vh]">
            
            <button 
              onClick={() => {
                setSelectedProduct(null);
                setVariationQuantities({});
              }}
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

            <div className="w-full overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-[150px] pr-2">
              <table className="w-full text-center border-collapse min-w-[500px]">
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
                      // NEW: Calculate how many are left after what's in the cart
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
                            <div className={`flex items-center bg-[#f9f9f9] border rounded-lg w-[85px] h-[32px] mx-auto overflow-hidden ${availableStock === 0 ? 'border-gray-300 opacity-50' : 'border-[#73768c]'}`}>
                              <button 
                                onClick={() => updateVariationQty(stockItem.id, -1, availableStock)}
                                disabled={availableStock === 0 || (variationQuantities[stockItem.id] || 0) <= 0}
                                className="w-[26px] h-full flex items-center justify-center hover:bg-gray-200 transition-colors border-r border-inherit disabled:cursor-not-allowed"
                              >
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M2 6h8" strokeWidth="2" strokeLinecap="round"/></svg>
                              </button>
                              <span className="flex-1 text-center font-semibold text-sm text-[#242323] pt-0.5" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                                {variationQuantities[stockItem.id] || 0}
                              </span>
                              <button 
                                onClick={() => updateVariationQty(stockItem.id, 1, availableStock)}
                                disabled={(variationQuantities[stockItem.id] || 0) >= availableStock}
                                className="w-[26px] h-full flex items-center justify-center hover:bg-gray-200 transition-colors border-l border-inherit disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={() => {
                  setSelectedProduct(null);
                  setVariationQuantities({});
                }}
                className="px-6 py-2 rounded-lg bg-[#b13e3e] hover:bg-red-800 text-[#e9e9e9] text-sm font-bold transition-all shadow-sm active:scale-95"
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                Cancel Sale
              </button>
              <button 
                onClick={handleRecordSale}
                disabled={!selectedProduct.stock || selectedProduct.stock.length === 0 || Object.values(variationQuantities).every(qty => qty === 0)}
                className="px-6 py-2 rounded-lg bg-[#033860] hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-[#e9e9e9] text-sm font-bold transition-all shadow-sm active:scale-95"
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                Record Sale
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- CHECKOUT SUMMARY MODAL --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[25px] shadow-xl w-full max-w-3xl p-6 md:p-8 relative flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => { setIsCheckoutOpen(false); setTenderedAmount(""); }}
              className="absolute top-5 right-5 text-[#73768c] hover:text-black transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.757 17.24L17 7m-10.243 0L17 17.24" />
              </svg>
            </button>

            <div className="mb-4 pr-10">
              <h2 className="text-[20px] text-black tracking-wide opacity-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 200 }}>
                {/* Spacing structure */}
              </h2>
            </div>

            <div className="w-full border-t-2 border-[#bab6b6] mb-2 shrink-0 -mt-6"></div>

            {/* Cart Items Table */}
            <div className="w-full overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-[150px] mb-4 pr-2">
              <table className="w-full text-center border-collapse min-w-[650px]">
                <thead>
                  <tr>
                    <th className="pb-4 pt-2 font-normal text-[#ada7a7] text-[18px] text-left pl-4" style={{ fontFamily: 'Raleway, sans-serif' }}>Item</th>
                    <th className="pb-4 pt-2 font-normal text-[#ada7a7] text-[18px]" style={{ fontFamily: 'Raleway, sans-serif' }}>Price Individual</th>
                    <th className="pb-4 pt-2 font-normal text-[#ada7a7] text-[18px]" style={{ fontFamily: 'Raleway, sans-serif' }}>Amount</th>
                    <th className="pb-4 pt-2 font-normal text-[#ada7a7] text-[18px] text-right pr-4" style={{ fontFamily: 'Raleway, sans-serif' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: 'Raleway, sans-serif' }}>
                  {cart.map((item) => (
                    <tr key={item.productId} className="border-b border-[#efeded]">
                      <td className="py-3 text-left pl-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border border-[#b4b4b4] bg-[#b4b4b4] shrink-0 flex items-center justify-center overflow-hidden">
                             <span className="text-[10px] text-white">Img</span>
                          </div>
                          <span className="font-bold text-[#223843] text-[18px] truncate max-w-[200px]">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-[#223843] text-[18px] font-normal">P{Number(item.price).toFixed(2)}</td>
                      <td className="py-3 text-[#223843] text-[18px] font-normal">{item.totalQuantity}</td>
                      <td className="py-3 text-[#223843] text-[18px] font-normal text-right pr-4">P{(Number(item.price) * item.totalQuantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="w-full border-t-2 border-[#bab6b6] mb-6 shrink-0"></div>

            {/* Payment Summary */}
            <div className="flex flex-col md:flex-row justify-between gap-8 shrink-0 px-2 md:px-4">
              
              {/* Left side math */}
              <div className="flex flex-col gap-3 w-full md:w-1/2">
                <div className="flex items-center">
                  <span className="w-[150px] md:w-[170px] text-[18px] text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>Subtotal:</span>
                  <span className="text-[18px] text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-[150px] md:w-[170px] text-[18px] text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                    Discount: <span className="ml-2 text-black">{currentDiscount || 0}%</span>
                  </span>
                  <span className="text-[18px] text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="w-[150px] md:w-[170px] text-[24px] font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>Total Price:</span>
                  <span className="text-[24px] font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{payableAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Right side tender */}
              <div className="flex flex-col gap-4 w-full md:w-[310px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[18px] text-[#bab6b6]" style={{ fontFamily: 'Work Sans, sans-serif' }}>Tendered Amount:</span>
                  <div className="relative w-full h-[52px] bg-[#f9f9f9] border border-[#73768c] rounded-[10px] flex items-center px-4 overflow-hidden focus-within:border-[#033860] focus-within:ring-1 focus-within:ring-[#033860] transition-all">
                    <span className="text-[18px] text-[#223843]" style={{ fontFamily: 'Work Sans, sans-serif' }}>P</span>
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
                      className="w-full bg-transparent text-[18px] text-[#223843] ml-1 outline-none font-normal"
                      style={{ fontFamily: 'Work Sans, sans-serif' }}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>Change:</span>
                  <span className="text-[18px] font-bold text-black" style={{ fontFamily: 'Work Sans, sans-serif' }}>P{change < 0 ? "0.00" : change.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 shrink-0">
              <button 
                onClick={() => { setIsCheckoutOpen(false); setTenderedAmount(""); }}
                className="w-[139px] h-[51px] rounded-[8px] bg-[#b13e3e] hover:bg-red-800 text-[#e9e9e9] text-[18px] font-bold tracking-[0.2px] transition-all shadow-sm active:scale-95"
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                Cancel Sale
              </button>
              <button 
                onClick={handleFinalizeCheckout}
                disabled={typeof tenderedAmount !== "number" || tenderedAmount < payableAmount}
                className="w-[139px] h-[51px] rounded-[8px] bg-[#033860] hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-[#e9e9e9] text-[18px] font-bold tracking-[0.2px] transition-all shadow-sm active:scale-95"
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                Record Sale
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default POSPage;