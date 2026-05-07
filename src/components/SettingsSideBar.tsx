import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  ArchiveBoxIcon 
} from "@heroicons/react/24/outline";

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  // FIX: Removed the \n characters and simplified labels to prevent vertical overlapping
  const navItems = [
    { id: "shop-details", label: "Shop Details", icon: ShoppingBagIcon },
    { id: "org-management", label: "Organization Management", icon: UserGroupIcon },
    { id: "inventory-config", label: "Inventory Configuration", icon: ArchiveBoxIcon },
  ];

  return (
    <div className="w-full lg:w-[18vw] lg:min-w-60 lg:max-w-[320px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col font-['Work_Sans'] shrink-0 shadow-sm z-10">
    
      <div className="py-4 px-4 lg:py-8 lg:px-6 shrink-0">
        <h2 className="text-xl lg:text-3xl font-bold text-[#004385] font-['Raleway']">Settings</h2>
      </div>
      
      <nav className="w-full flex flex-row lg:flex-col border-t border-gray-100 overflow-x-auto lg:overflow-x-visible custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              /* FIX: Added whitespace-nowrap and shrink-0 directly to the button so it never wraps or squishes */
              className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 text-center lg:text-left transition-colors whitespace-nowrap shrink-0 border-b-2 lg:border-b-0 lg:border-l-4 ${
                isActive 
                  ? "bg-[#f4f7f9] text-[#004385] font-bold border-[#004385]" 
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-medium border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#004385]" : "text-gray-500"}`} strokeWidth={isActive ? 2 : 1.5} />
              
              <span className="text-[13px] lg:text-[14px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}