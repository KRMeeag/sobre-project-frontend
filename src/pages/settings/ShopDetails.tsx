import { useState, useEffect } from "react";
import axios from "axios";
import { DocumentCheckIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../lib/supabase"; // Import Supabase to get the real user

const API_URL = import.meta.env.VITE_API_URL;

export default function ShopDetails() {
  // 1. State for the original data (to compare against)
  const [initialData, setInitialData] = useState({
    store_name: "",
    building: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
  });

  // 2. State for the current form inputs
  const [formData, setFormData] = useState({ ...initialData });
  const [storeId, setStoreId] = useState<string | null>(null); // Track the store's primary key
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 3. Fetch Data on Mount
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        // Fetch the real, logged-in user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.warn("No authenticated user found.");
          setLoading(false);
          return;
        }

        // Fetch the store data using the new backend endpoint
        const res = await axios.get(`${API_URL}/store/user/${user.id}`);
        const store = res.data; 
        
        if (store) {
          setStoreId(store.id); // Save the actual store ID for when we need to update
          const fetchedData = {
            store_name: store.store_name || "",
            building: store.building || "",
            street: store.street || "",
            barangay: store.barangay || "",
            city: store.city || "",
            province: store.province || "",
          };
          setInitialData(fetchedData);
          setFormData(fetchedData);
        }
      } catch (err: any) {
        // Suppress the 404 if it's just a test account without a store linked yet
        if (err.response?.status !== 404) {
          console.error("Failed to load store details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, []);

  // 4. Logic to check if any text has changed
  const hasChanged = JSON.stringify(initialData) !== JSON.stringify(formData);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Only proceed if changes exist and we have a valid store ID
    if (!hasChanged || !storeId) return;
    setSaving(true);
    
    try {
      // Update the specific store directly using its ID
      await axios.put(`${API_URL}/store/${storeId}`, formData);
      
      // Update the initial data to match the newly saved data (grays out the button again)
      setInitialData(formData);
    } catch (err) {
      console.error("Failed to save store details:", err);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-500 font-['Work_Sans'] p-10">Loading store data...</div>;
  }

  return (
    // Design matching is applied within this component's container
    <div className="w-full animate-in fade-in duration-300">
      
      {/* This white card matches the appearance in image_1.png 
        and is centered by the parent SettingsPage.tsx layout.
      */}
      <div className="bg-white rounded-xl shadow-sm p-10 max-w-212.5 mx-auto">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <h1 className="text-[32px] font-bold font-['Arvo'] text-slate-800">
            Shop Details
          </h1>
          
          {/* Dynamic Save Button - Styling and logic matching is applied */}
          <button 
            onClick={handleSave}
            disabled={!hasChanged || saving || !storeId}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all shadow-sm focus:outline-none ${
              hasChanged && storeId
                ? "bg-[#002f5a] hover:bg-[#001f3f] text-white cursor-pointer" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <DocumentCheckIcon className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Warning if no store is linked */}
        {!storeId && !loading && (
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded text-sm">
            No store profile found for this user. Please ensure your account is properly linked to a store.
          </div>
        )}

        {/* Form Section */}
        <div className="max-w-175">
          <h3 className="text-[18px] font-bold text-gray-500 mb-8 font-['Work_Sans']">
            Location
          </h3>

          <div className="flex flex-col gap-6">
            <InputField 
              label="Store Name" 
              placeholder="Generic Store Name" 
              value={formData.store_name}
              onChange={(val) => handleChange("store_name", val)}
            />
            <InputField 
              label="Building" 
              placeholder="Building / Floor / Unit" 
              value={formData.building}
              onChange={(val) => handleChange("building", val)}
            />
            <InputField 
              label="Street" 
              placeholder="Standard Street" 
              value={formData.street}
              onChange={(val) => handleChange("street", val)}
            />
            <InputField 
              label="Barangay" 
              placeholder="De La Cruz" 
              value={formData.barangay}
              onChange={(val) => handleChange("barangay", val)}
            />
            <InputField 
              label="City" 
              placeholder="Manila" 
              value={formData.city}
              onChange={(val) => handleChange("city", val)}
            />
            <InputField 
              label="Province" 
              placeholder="NCR" 
              value={formData.province}
              onChange={(val) => handleChange("province", val)}
            />
          </div>
        </div>

      </div> {/* End white card */}

    </div>
  );
}

// Updated Input component to handle real-time value changes and match design
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function InputField({ label, placeholder, value, onChange }: InputFieldProps) {
  return (
    <div className="flex items-center">
      <label className="w-45 text-[15px] font-medium text-gray-600 shrink-0 font-['Work_Sans']">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow font-['Work_Sans']"
      />
    </div>
  );
}