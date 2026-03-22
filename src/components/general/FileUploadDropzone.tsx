import { useState, useRef } from "react";
import { PhotoIcon, DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface FileUploadDropzoneProps {
  onFileDrop: (file: File | null) => void;
  previewUrl?: string | null;
  accept?: string;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  iconType?: "photo" | "document";
}

export default function FileUploadDropzone({
  onFileDrop,
  previewUrl,
  accept = "image/png, image/jpeg, image/webp",
  maxSizeMB = 5,
  title = "Upload Photo",
  subtitle = "PNG, JPG up to 5MB",
  iconType = "photo"
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setError("");
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be less than ${maxSizeMB}MB.`);
      return;
    }
    onFileDrop(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleClick = () => {
    if (previewUrl) {
      const confirmReplace = window.confirm("Are you sure you want to replace the currently uploaded file?");
      if (!confirmReplace) return;
    }
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click-to-upload
    const confirmRemove = window.confirm("Are you sure you want to remove this file?");
    if (confirmRemove) {
      onFileDrop(null);
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full md:w-48 shrink-0 flex flex-col items-center">
      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide w-full text-left">
        {iconType === "photo" ? "Item Photo" : "Upload File"} <span className="text-gray-400 font-normal normal-case">(Optional)</span>
      </label>
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center group transition-colors cursor-pointer
          ${isDragging ? 'border-[#087CA7] bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-[#004385]'}`}
      >
        {previewUrl ? (
          <>
            {iconType === "photo" ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="flex flex-col items-center text-[#004385]">
                <DocumentArrowUpIcon className="w-12 h-12 mb-2" />
                <span className="text-xs font-bold text-center">File Uploaded</span>
              </div>
            )}
            
            {/* Remove Button */}
            <button 
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-white/80 hover:bg-[#b13e3e] hover:text-white text-gray-700 p-1.5 rounded-full shadow-md transition-colors backdrop-blur-sm z-10"
              title="Remove File"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            {/* Hover Replace Overlay */}
            <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-sm font-medium rounded-xl">
              Click to Replace
            </div>
          </>
        ) : (
          <div className={`flex flex-col items-center pointer-events-none transition-colors ${isDragging ? 'text-[#087CA7]' : 'text-gray-400 group-hover:text-[#004385]'}`}>
            {iconType === "photo" ? (
              <PhotoIcon className="w-10 h-10 mb-2" />
            ) : (
              <DocumentArrowUpIcon className="w-10 h-10 mb-2" />
            )}
            <span className="text-xs font-medium text-center px-2">{isDragging ? "Drop here!" : title}</span>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          accept={accept} 
          onChange={handleChange} 
          className="hidden" 
        />
      </div>
      
      {error ? (
        <p className="text-[10px] text-[#b13e3e] mt-2 text-center font-bold">{error}</p>
      ) : (
        <p className="text-[10px] text-gray-400 mt-2 text-center">{subtitle}</p>
      )}
    </div>
  );
}