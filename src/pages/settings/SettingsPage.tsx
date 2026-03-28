import { useState } from "react";
import SettingsSidebar from "../../components/SettingsSideBar";
import ShopDetails from "./ShopDetails";
import OrganizationManagement from "./OrganizationManagement";
import InventoryConfiguration from "./InventoryConfiguration";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("shop-details");

  return (
    <div className="flex flex-col min-h-screen bg-[#e9e9e9] font-['Work_Sans'] text-[#223843]">
      
      {/* 1. Top Dark Blue Header (Now spans 100% of the screen width) */}
      <div className="w-full h-13 bg-[#002f5a] shrink-0 z-10 shadow-sm"></div>

      {/* 2. Main Layout Area (Sidebar + Content Side-by-Side) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-250">
            {activeTab === "shop-details" && <ShopDetails />}
            {activeTab === "org-management" && <OrganizationManagement />}
            {activeTab === "inventory-config" && <InventoryConfiguration />}
          </div>
        </div>
        
      </div>
    </div>
  );
}