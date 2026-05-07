import { useState, useEffect } from "react";
import axios from "axios";
import { DocumentCheckIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../lib/supabase";
import { getAllProvinces, getCities, getBarangays, type LocationNode } from "../../lib/philippines";

const API_URL = import.meta.env.VITE_API_URL;

export default function ShopDetails() {
  const [initialData, setInitialData] = useState({
    store_name: "",
    building: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
  });

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...initialData });
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [barangaysList, setBarangaysList] = useState<LocationNode[]>([]);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.warn("No authenticated user found.");
          setLoading(false);
          return;
        }
        setAuthUserId(user.id); 
        const res = await axios.get(`${API_URL}/store/user/${user.id}`);
        const store = res.data; 
        
        if (store) {
          setStoreId(store.id);
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

          if (store.province && store.city) {
            try {
              const provinces = await getAllProvinces();
              const province = provinces.find(p => p.name.toLowerCase() === store.province.toLowerCase());
              
              if (province) {
                const cities = await getCities(province.code);
                const city = cities.find(c => c.name.toLowerCase() === store.city.toLowerCase());
                
                if (city) {
                  const barangays = await getBarangays(city.code);
                  setBarangaysList(barangays);
                }
              }
            } catch (apiErr) {
              console.error("Failed to load barangays for dropdown:", apiErr);
            }
          }
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error("Failed to load store details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, []);

  const hasChanged = JSON.stringify(initialData) !== JSON.stringify(formData);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!hasChanged || !storeId) return;
    setSaving(true);
    
    try {
      await axios.put(`${API_URL}/store/${storeId}`, {
        ...formData,
        auth_user_id: authUserId 
      });
      
      setInitialData(formData);
    } catch (err) {
      console.error("Failed to save store details:", err);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-500 font-['Work_Sans'] p-6 md:p-10">Loading store data...</div>;
  }

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* RESPONSIVE FIX: Adjusted padding p-6 on mobile, p-10 on desktop */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-10 max-w-212.5 mx-auto">

        {/* RESPONSIVE FIX: Flex col on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 sm:mb-10 gap-4">
          <h1 className="text-2xl sm:text-[32px] font-bold font-['Raleway'] text-slate-800">
            Shop Details
          </h1>
          
          {/* RESPONSIVE FIX: w-full on mobile, auto on desktop */}
          <button 
            onClick={handleSave}
            disabled={!hasChanged || saving || !storeId}
            className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-lg text-[14px] font-medium transition-all shadow-sm focus:outline-none w-full sm:w-auto ${
              hasChanged && storeId
                ? "bg-[#002f5a] hover:bg-[#001f3f] text-white cursor-pointer" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <DocumentCheckIcon className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {!storeId && !loading && (
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded text-sm">
            No store profile found for this user. Please ensure your account is properly linked to a store.
          </div>
        )}

        <div className="w-full max-w-175">
          <h3 className="text-base sm:text-[18px] font-bold text-gray-500 mb-6 sm:mb-8 font-['Work_Sans']">
            Location
          </h3>

          {/* RESPONSIVE FIX: Reduced gap slightly on mobile */}
          <div className="flex flex-col gap-4 sm:gap-6">
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
            
            <SelectField 
              label="Barangay" 
              defaultOption={barangaysList.length > 0 ? "Select Barangay" : "Loading Barangays..."}
              value={formData.barangay}
              onChange={(val) => handleChange("barangay", val)}
              options={barangaysList}
              disabled={barangaysList.length === 0}
            />

            <InputField 
              label="City" 
              placeholder="Manila" 
              value={formData.city}
              onChange={(val) => handleChange("city", val)}
              disabled={true} 
            />
            
            <InputField 
              label="Province" 
              placeholder="NCR" 
              value={formData.province}
              onChange={(val) => handleChange("province", val)}
              disabled={true}
            />
          </div>
        </div>

      </div> 
    </div>
  );
}

// --- HELPER COMPONENTS ---

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean; 
}

function InputField({ label, placeholder, value, onChange, disabled = false }: InputFieldProps) {
  return (
    /* RESPONSIVE FIX: flex-col on mobile so label is on top, flex-row on small-tablet+ */
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 w-full">
      <label className="w-full sm:w-45 text-[13px] sm:text-[15px] font-medium text-gray-600 shrink-0 font-['Work_Sans']">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full sm:flex-1 border rounded-lg px-4 py-2.5 text-[13px] sm:text-[14px] focus:outline-none transition-shadow font-['Work_Sans'] ${
          disabled 
            ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed select-none" 
            : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-gray-400" 
        }`}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: LocationNode[];
  defaultOption: string;
  disabled?: boolean;
}

function SelectField({ label, value, onChange, options, defaultOption, disabled = false }: SelectFieldProps) {
  return (
    /* RESPONSIVE FIX: flex-col on mobile so label is on top, flex-row on small-tablet+ */
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 w-full">
      <label className="w-full sm:w-45 text-[13px] sm:text-[15px] font-medium text-gray-600 shrink-0 font-['Work_Sans']">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full sm:flex-1 border rounded-lg px-4 py-2.5 text-[13px] sm:text-[14px] focus:outline-none transition-shadow font-['Work_Sans'] ${
          disabled 
            ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed select-none" 
            : "bg-white border-gray-300 text-gray-800 focus:ring-1 focus:ring-gray-400 cursor-pointer" 
        }`}
      >
        <option value="" disabled hidden>{defaultOption}</option>
        {options.map((opt) => (
          <option key={opt.code} value={opt.name}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}