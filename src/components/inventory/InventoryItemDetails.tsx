import { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import StockHistory from "./StockHistory";
import FileUploadDropzone from "../general/FileUploadDropzone";
import type { InventoryItem } from "../../types";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface InventoryItemDetailsProps {
  item: InventoryItem;
  onUpdate?: () => void;
}

const InventoryItemDetails = ({
  item,
  onUpdate,
}: InventoryItemDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    item.photo || null,
  );

  const [formData, setFormData] = useState({
    name: item.name || "",
    sku: item.sku || "",
    category: item.category || "",
    supplier: item.supplier || "",
    price: item.price || 0,
    cost: item.cost || 0,
    discount: item.discount || 0,
    photo: item.photo || "",
  });

  // Strict Dirty Checking
  useEffect(() => {
    const hasChanges =
      formData.name.trim() !== (item.name || "").trim() ||
      formData.category.trim() !== (item.category || "").trim() ||
      formData.supplier.trim() !== (item.supplier || "").trim() ||
      Number(formData.price) !== Number(item.price || 0) ||
      Number(formData.cost) !== Number(item.cost || 0) ||
      Number(formData.discount) !== Number(item.discount || 0) ||
      formData.photo !== (item.photo || "");

    setIsDirty(hasChanges);
  }, [formData, item]);

  // Catch Browser Refresh/Close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Regex Validation: Allow letters, numbers, spaces, and safe punctuation
    if (["name", "category", "supplier"].includes(name)) {
      const safeRegex = /^[a-zA-Z0-9\s.,'\-&]*$/;
      if (!safeRegex.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileDrop = (file: File | null) => {
    if (!file) {
      setPhotoPreview(null);
      setFormData((prev) => ({ ...prev, photo: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoPreview(base64String);
      setFormData((prev) => ({ ...prev, photo: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const confirmSave = window.confirm(
      "Are you sure you want to save these changes?",
    );
    if (!confirmSave) return;

    try {
      await axios.patch(`${API_URL}/inventory/${item.id}`, formData);
      setIsEditing(false);
      setIsDirty(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to save edits:", error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?",
      );
      if (!confirmDiscard) return;
    }
    setFormData({
      name: item.name || "",
      sku: item.sku || "",
      category: item.category || "",
      supplier: item.supplier || "",
      price: item.price || 0,
      cost: item.cost || 0,
      discount: item.discount || 0,
      photo: item.photo || "",
    });
    setPhotoPreview(item.photo || null);
    setIsEditing(false);
    setIsDirty(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#f8f9fa] p-6 border-b border-gray-300 shadow-inner">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-bold text-[#004385] font-['Raleway']">
          Product Details
        </h4>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded flex items-center gap-2 hover:bg-gray-50 transition shadow-sm text-sm font-bold"
              >
                <XMarkIcon className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`px-4 py-1.5 rounded flex items-center gap-2 transition shadow-sm text-sm font-bold ${
                  isDirty
                    ? "bg-[#2aa564] text-white hover:bg-[#238f55]"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-70"
                }`}
              >
                <CheckCircleIcon className="w-4 h-4" /> Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#e6d04f] text-[#223843] px-4 py-1.5 rounded flex items-center gap-2 font-bold hover:opacity-90 transition shadow-sm text-sm"
            >
              <PencilSquareIcon className="w-4 h-4" /> Edit Details
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-6 mb-8 h-48">
        <div className="w-48 h-48 shrink-0 flex items-center justify-center">
          {isEditing ? (
            <div className="-mt-6">
              <FileUploadDropzone
                onFileDrop={handleFileDrop}
                previewUrl={photoPreview}
                iconType="photo"
                title="Change Photo"
                subtitle="PNG, JPG up to 5MB"
              />
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl w-full h-full flex items-center justify-center overflow-hidden shadow-sm">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Product"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <PhotoIcon className="w-10 h-10 mb-2" />
                  <span className="text-xs font-medium">No Photo</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-x-4 gap-y-2 h-full content-between">
          {/* ROW 1 */}
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Display Name
            </label>
            {isEditing ? (
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] truncate"
              />
            ) : (
              <p className="font-medium text-[#223843] text-sm truncate px-2 py-1 border border-transparent">
                {formData.name}
              </p>
            )}
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              SKU
            </label>
            <p
              className={`font-medium text-[#223843] text-sm font-mono truncate bg-gray-50 px-2 py-1 rounded border border-gray-100 select-none ${isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {item.sku}
            </p>
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Category
            </label>
            {isEditing ? (
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] truncate"
              />
            ) : (
              <p className="font-medium text-[#223843] text-sm truncate px-2 py-1 border border-transparent">
                {formData.category}
              </p>
            )}
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Created At
            </label>
            <p
              className={`font-medium text-gray-600 text-sm truncate bg-gray-100/50 px-2 py-1 rounded border border-transparent select-none ${isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {formatDate(item.created_at)}
            </p>
          </div>

          {/* ROW 2 */}
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Supplier Name
            </label>
            {isEditing ? (
              <input
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] truncate"
              />
            ) : (
              <p className="font-medium text-[#223843] text-sm truncate px-2 py-1 border border-transparent">
                {formData.supplier}
              </p>
            )}
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Price (₱)
            </label>
            {isEditing ? (
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] truncate"
              />
            ) : (
              <p className="font-medium text-[#223843] text-sm truncate px-2 py-1 border border-transparent">
                ₱{Number(formData.price).toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Cost (₱)
            </label>
            {isEditing ? (
              <input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] truncate"
              />
            ) : (
              <p className="font-medium text-[#223843] text-sm truncate px-2 py-1 border border-transparent">
                ₱{Number(formData.cost).toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Discount (%)
            </label>
            {isEditing ? (
              <input
                name="discount"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] truncate"
              />
            ) : (
              <p className="font-medium text-[#223843] text-sm truncate px-2 py-1 border border-transparent">
                {formData.discount}%
              </p>
            )}
          </div>

          {/* ROW 3 */}
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Avg Per Day
            </label>
            <p
              className={`font-bold text-[#087CA7] text-sm truncate bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50 ${isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {item.average_per_day ?? 0}
            </p>
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Sales Today
            </label>
            <p
              className={`font-bold text-[#087CA7] text-sm truncate bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50 ${isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {item.sales_today ?? 0}
            </p>
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Sales Last 7 Days
            </label>
            <p
              className={`font-bold text-[#087CA7] text-sm truncate bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50 ${isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {item.sales_last_7_days ?? 0}
            </p>
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
              Suggested Order
            </label>
            <p
              className={`font-bold text-[#9c7e16] text-sm truncate bg-yellow-50/50 px-2 py-1 rounded border border-yellow-100/50 ${isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {item.suggested_order ?? 0}
            </p>
          </div>
        </div>
      </div>
      <StockHistory
        inventoryId={item.id}
        itemName={item.name}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default InventoryItemDetails;
