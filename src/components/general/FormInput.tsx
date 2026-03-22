import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export default function FormInput({
  label,
  required = false,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-[#b13e3e]">*</span>}
      </label>
      <input
        autoComplete="off"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] focus:ring-1 focus:ring-[#087CA7] transition-all bg-white text-ellipsis overflow-hidden whitespace-nowrap"
        {...props}
      />
    </div>
  );
}
