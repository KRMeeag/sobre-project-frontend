import { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import FileUploadDropzone from "../general/FileUploadDropzone";
import FormInput from "../general/FormInput";
import ComboboxInput from "../general/ComboboxInput";
import { supabase } from "../../lib/supabase"; // <-- ADDED

const API_URL = import.meta.env.VITE_API_URL;

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (itemName: string) => void;
  storeId: string | null;
  existingCategories: string[];
  existingSuppliers: string[];
}

export default function AddItemModal({ 
  isOpen, onClose, onSuccess, storeId, existingCategories, existingSuppliers 
}: AddItemModalProps) {
  
  const initialFormState = {
    name: "", category: "", cost: "", price: "", supplier: "", photo: "", 
  };

  const [formData, setFormData] = useState(initialFormState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!/^[a-zA-Z0-9\s.,'\-&]*$/.test(value)) return; 
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleFileDrop = (file: File | null) => {
    setIsDirty(true);
    if (!file) {
      setPhotoPreview(null);
      setFormData(prev => ({ ...prev, photo: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      setFormData(prev => ({ ...prev, photo: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) return;
    }
    setFormData(initialFormState);
    setPhotoPreview(null);
    setIsDirty(false);
    setError("");
    onClose();
  };

  // --- Validation & Submit ---
  const isFormValid = 
    formData.name.trim() !== "" && 
    formData.category.trim() !== "" && 
    formData.supplier.trim() !== "" && 
    formData.cost !== "" && 
    formData.price !== "";

  const handleSubmit = async () => {
    if (!storeId) return setError("Critical Error: No Store ID found.");

    const costNum = parseFloat(formData.cost);
    const priceNum = parseFloat(formData.price);

    if (isNaN(costNum) || costNum <= 0 || isNaN(priceNum) || priceNum <= 0) {
      return setError("Cost and Price must be valid numbers greater than 0.");
    }

    if (costNum > priceNum) {
      if (!window.confirm(`Heads up! The Cost (₱${costNum}) is greater than the Selling Price (₱${priceNum}).\n\nAre you sure you want to add this item?`)) return;
    }

    setLoading(true);
    setError("");
    const submittedName = formData.name.trim();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "";

      // Safely passed users_id in the URL to avoid database schema crashes
      await axios.post(`${API_URL}/inventory?users_id=${userId}`, {
        store_id: storeId,
        name: submittedName,
        category: formData.category.trim(),
        cost: costNum,
        price: priceNum,
        supplier: formData.supplier.trim(),
        photo: formData.photo || null,
      });
      
      setFormData(initialFormState);
      setPhotoPreview(null);
      setIsDirty(false);
      onSuccess(submittedName);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to add inventory item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#35435a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto relative animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="px-8 pt-6 pb-4 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#004385] font-['Raleway']">Add New Item</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-[#b13e3e] transition-colors focus:outline-none">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 font-['Work_Sans'] bg-white">
          {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-[#b13e3e] text-sm font-medium rounded-lg">{error}</div>}
          
          <div className="flex flex-col md:flex-row gap-8">
            <FileUploadDropzone 
              onFileDrop={handleFileDrop} 
              previewUrl={photoPreview} 
              iconType="photo"
              title="Upload Photo"
              subtitle="Drag & drop or click"
            />

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <FormInput
                className="col-span-2"
                label="Display Name"
                name="name"
                type="text"
                placeholder="e.g., C2 Red Medium"
                value={formData.name}
                onChange={handleTextChange}
                required
              />

              <ComboboxInput
                label="Category"
                name="category"
                value={formData.category}
                options={existingCategories}
                onChange={handleTextChange}
                onSelect={(val) => {
                  setIsDirty(true);
                  setFormData(prev => ({ ...prev, category: val }));
                }}
                required
              />

              <ComboboxInput
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                options={existingSuppliers}
                onChange={handleTextChange}
                onSelect={(val) => {
                  setIsDirty(true);
                  setFormData(prev => ({ ...prev, supplier: val }));
                }}
                required
              />

              <FormInput
                label="Cost (₱)"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.cost}
                onChange={handleNumChange}
                required
              />

              <FormInput
                label="Selling Price (₱)"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={handleNumChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end shrink-0 bg-gray-50 rounded-b-2xl">
          <button onClick={handleClose} disabled={loading} className="text-gray-500 hover:bg-gray-200 font-medium py-2.5 px-6 rounded-lg transition-colors text-sm mr-3">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-lg transition-colors text-sm shadow-sm text-white font-bold ${!isFormValid || loading ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-[#2aa564] hover:bg-[#238f55]'}`}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <PlusCircleIcon className="w-5 h-5" />}
            {loading ? "Saving..." : "Add Item"}
          </button>
        </div>

      </div>
    </div>
  );
}