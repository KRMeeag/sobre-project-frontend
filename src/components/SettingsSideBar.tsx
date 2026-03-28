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
    // THE FIX: Changed 'h-full' to 'min-h-[calc(100vh-52px)]'
    <div className="w-[18vw] min-w-60 max-w-[320px] bg-white border-r border-gray-300 min-h-[calc(100vh-52px)] flex flex-col font-['Work_Sans'] shrink-0">
    
      {/* Header */}
      <div className="py-8 px-6">
        <h2 className="text-[26px] font-bold text-[#1e3445]">Settings</h2>
      </div>
      
      {/* Navigation List */}
      <nav className="w-full flex flex-col border-t border-gray-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 text-left border-b border-gray-300 transition-colors ${
                isActive 
                  ? "bg-gray-50 text-[#1e3445] font-medium" 
                  : "bg-white text-[#4a5c6a] hover:bg-gray-50 hover:text-[#1e3445]"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0 text-[#35435a]" strokeWidth={1.5} />
              <span className="text-[14px] leading-snug whitespace-pre-line text-[#35435a]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}