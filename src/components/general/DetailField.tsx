import React from "react";

interface DetailFieldProps {
  label: string;
  isEditing: boolean;
  isReadOnly?: boolean;
  name?: string;
  type?: string;
  value?: string | number;
  displayValue: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewClassName?: string;
  min?: string;
  max?: string;
  step?: string;
}

export default function DetailField({
  label,
  isEditing,
  isReadOnly = false,
  name,
  type = "text",
  value,
  displayValue,
  onChange,
  viewClassName = "",
  min,
  max,
  step,
}: DetailFieldProps) {
  const showInput = isEditing && !isReadOnly;

  return (
    <div className="flex flex-col min-w-0 justify-center">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mb-1 px-1">
        {label}
      </label>
      {showInput ? (
        <input
          name={name}
          type={type}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] truncate"
        />
      ) : (
        <p
          className={`font-medium text-sm truncate px-2 py-1 rounded border border-transparent select-none ${viewClassName}`}
        >
          {displayValue}
        </p>
      )}
    </div>
  );
}
