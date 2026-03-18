import { useState } from "react";
import { PencilSquareIcon, PhotoIcon } from "@heroicons/react/24/outline";
import StockHistory from "./StockHistory";
import type { InventoryItem } from "../types";

const InventoryItemDetails = ({ item }: { item: InventoryItem }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...item });
  const [photoPreview, setPhotoPreview] = useState<string | null>(item.photo || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saved data:", formData);
  };

  const handleCancel = () => {
    setFormData({ ...item });
    setPhotoPreview(item.photo || null);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#f8f9fa] p-6 border-b border-gray-300 shadow-inner">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-bold text-[#004385] font-['Raleway']">Product Details</h4>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="bg-[#2aa564] text-white px-4 py-1.5 rounded flex items-center gap-2 hover:opacity-90 transition shadow-sm">Save</button>
              <button onClick={handleCancel} className="bg-[#b13e3e] text-white px-4 py-1.5 rounded flex items-center gap-2 hover:opacity-90 transition shadow-sm">Cancel</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-[#e6d04f] text-[#223843] px-4 py-1.5 rounded flex items-center gap-2 font-medium hover:opacity-90 transition shadow-sm">
              <PencilSquareIcon className="w-4 h-4" /> Edit Details
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-8 mb-8">
        <div className="w-48 flex-shrink-0">
          <div className="relative bg-white border border-gray-200 rounded-xl h-48 flex items-center justify-center overflow-hidden shadow-sm group">
            {photoPreview ? (
              <img src={photoPreview} alt="Product" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <PhotoIcon className="w-10 h-10 mb-2" />
                <span className="text-xs">No Photo</span>
              </div>
            )}
            {isEditing && (
              <label htmlFor={`photo-upload-${item.id}`} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-sm font-medium">
                Change Photo
                <input type="file" id={`photo-upload-${item.id}`} className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-4 gap-x-6 gap-y-4 text-sm content-start text-left">
          <div className="col-span-1 min-w-0">
            <label className="block text-gray-400 text-xs mb-1">Display Name</label>
            {isEditing ? <input name="name" value={formData.name} onChange={handleChange} className="w-full min-w-0 border border-gray-300 rounded p-2 text-[#223843] focus:outline-none focus:border-[#087CA7]" /> : <p className="w-full min-w-0 font-medium text-[#223843] p-2 border border-transparent rounded">{item.name}</p>}
          </div>
          <div className="min-w-0">
            <label className="block text-gray-400 text-xs mb-1">SKU</label>
            {isEditing ? <input name="sku" value={formData.sku} onChange={handleChange} className="w-full min-w-0 border border-gray-300 rounded p-2 text-[#223843] focus:outline-none focus:border-[#087CA7]" /> : <p className="w-full min-w-0 font-medium text-[#223843] p-2 border border-transparent rounded">{item.sku}</p>}
          </div>
          <div className="min-w-0">
            <label className="block text-gray-400 text-xs mb-1">Price</label>
            {isEditing ? <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full min-w-0 border border-gray-300 rounded p-2 text-[#223843] focus:outline-none focus:border-[#087CA7]" /> : <p className="w-full min-w-0 font-medium text-[#223843] p-2 border border-transparent rounded">P{item.price.toFixed(2)}</p>}
          </div>
          <div className="col-start-4 min-w-0">
            <label className="block text-gray-400 text-xs mb-1">Avg sales/day</label>
            <p className="w-full min-w-0 font-bold text-[#087CA7] p-2 bg-blue-50/50 border border-transparent rounded">{item.average_per_day}</p>
          </div>
          <div className="col-span-2 min-w-0">
            <label className="block text-gray-400 text-xs mb-1">Supplier Name</label>
            {isEditing ? <input name="supplier" value={formData.supplier} onChange={handleChange} className="w-full min-w-0 border border-gray-300 rounded p-2 text-[#223843] focus:outline-none focus:border-[#087CA7]" /> : <p className="w-full min-w-0 font-medium text-[#223843] p-2 border border-transparent rounded">{item.supplier}</p>}
          </div>
          <div className="min-w-0">
            <label className="block text-gray-400 text-xs mb-1">Cost</label>
            {isEditing ? <input name="cost" type="number" value={formData.cost} onChange={handleChange} className="w-full min-w-0 border border-gray-300 rounded p-2 text-[#223843] focus:outline-none focus:border-[#087CA7]" /> : <p className="w-full min-w-0 font-medium text-[#223843] p-2 border border-transparent rounded">P{item.cost.toFixed(2)}</p>}
          </div>
          <div className="min-w-0">
            <label className="block text-gray-400 text-xs mb-1">Category</label>
            {isEditing ? (
              <select name="category" value={formData.category} onChange={handleChange} className="w-full min-w-0 border border-gray-300 rounded p-2 text-[#223843] focus:outline-none focus:border-[#087CA7] bg-white">
                <option value="Food">Food</option>
                <option value="Drinks">Drinks</option>
                <option value="Biscuit">Biscuit</option>
              </select>
            ) : (
              <p className="w-full min-w-0 font-medium text-[#223843] p-2 border border-transparent rounded">{item.category}</p>
            )}
          </div>
          <div className="col-start-4 min-w-0">
            <label className="block text-gray-400 text-xs mb-1">Sales (7 days)</label>
            <p className="w-full min-w-0 font-bold text-[#087CA7] p-2 bg-blue-50/50 border border-transparent rounded">{item.sales_last_7_days}</p>
          </div>
        </div>
      </div>

      <StockHistory inventoryId={item.id} itemName={item.name} />
    </div>
  );
};

export default InventoryItemDetails;