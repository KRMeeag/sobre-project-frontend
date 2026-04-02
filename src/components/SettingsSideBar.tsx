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
  const navItems = [
    { id: "shop-details", label: "Shop Details", icon: ShoppingBagIcon },
    { id: "org-management", label: "Organization\nManagement", icon: UserGroupIcon },
    { id: "inventory-config", label: "Inventory Threshold\nConfiguration", icon: ArchiveBoxIcon },
  ];

  return (
    <div className="w-[18vw] min-w-60 max-w-[320px] bg-white border-r border-gray-200 h-full flex flex-col font-['Work_Sans'] shrink-0 shadow-sm z-10">
    
      <div className="py-8 px-6">
        <h2 className="text-3xl font-bold text-[#004385] font-['Raleway']">Settings</h2>
      </div>
      
      <nav className="w-full flex flex-col border-t border-gray-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 text-left border-b border-gray-100 transition-colors ${
                isActive 
                  ? "bg-[#f4f7f9] text-[#004385] font-bold border-l-4 border-l-[#004385]" 
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-medium border-l-4 border-l-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#004385]" : "text-gray-500"}`} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[14px] leading-snug whitespace-pre-line">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}