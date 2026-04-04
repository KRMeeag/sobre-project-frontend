interface POSCategoriesProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function POSCategories({ categories, activeCategory, setActiveCategory }: POSCategoriesProps) {
  return (
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
                ${activeCategory === category ? "bg-[#087ca7]/10 border-[#087ca7] text-[#087ca7]" : "text-gray-600 hover:bg-gray-50 border-transparent"}`}
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <span className="truncate px-1">{category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}