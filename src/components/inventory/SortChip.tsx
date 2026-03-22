import { CheckCircleIcon } from "@heroicons/react/24/outline";

const SortChip = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
            isActive 
            ? "bg-[#004385] text-white shadow-md" 
            : "bg-white/50 text-[#223843] hover:bg-white hover:shadow-sm"
        }`}
    >
        {label}
        {isActive && <CheckCircleIcon className="w-4 h-4 text-white" />}
    </button>
);

export default SortChip