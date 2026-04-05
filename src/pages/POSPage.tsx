import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";

import VariationModal from "../components/VariationModal";
import CheckoutModal from "../components/CheckoutModal";
import POSHeader from "../components/pos/POSHeader";
import POSCategories from "../components/pos/POSCategories";
import ProductGrid from "../components/pos/ProductGrid";
import CartPanel from "../components/pos/CartPanel";

const API_URL = import.meta.env.VITE_API_URL;

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
  discount: number;
  stock: StockItem[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discount: number;
  totalQuantity: number;
  variations: { stockId: string; variationCode: string; quantity: number }[];
}

const POSPage = () => {
  const [userName, setUserName] = useState("Loading...");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAuthUserId(user.id);
          const res = await axios.get(`${API_URL}/users/${user.id}`);
          setUserName(res.data?.username || "User");
          setStoreId(res.data?.store_id || null);
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
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory/categories`, {
          params: { store_id: storeId }
        });
        const mappedCategories = response.data.map((c: any) => c.category);
        setCategories(["All", ...mappedCategories]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;

    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: "50", store_id: storeId });
        if (activeCategory !== "All") params.append("category", activeCategory);
        if (searchQuery.trim() !== "") params.append("search", searchQuery.trim());

        const response = await fetch(`${API_URL}/inventory?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        setProducts(result && Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => { fetchInventory(); }, 300);
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
    return product.stock.reduce((total, s) => total + Math.max(0, s.amount - getQtyInCart(product.id, s.id)), 0);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    const initialQtys: Record<string, number> = {};
    if (product.stock) {
      product.stock.forEach((stockItem) => { initialQtys[stockItem.id] = 0; });
    }
    setVariationQuantities(initialQtys);
  };

  const updateVariationQty = (stockId: string, delta: number, maxAmount: number) => {
    setVariationQuantities((prev) => {
      const currentQty = prev[stockId] || 0;
      const newQty = Math.max(0, Math.min(currentQty + delta, maxAmount));
      return { ...prev, [stockId]: newQty };
    });
  };

  const handleRecordSale = () => {
    if (!selectedProduct || !selectedProduct.stock) return;

    let addedTotal = 0;
    const addedVariations: { stockId: string; variationCode: string; quantity: number; }[] = [];

    selectedProduct.stock.forEach((stockItem) => {
      const qty = variationQuantities[stockItem.id] || 0;
      if (qty > 0) {
        addedTotal += qty;
        addedVariations.push({ stockId: stockItem.id, variationCode: stockItem.barcode, quantity: qty });
      }
    });

    if (addedTotal === 0) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.productId === selectedProduct.id);

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        const item = updatedCart[existingItemIndex];

        const mergedVariations = [...item.variations];
        addedVariations.forEach((addedVar) => {
          const varIndex = mergedVariations.findIndex((v) => v.stockId === addedVar.stockId);
          if (varIndex >= 0) mergedVariations[varIndex].quantity += addedVar.quantity;
          else mergedVariations.push(addedVar);
        });

        updatedCart[existingItemIndex] = { 
          ...item, 
          totalQuantity: item.totalQuantity + addedTotal, 
          variations: mergedVariations,
          discount: selectedProduct.discount || 0 
        };
        return updatedCart;
      } else {
        return [
          ...prevCart, 
          { 
            productId: selectedProduct.id, 
            name: selectedProduct.name, 
            price: selectedProduct.price, 
            discount: selectedProduct.discount || 0, 
            totalQuantity: addedTotal, 
            variations: addedVariations 
          }
        ];
      }
    });

    setSelectedProduct(null);
    setVariationQuantities({});
  };

  const initiateRemove = (productId: string) => {
    setItemToRemoveId(productId);
    setIsRemoveModalOpen(true);
  };

  const confirmRemove = () => {
    if (itemToRemoveId) {
      setCart((prev) => prev.filter((item) => item.productId !== itemToRemoveId));
    }
    setIsRemoveModalOpen(false);
    setItemToRemoveId(null);
  };

  const handleFinalizeCheckout = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);

    try {
      if (!storeId) {
        alert("Error: No store_id found. Cannot record sale.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        store_id: storeId,
        user_id: authUserId,
        subtotal: subtotal,
        discount: discountAmount,
        total_price: payableAmount,
        amount_tendered: typeof tenderedAmount === "number" ? tenderedAmount : 0,
        change: change,
        cart: cart.map(item => ({
          ...item,
          price: item.price - (item.price * ((item.discount || 0) / 100))
        })),
      };

      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to record sale in backend");

      const result = await response.json();
      const totalItems = cart.reduce((sum, item) => sum + item.totalQuantity, 0);
      
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

      alert(`Sale Recorded Successfully! Invoice No: ${result.receipt.invoice_no}`);

      setCart([]);
      setIsCheckoutOpen(false);
      setTenderedAmount("");
      setDiscountPercent(0);
      window.location.reload();
      
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to record sale. Check console for details.");
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // FIXED MATH: Separating Subtotal and Discount
  // ==========================================
  
  // 1. Subtotal is the GROSS original price
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.totalQuantity), 0);
  
  // 2. Sum up all savings strictly from item-level discounts
  const itemDiscountsTotal = cart.reduce((sum, item) => {
    return sum + ((Number(item.price) * ((item.discount || 0) / 100)) * item.totalQuantity);
  }, 0);

  const currentDiscount = typeof discountPercent === "number" ? discountPercent : 0;
  
  // 3. Any extra global discount is calculated on the remaining balance
  const globalDiscountAmount = (subtotal - itemDiscountsTotal) * (currentDiscount / 100);
  
  // 4. The grand total discount to display is BOTH combined!
  const discountAmount = itemDiscountsTotal + globalDiscountAmount;
  
  const payableAmount = subtotal - discountAmount;
  const change = typeof tenderedAmount === "number" ? tenderedAmount - payableAmount : 0;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden text-gray-800">
      <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>

      <div className="flex flex-1 overflow-hidden min-w-0 w-full">
        <div className="flex-1 flex flex-col h-full px-4 pt-4 md:px-6 md:pt-5 min-w-0 max-w-full">
          
          <POSHeader userName={userName} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isLoading={isLoading} />
          <POSCategories categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

          <main className="flex-1 overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            <ProductGrid products={products} isLoading={isLoading} getTotalAvailableStock={getTotalAvailableStock} onProductClick={handleProductClick} />
          </main>
        </div>

        <CartPanel
          cart={cart}
          subtotal={subtotal}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          discountAmount={discountAmount}
          payableAmount={payableAmount}
          onInitiateRemove={initiateRemove}
          onProceedCheckout={() => setIsCheckoutOpen(true)}
        />
      </div>

      <VariationModal
        isOpen={!!selectedProduct}
        selectedProduct={selectedProduct}
        variationQuantities={variationQuantities}
        getQtyInCart={getQtyInCart}
        updateVariationQty={updateVariationQty}
        onClose={() => { setSelectedProduct(null); setVariationQuantities({}); }}
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
        isSubmitting={isSubmitting}
      />

      {isRemoveModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative flex flex-col items-center text-center">
            <h2 className="text-lg font-bold text-[#223843] mb-6" style={{ fontFamily: "Raleway, sans-serif" }}>Are you sure you want to remove this item?</h2>
            <div className="flex gap-3 w-full">
              <button onClick={() => { setIsRemoveModalOpen(false); setItemToRemoveId(null); }} className="flex-1 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={confirmRemove} className="flex-1 py-2.5 rounded-lg bg-[#cb4a4a] hover:bg-red-800 text-white font-bold transition-colors shadow-sm">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;