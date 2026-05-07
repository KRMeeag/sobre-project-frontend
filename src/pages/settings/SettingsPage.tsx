import { useState } from "react";
import SettingsSidebar from "../../components/SettingsSideBar";
import ShopDetails from "./ShopDetails";
import OrganizationManagement from "./OrganizationManagement";
import InventoryConfiguration from "./InventoryConfiguration";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("shop-details");

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
      <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>

      {/* RESPONSIVE FIX: Added flex-col for mobile, lg:flex-row for desktop */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* RESPONSIVE FIX: Adjusted padding for mobile (p-4) and added overflow-x-hidden */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-scroll overflow-x-hidden bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          
          {/* BUG FIX: Changed `max-w-250` to `w-full`. 
            This allows all settings components to stretch and match the behavior of Sales/History pages. 
          */}
          <div className="w-full">
            {activeTab === "shop-details" && <ShopDetails />}
            {activeTab === "org-management" && <OrganizationManagement />}
            {activeTab === "inventory-config" && <InventoryConfiguration />}
          </div>

        </main>
      </div>
    </div>
  );
}