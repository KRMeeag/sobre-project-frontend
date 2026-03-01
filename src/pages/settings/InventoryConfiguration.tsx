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
    // FIX: Just store the raw string value as they type. 
    // This stops it from violently snapping back to "0" when they hit backspace.
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="animate-pulse text-gray-500 font-['Work_Sans'] p-10 mx-auto max-w-212.5">Loading configurations...</div>;
  }

  return (
    <div className="w-full animate-in fade-in duration-300 font-['Work_Sans']">
      
      <div className="bg-white rounded-xl shadow-sm p-10 max-w-212.5 mx-auto">
        
        {/* Header & Dynamic Save Button */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <h1 className="text-[32px] font-bold font-['Arvo'] text-[#1e3445]">
            Inventory Management
          </h1>
          
          <button
            onClick={handleSave}
            disabled={!hasChanged || saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all shadow-sm focus:outline-none ${
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
        <div className="mb-10 w-full max-w-150">
          <h3 className="text-[18px] font-bold text-[#4a5c6a] mb-8 font-['Work_Sans']">
            Stock Level Related Settings
          </h3>
          
          <div className="flex items-center">
            <span className="w-50 text-[15px] font-medium text-[#4a5c6a] shrink-0 font-['Work_Sans']">
              Low Stock Threshold
            </span>
            <div className="flex items-center gap-4 flex-1">
              <input
                type="number"
                min="0"
                value={formData.low_stock_param}
                onChange={(e) => handleChange("low_stock_param", e.target.value)}
                className="w-24 bg-transparent border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#4a5c6a] transition-shadow text-center font-['Work_Sans']"
              />
              <span className="text-[14px] text-[#73768c] font-medium">Items</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-10" />

        {/* Section 2: Expiration Threshold */}
        <div className="mb-4 w-full max-w-150">
          <h3 className="text-[18px] font-bold text-[#4a5c6a] mb-8 font-['Work_Sans']">
            Expiry Date Related Settings
          </h3>
          
          <div className="flex items-center">
            <span className="w-50 text-[15px] font-medium text-[#4a5c6a] shrink-0 font-['Work_Sans']">
              Expiration Threshold
            </span>
            <div className="flex items-center gap-4 flex-1">
              <input
                type="number"
                min="0"
                value={formData.expiration_param}
                onChange={(e) => handleChange("expiration_param", e.target.value)}
                className="w-24 bg-transparent border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#4a5c6a] transition-shadow text-center font-['Work_Sans']"
              />
              <span className="text-[14px] text-[#73768c] font-medium">Days Before</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}