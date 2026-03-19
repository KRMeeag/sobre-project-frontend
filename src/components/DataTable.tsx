import React from "react";

interface DataTableProps {
  headers: React.ReactNode[];
  gridTemplate: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export default function DataTable({
  headers,
  gridTemplate,
  loading,
  empty,
  emptyMessage = "No data found.",
  children,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-t-[20px] flex-1 flex flex-col shadow-sm border border-gray-200 overflow-hidden min-h-0">
      
      {/* Table Header */}
      <div 
        className="bg-[#f4f4f4] h-15 grid items-center px-8 border-b border-gray-200 shrink-0"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {headers.map((h, i) => (
          <div key={i} className="text-[15px] font-['Raleway'] text-[#a29898] text-center font-semibold">
            {h}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto bg-white pb-4 custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-['Work_Sans']">Loading data...</div>
        ) : empty ? (
          <div className="p-8 text-center text-gray-500 font-['Work_Sans']">{emptyMessage}</div>
        ) : (
          children
        )}
      </div>
      
    </div>
  );
}