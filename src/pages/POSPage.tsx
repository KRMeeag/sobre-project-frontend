import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;
import { supabase } from "../lib/supabase";
import axios from "axios";
import VariationModal from "../components/VariationModal";
import CheckoutModal from "../components/CheckoutModal";

export interface StockItem {
  id: string;
  barcode: string;
  restock_date: string;
  amount: number;
  expiry_date: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: StockItem[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  totalQuantity: number;
  variations: { stockId: string; variationCode: string; quantity: number }[];
}

const POSPage = () => {
  const [userName, setUserName] = useState("Loading...");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number | "">(0);
  const [variationQuantities, setVariationQuantities] = useState<
    Record<string, number>
  >({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [tenderedAmount, setTenderedAmount] = useState<number | "">("");

  // --- NEW: Remove Confirmation States ---
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<string | null>(null);

  const categories = [
    "All",
    "Snacks",
    "Frozen",
    "Canned",
    "Drinks",
    "Household",
    "Personal Care",
    "Restricted",
    "Electronics",
    "Apparel",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setAuthUserId(user.id);
          const res = await axios.get(`${API_URL}/users/${user.id}`);
          if (res.data?.username) {
            setUserName(res.data.username);
          } else {
            setUserName("User");
          }

          if (res.data?.store_id) {
            setStoreId(res.data.store_id);
          }
        } else {
          setUserName("Guest");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUserName("User");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!storeId) return;

    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: "50", store_id: storeId });
        if (activeCategory !== "All") params.append("category", activeCategory);
        if (searchQuery.trim() !== "")
          params.append("search", searchQuery.trim());

        const response = await fetch(
          `${API_URL}/inventory?${params.toString()}`,
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        if (result && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
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
  }, [activeCategory, searchQuery, storeId]);

  const getQtyInCart = (productId: string, stockId: string) => {
    const cartItem = cart.find((item) => item.productId === productId);
    if (!cartItem) return 0;
    const variation = cartItem.variations.find((v) => v.stockId === stockId);
    return variation ? variation.quantity : 0;
  };

  const getTotalAvailableStock = (product: Product) => {
    if (!product.stock) return 0;
    return product.stock.reduce((total, s) => {
      return total + Math.max(0, s.amount - getQtyInCart(product.id, s.id));
    }, 0);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    const initialQtys: Record<string, number> = {};
    if (product.stock && product.stock.length > 0) {
      product.stock.forEach((stockItem) => {
        initialQtys[stockItem.id] = 0;
      });
    }
    setVariationQuantities(initialQtys);
  };

  const updateVariationQty = (
    stockId: string,
    delta: number,
    maxAmount: number,
  ) => {
    setVariationQuantities((prev) => {
      const currentQty = prev[stockId] || 0;
      const newQty = Math.max(0, Math.min(currentQty + delta, maxAmount));
      return { ...prev, [stockId]: newQty };
    });
  };

  const handleRecordSale = () => {
    if (!selectedProduct || !selectedProduct.stock) return;

    let addedTotal = 0;
    const addedVariations: {
      stockId: string;
      variationCode: string;
      quantity: number;
    }[] = [];

    selectedProduct.stock.forEach((stockItem) => {
      const qty = variationQuantities[stockItem.id] || 0;
      if (qty > 0) {
        addedTotal += qty;
        addedVariations.push({
          stockId: stockItem.id,
          variationCode: stockItem.barcode,
          quantity: qty,
        });
      }
    });

    if (addedTotal === 0) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === selectedProduct.id,
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        const item = updatedCart[existingItemIndex];

        const mergedVariations = [...item.variations];
        addedVariations.forEach((addedVar) => {
          const varIndex = mergedVariations.findIndex(
            (v) => v.stockId === addedVar.stockId,
          );
          if (varIndex >= 0)
            mergedVariations[varIndex].quantity += addedVar.quantity;
          else mergedVariations.push(addedVar);
        });

        updatedCart[existingItemIndex] = {
          ...item,
          totalQuantity: item.totalQuantity + addedTotal,
          variations: mergedVariations,
        };
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            totalQuantity: addedTotal,
            variations: addedVariations,
          },
        ];
      }
    });

    setSelectedProduct(null);
    setVariationQuantities({});
  };

  // --- NEW: Confirmation Removal Handlers ---
  const initiateRemove = (productId: string) => {
    setItemToRemoveId(productId);
    setIsRemoveModalOpen(true);
  };

  const confirmRemove = () => {
    if (itemToRemoveId) {
      setCart((prev) =>
        prev.filter((item) => item.productId !== itemToRemoveId),
      );
    }
    setIsRemoveModalOpen(false);
    setItemToRemoveId(null);
  };

  const cancelRemove = () => {
    setIsRemoveModalOpen(false);
    setItemToRemoveId(null);
  };

  const handleFinalizeCheckout = async () => {
    try {
      if (!storeId) {
        alert("Error: No store_id found. Cannot record sale.");
        return;
      }

      const payload = {
        store_id: storeId,
        user_id: authUserId,
        subtotal: subtotal,
        discount: discountAmount,
        total_price: payableAmount,
        amount_tendered:
          typeof tenderedAmount === "number" ? tenderedAmount : 0,
        change: change,
        cart: cart,
      };

      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to record sale in backend");

      const result = await response.json();

      const totalItems = cart.reduce(
        (sum, item) => sum + item.totalQuantity,
        0,
      );
      try {
        await axios.post(`${API_URL}/audit`, {
          users_id: authUserId,
          store_id: storeId,
          receipt_id: result.receipt.id,
          area: "Sales",
          action: "Adding",
          item: "Sales Record",
          summary: `${totalItems} items checked out`,
        });
      } catch (auditErr) {
        console.error("Failed to log audit", auditErr);
      }

      alert(
        `Sale Recorded Successfully! Invoice No: ${result.receipt.invoice_no}`,
      );

      setCart([]);
      setIsCheckoutOpen(false);
      setTenderedAmount("");
      setDiscountPercent(0);

      window.location.reload();
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to record sale. Check console for details.");
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.totalQuantity,
    0,
  );
  const currentDiscount =
    typeof discountPercent === "number" ? discountPercent : 0;
  const discountAmount = subtotal * (currentDiscount / 100);
  const payableAmount = subtotal - discountAmount;
  const change =
    typeof tenderedAmount === "number" ? tenderedAmount - payableAmount : 0;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden text-gray-800">
      <div className="h-3 md:h-4 w-full bg-[#033860] shadow-sm z-40 shrink-0"></div>

      <div className="flex flex-1 overflow-hidden min-w-0 w-full">
        <div className="flex-1 flex flex-col h-full px-4 pt-4 md:px-6 md:pt-5 min-w-0 max-w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 shrink-0 w-full">
            <h1
              className="text-xl md:text-2xl font-bold text-[#223843] tracking-tight truncate capitalize"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Hello, {userName}
            </h1>

            <div className="relative w-full md:max-w-xs lg:max-w-sm h-10 flex items-center bg-white border border-gray-300 rounded-lg px-3 shrink-0 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-[#087ca7] focus-within:border-transparent">
              <input
                type="text"
                placeholder="Search for Items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-gray-700 focus:outline-none bg-transparent"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              />
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#087ca7] animate-spin ml-2 shrink-0"></div>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400 ml-2 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              )}
            </div>
          </div>

          <div className="w-full max-w-full shrink-0 mb-4 relative group/scroll">
            <div className="bg-white rounded-[15px] shadow-sm border border-gray-100 p-2 w-full max-w-full">
              <div
                className="flex flex-nowrap gap-2 overflow-x-auto touch-pan-x snap-x snap-mandatory pb-1 
                [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent 
                group-hover/scroll:[&::-webkit-scrollbar-thumb]:bg-[#b4b4b4] hover:[&::-webkit-scrollbar-thumb]:!bg-[#73768c] 
                [&::-webkit-scrollbar-thumb]:rounded-full transition-all duration-300"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    title={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-[calc((100%-3rem)/7)] flex-none px-1 py-1.5 flex items-center justify-center text-xs md:text-sm font-bold transition-all rounded-lg border-2 snap-start
                      ${activeCategory === category ? "bg-[#087ca7]/10 border-[#087ca7] text-[#087ca7]" : "text-gray-600 hover:bg-gray-50 border-transparent"}`}
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <span className="truncate px-1">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto pb-6 pr-2 custom-scrollbar [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {!isLoading && products.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-bold">
                <p>No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product) => {
                  const availableTotal = getTotalAvailableStock(product);
                  const isOutOfStock = availableTotal <= 0;

                  return (
                    <button
                      key={product.id}
                      onClick={() =>
                        !isOutOfStock && handleProductClick(product)
                      }
                      disabled={isOutOfStock}
                      className={`bg-white rounded-[15px] shadow-sm border border-gray-100 flex flex-col items-center p-3 transition-all shrink-0 group 
                        ${isOutOfStock ? "opacity-40 cursor-not-allowed grayscale" : "hover:shadow-md hover:border-[#087ca7]/30 hover:-translate-y-0.5"}`}
                    >
                      <div
                        className={`w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 border border-gray-200 rounded-full mb-2 flex items-center justify-center overflow-hidden shrink-0 transition-colors ${!isOutOfStock && "group-hover:border-[#087ca7]/50"}`}
                      >
                        <span className="text-gray-400 text-[10px] font-medium">
                          Img
                        </span>
                      </div>
                      <h3
                        className="text-xs md:text-sm font-bold text-gray-800 text-center leading-snug mb-1 line-clamp-2"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        {product.name}
                      </h3>
                      <p
                        className={`text-sm md:text-base font-bold mt-auto ${isOutOfStock ? "text-red-500" : "text-[#087ca7]"}`}
                        style={{ fontFamily: "Work Sans, sans-serif" }}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : `P${Number(product.price).toFixed(2)}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        <aside className="w-[300px] lg:w-[350px] xl:w-[380px] h-full bg-white border-l border-[#b4b4b4] shadow-[-4px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-30 shrink-0">
          <div className="p-5 border-b border-gray-200 shrink-0">
            <h2
              className="text-xl md:text-2xl font-bold text-black"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Shopping Cart
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto relative flex flex-col bg-slate-50/50 custom-scrollbar [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 px-4">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-50 pb-10">
                <svg
                  className="w-20 h-20 md:w-24 md:h-24 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                <p
                  className="text-xl font-bold text-[#767676]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  No Items in Cart!
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between bg-[#e9e9e9] rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                      <span
                        className="font-bold text-black text-lg md:text-xl w-6 text-center shrink-0"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        {item.totalQuantity}
                      </span>
                      <div className="flex flex-col ml-1 overflow-hidden">
                        <span
                          className="font-bold text-black text-sm md:text-base leading-tight truncate"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="text-black text-xs md:text-sm mt-0.5"
                          style={{ fontFamily: "Work Sans, sans-serif" }}
                        >
                          P
                          {(Number(item.price) * item.totalQuantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {/* CHANGED: Opens confirmation modal instead of deleting instantly */}
                    <button
                      onClick={() => initiateRemove(item.productId)}
                      className="w-7 h-7 flex items-center justify-center shrink-0 rounded-full hover:bg-red-100 group transition-colors ml-2"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        className="fill-[#fd1d1d] opacity-80 group-hover:opacity-100"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2.25C6.615 2.25 2.25 6.615 2.25 12C2.25 17.385 6.615 21.75 12 21.75C17.385 21.75 21.75 17.385 21.75 12C21.75 6.615 17.385 2.25 12 2.25ZM10.28 9.22C9.988 8.927 9.513 8.927 9.22 9.22C8.927 9.513 8.927 9.988 9.22 10.28L10.94 12L9.22 13.72C8.927 14.013 8.927 14.488 9.22 14.78C9.513 15.073 9.988 15.073 10.28 14.78L12 13.06L13.72 14.78C14.013 15.073 14.488 15.073 14.78 14.78C15.073 14.488 15.073 14.013 14.78 13.72L13.06 12L14.78 10.28C15.073 9.988 15.073 9.513 14.78 9.22C14.488 8.927 14.013 8.927 13.72 9.22L12 10.94L10.28 9.22Z"
                        />
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
                <span
                  className="text-base text-black font-medium"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  Subtotal:
                </span>
                <span
                  className="text-base text-black font-semibold"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  P{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-base text-black font-medium"
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  Discount:
                </span>
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
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                      placeholder="0"
                    />
                    <span
                      className="text-sm font-bold text-[#73768c] ml-0.5"
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                      %
                    </span>
                  </div>

                  <div
                    className="text-base text-black font-medium"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    <span
                      className="text-sm text-black font-semibold"
                      style={{ fontFamily: "Work Sans, sans-serif" }}
                    >
                      P{discountAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span
                  className="text-xl font-bold text-black"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Payable Amount:
                </span>
                <span
                  className="text-2xl font-bold text-black"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  P{payableAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3.5 bg-[#2aa564] hover:bg-[#218b52] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-[10px] flex items-center justify-center gap-2 transition-colors shrink-0 active:scale-[0.98]"
            >
              <span
                className="text-lg md:text-xl font-bold text-[#f5f5f5]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Proceed to Checkout
              </span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-[#f5f5f5]"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.71 15.71C13.61 15.8 13.48 15.85 13.35 15.85C13.22 15.85 13.09 15.8 13 15.71C12.8 15.51 12.8 15.2 13 15L15.29 12.71L8.35 12.71C8.07 12.71 7.85 12.49 7.85 12.21C7.85 11.93 8.07 11.71 8.35 11.71L15.29 11.71L13 9.42C12.8 9.22 12.8 8.91 13 8.71C13.2 8.51 13.51 8.51 13.71 8.71L16.65 11.65C16.85 11.85 16.85 12.16 16.65 12.36L13.71 15.71Z" />
              </svg>
            </button>
          </div>
        </aside>
      </div>

      <VariationModal
        isOpen={!!selectedProduct}
        selectedProduct={selectedProduct}
        variationQuantities={variationQuantities}
        getQtyInCart={getQtyInCart}
        updateVariationQty={updateVariationQty}
        onClose={() => {
          setSelectedProduct(null);
          setVariationQuantities({});
        }}
        onRecordSale={handleRecordSale}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        subtotal={subtotal}
        currentDiscount={currentDiscount}
        payableAmount={payableAmount}
        tenderedAmount={tenderedAmount}
        setTenderedAmount={setTenderedAmount}
        change={change}
        onFinalizeCheckout={handleFinalizeCheckout}
      />

      {/* --- NEW: REMOVE CONFIRMATION MODAL --- */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative flex flex-col items-center text-center">
            <h2
              className="text-lg font-bold text-[#223843] mb-6"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Are you sure you want to remove this item?
            </h2>
            <div className="flex gap-3 w-full">
              <button
                onClick={cancelRemove}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-2.5 rounded-lg bg-[#cb4a4a] hover:bg-red-800 text-white font-bold transition-colors shadow-sm"
                style={{ fontFamily: "Work Sans, sans-serif" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
