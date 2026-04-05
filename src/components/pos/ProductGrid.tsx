import type { Product } from "../../pages/POSPage";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  getTotalAvailableStock: (product: Product) => number;
  onProductClick: (product: Product) => void;
}

export default function ProductGrid({ products, isLoading, getTotalAvailableStock, onProductClick }: ProductGridProps) {
  if (!isLoading && products.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-bold">
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-6">
      {products.map((product) => {
        const availableTotal = getTotalAvailableStock(product);
        const isOutOfStock = availableTotal <= 0;
        
        // NEW: Check if the product has an active discount
        const hasDiscount = Boolean(product.discount && product.discount > 0);

        return (
          <button
            key={product.id}
            onClick={() => !isOutOfStock && onProductClick(product)}
            disabled={isOutOfStock}
            className={`bg-white rounded-[15px] shadow-sm border border-gray-100 flex flex-col items-center p-3 transition-all shrink-0 group 
              ${isOutOfStock ? "opacity-40 cursor-not-allowed grayscale" : "hover:shadow-md hover:border-[#087ca7]/30 hover:-translate-y-0.5"}`}
          >
            <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 border border-gray-200 rounded-full mb-2 flex items-center justify-center overflow-hidden shrink-0 transition-colors ${!isOutOfStock && "group-hover:border-[#087ca7]/50"}`}>
              <span className="text-gray-400 text-[10px] font-medium">Img</span>
            </div>
            
            <h3 className="text-xs md:text-sm font-bold text-gray-800 text-center leading-snug mb-1 line-clamp-2" style={{ fontFamily: "Raleway, sans-serif" }}>
              {product.name}
            </h3>

            {/* NEW: The Blue Discount Badge */}
            {hasDiscount && (
              <span className="bg-[#e0f2fe] text-[#033860] text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1" style={{ fontFamily: "Work Sans, sans-serif" }}>
                {product.discount}% OFF
              </span>
            )}

            <p className={`text-sm md:text-base font-bold mt-auto ${isOutOfStock ? "text-red-500" : "text-[#087ca7]"}`} style={{ fontFamily: "Work Sans, sans-serif" }}>
              {isOutOfStock ? "Out of Stock" : `P${Number(product.price).toFixed(2)}`}
            </p>
          </button>
        );
      })}
    </div>
  );
}