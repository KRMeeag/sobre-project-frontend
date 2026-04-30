import { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import StockHistory from "./StockHistory";
import FileUploadDropzone from "../general/FileUploadDropzone";
import DetailField from "../general/DetailField";
import type { InventoryItem } from "../../types";
import axios from "axios";
import { supabase } from "../../lib/supabase";

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
    primary_supplier: item.primary_supplier || "",
    price: item.price || 0,
    cost: item.cost || 0,
    discount: item.discount || 0,
    photo: item.photo || "",
  });

  useEffect(() => {
    const hasChanges =
      formData.name.trim() !== (item.name || "").trim() ||
      formData.category.trim() !== (item.category || "").trim() ||
      formData.primary_supplier.trim() !==
        (item.primary_supplier || "").trim() ||
      Number(formData.price) !== Number(item.price || 0) ||
      Number(formData.cost) !== Number(item.cost || 0) ||
      Number(formData.discount) !== Number(item.discount || 0) ||
      formData.photo !== (item.photo || "");

    setIsDirty(hasChanges);
  }, [formData, item]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (
      ["name", "category", "primary_supplier"].includes(name) &&
      !/^[a-zA-Z0-9\s.,'\-&]*$/.test(value)
    )
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileDrop = (file: File | null) => {
    if (!file)
      return (
        setPhotoPreview(null),
        setFormData((prev) => ({ ...prev, photo: "" }))
      );
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      setFormData((prev) => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!window.confirm("Are you sure you want to save these changes?")) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || "";

      await axios.patch(
        `${API_URL}/inventory/${item.id}?users_id=${userId}&store_id=${item.store_id}`,
        formData,
      );

      setIsEditing(false);
      setIsDirty(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to save edits:", error);
    }
  };

  const handleCancel = () => {
    if (
      isDirty &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?",
      )
    )
      return;

    setFormData({
      name: item.name || "",
      sku: item.sku || "",
      category: item.category || "",
      primary_supplier: item.primary_supplier || "",
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

  const readOnlyClass = isEditing
    ? "cursor-not-allowed opacity-70"
    : "text-[#223843]";

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
                className={`px-4 py-1.5 rounded flex items-center gap-2 transition shadow-sm text-sm font-bold ${isDirty ? "bg-[#2aa564] text-white hover:bg-[#238f55]" : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-70"}`}
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

      {/* RESTORED: Fixed gap and heights to properly utilize the 1000px space */}
      <div className="flex gap-6 mb-8 h-48">
        <div className="w-48 h-48 shrink-0 flex items-center justify-center">
          {isEditing ? (
            <div className="mt-6">
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

        {/* RESTORED: Fixed grid-cols-4 */}
        <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-x-4 gap-y-2 h-full content-between">
          <DetailField
            label="Display Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isEditing={isEditing}
            displayValue={item.name || "Unnamed Item"}
            viewClassName="text-[#223843]"
          />
          <DetailField
            label="SKU"
            isEditing={isEditing}
            isReadOnly
            displayValue={item.sku || "N/A"}
            viewClassName={`font-mono bg-gray-50 border-gray-100 ${readOnlyClass}`}
          />
          <DetailField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            isEditing={isEditing}
            displayValue={item.category || "Uncategorized"}
            viewClassName="text-[#223843]"
          />
          <DetailField
            label="Created At"
            isEditing={isEditing}
            isReadOnly
            displayValue={formatDate(item.created_at)}
            viewClassName={`bg-gray-100/50 text-gray-600 ${readOnlyClass}`}
          />

          <DetailField
            label="Primary Supplier"
            name="primary_supplier"
            value={formData.primary_supplier}
            onChange={handleChange}
            isEditing={isEditing}
            displayValue={item.primary_supplier || "No Supplier"}
            viewClassName="text-[#223843]"
          />
          <DetailField
            label="Price (₱)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            isEditing={isEditing}
            displayValue={`₱${Number(item.price || 0).toFixed(2)}`}
            viewClassName="text-[#223843]"
          />
          <DetailField
            label="Cost (₱)"
            name="cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={handleChange}
            isEditing={isEditing}
            displayValue={`₱${Number(item.cost || 0).toFixed(2)}`}
            viewClassName="text-[#223843]"
          />
          <DetailField
            label="Discount (%)"
            name="discount"
            type="number"
            min="0"
            max="100"
            step="1"
            value={formData.discount}
            onChange={handleChange}
            isEditing={isEditing}
            displayValue={`${Number(item.discount || 0)}%`}
            viewClassName="text-[#223843]"
          />

          <DetailField
            label="Avg Per Day"
            isEditing={isEditing}
            isReadOnly
            displayValue={Number(item.average_per_day || 0).toFixed(1)}
            viewClassName={`font-bold text-[#087CA7] bg-blue-50/50 border-blue-100/50 ${readOnlyClass}`}
          />
          <DetailField
            label="Sales Today"
            isEditing={isEditing}
            isReadOnly
            displayValue={item.sales_today || 0}
            viewClassName={`font-bold text-[#087CA7] bg-blue-50/50 border-blue-100/50 ${readOnlyClass}`}
          />
          <DetailField
            label="Total Stock"
            isEditing={isEditing}
            isReadOnly
            displayValue={item.total_stock || 0}
            viewClassName={`font-bold ${(item.total_stock || 0) > 0 ? "text-[#2aa564] bg-green-50/50 border-green-100/50" : "text-[#b13e3e] bg-red-50/50 border-red-100/50"} ${readOnlyClass}`}
          />
          <DetailField
            label="Suggested Order"
            isEditing={isEditing}
            isReadOnly
            displayValue={item.suggested_order || 0}
            viewClassName={`font-bold text-[#9c7e16] bg-yellow-50/50 border-yellow-100/50 ${readOnlyClass}`}
          />
        </div>
      </div>

      <StockHistory
        inventoryId={item.id}
        itemName={item.name}
        sku={item.sku || ""}
        storeId={item.store_id || ""}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default InventoryItemDetails;
