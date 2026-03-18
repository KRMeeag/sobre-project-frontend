import { ChevronUpIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// --- Sub-Component: Modern Filter Section ---
const FilterSection = ({ 
  title, 
  isOpen, 
  toggle, 
  children, 
  hasSearch = false 
}: { 
  title: string, 
  isOpen: boolean, 
  toggle: () => void, 
  children?: React.ReactNode,
  hasSearch?: boolean
}) => {
  return (
    <div className="border-b border-[#c4bcc0] last:border-0">
      <button 
        onClick={toggle}
        className="w-full flex justify-between items-center py-5 px-6 group hover:bg-black/5 transition-colors"
      >
        <span className="text-[#033860] font-bold uppercase text-xs tracking-wider">
           {title}
        </span>
        {isOpen ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-600" />
        ) : (
            <PlusIcon className="w-4 h-4 text-gray-600 group-hover:text-[#033860]" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-1 duration-200">
          {hasSearch && (
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder={`Find ${title}...`}
                className="w-full pl-9 pr-3 py-2 text-sm border-0 rounded-full bg-white shadow-sm text-[#223843] placeholder-gray-400 focus:ring-2 focus:ring-[#087CA7] focus:outline-none"
              />
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            </div>
          )}
          <div className="space-y-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;