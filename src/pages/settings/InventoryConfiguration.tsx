import { useState, useEffect } from "react";
import axios from "axios";
import { DocumentCheckIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

// Define an interface that allows strings so we can handle empty "" inputs gracefully
interface InventorySettings {
  low_stock_param: number | string;
  expiration_param: number | string;
}

export default function InventoryConfiguration() {
  const [initialData, setInitialData] = useState<InventorySettings>({
    low_stock_param: 0,
    expiration_param: 0,
  });

  const [authUserId, setAuthUserId] = useState<string | null>(null); 
  const [formData, setFormData] = useState<InventorySettings>({ ...initialData });
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.warn("No authenticated user found.");
          setLoading(false);
          return;
        }

        const authUserId = user.id;
        setAuthUserId(user.id);
        const storeRes = await axios.get(`${API_URL}/store/user/${authUserId}`);
        const store = storeRes.data;

        setStoreId(store.id);

        const fetchedData = {
          low_stock_param: store.low_stock_param || 0,
          expiration_param: store.expiration_param || 0,
        };
        
        setInitialData(fetchedData);
        setFormData(fetchedData);
      } catch (err) {
        console.error("Failed to load inventory configurations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchThresholds();
  }, []);

  const hasChanged = JSON.stringify(initialData) !== JSON.stringify(formData);

  const handleSave = async () => {
    if (!hasChanged || !storeId) return;
    setSaving(true);
    
    // Convert strings back to pure numbers before sending to the backend
    const payload = {
      low_stock_param: Number(formData.low_stock_param) || 0,
      expiration_param: Number(formData.expiration_param) || 0,
      auth_user_id: authUserId
    };

    try {
      await axios.put(`${API_URL}/store/${storeId}`, payload);
      setInitialData(payload);
      setFormData(payload);
    } catch (err) {
      console.error("Failed to save inventory configurations:", err);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="animate-pulse text-gray-500 font-['Work_Sans'] p-6 md:p-10 mx-auto max-w-212.5">Loading configurations...</div>;
  }

  return (
    <div className="w-full animate-in fade-in duration-300 font-['Work_Sans']">
      
      {/* RESPONSIVE FIX: Adjusted padding p-6 on mobile, p-10 on desktop */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-10 max-w-212.5 mx-auto">
        
        {/* RESPONSIVE FIX: Flex col on mobile, row on desktop for the header area */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 sm:mb-10 gap-4">
          <h1 className="text-2xl sm:text-[32px] font-bold font-['Raleway'] text-[#1e3445]">
            Inventory Management
          </h1>
          
          {/* RESPONSIVE FIX: w-full on mobile, auto on desktop */}
          <button
            onClick={handleSave}
            disabled={!hasChanged || saving}
            className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg text-[14px] font-medium transition-all shadow-sm focus:outline-none w-full sm:w-auto ${
              hasChanged
                ? "bg-[#002f5a] hover:bg-[#001f3f] text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <DocumentCheckIcon className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Section 1: Stock Level Threshold */}
        <div className="mb-8 sm:mb-10 w-full max-w-150">
          <h3 className="text-base sm:text-[18px] font-bold text-[#4a5c6a] mb-4 sm:mb-8 font-['Work_Sans']">
            Stock Level Related Settings
          </h3>
          
          {/* RESPONSIVE FIX: Stack label and input on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <span className="w-full sm:w-50 text-[14px] sm:text-[15px] font-medium text-[#4a5c6a] shrink-0 font-['Work_Sans']">
              Low Stock Threshold
            </span>
            <div className="flex items-center gap-4 flex-1">
              <input
                type="number"
                min="0"
                value={formData.low_stock_param}
                onChange={(e) => handleChange("low_stock_param", e.target.value)}
                className="w-full sm:w-24 max-w-[120px] bg-transparent border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#4a5c6a] transition-shadow text-center font-['Work_Sans']"
              />
              <span className="text-[14px] text-[#73768c] font-medium">Items</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-8 sm:mb-10" />

        {/* Section 2: Expiration Threshold */}
        <div className="mb-4 w-full max-w-150">
          <h3 className="text-base sm:text-[18px] font-bold text-[#4a5c6a] mb-4 sm:mb-8 font-['Work_Sans']">
            Expiry Date Related Settings
          </h3>
          
          {/* RESPONSIVE FIX: Stack label and input on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <span className="w-full sm:w-50 text-[14px] sm:text-[15px] font-medium text-[#4a5c6a] shrink-0 font-['Work_Sans']">
              Expiration Threshold
            </span>
            <div className="flex items-center gap-4 flex-1">
              <input
                type="number"
                min="0"
                value={formData.expiration_param}
                onChange={(e) => handleChange("expiration_param", e.target.value)}
                className="w-full sm:w-24 max-w-[120px] bg-transparent border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#4a5c6a] transition-shadow text-center font-['Work_Sans']"
              />
              <span className="text-[14px] text-[#73768c] font-medium">Days Before</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}