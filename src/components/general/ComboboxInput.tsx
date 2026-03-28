import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface ComboboxInputProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  options: string[];
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (val: string) => void;
}

export default function ComboboxInput({
  label,
  name,
  value,
  placeholder = "Select or type...",
  options,
  required = false,
  onChange,
  onSelect
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-[#b13e3e]">*</span>}
      </label>
      <div className="relative">
        <input
          name={name}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm text-[#223843] focus:outline-none focus:border-[#087CA7] focus:ring-1 focus:ring-[#087CA7] transition-all bg-white text-ellipsis overflow-hidden whitespace-nowrap"
        />
        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-100 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
          {filteredOptions.map((opt) => (
            <li 
              key={opt} 
              onMouseDown={() => { 
                onSelect(opt); 
                setIsOpen(false); 
              }}
              className="px-4 py-2.5 text-sm text-[#223843] hover:bg-blue-50 cursor-pointer transition-colors truncate border-b border-gray-50 last:border-0"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}