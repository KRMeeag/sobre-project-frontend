import React from "react";

interface DataTableProps {
  headers: React.ReactNode[];
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export default function DataTable({
  headers,
  loading,
  empty,
  emptyMessage = "No data found.",
  children,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed transition-all">
          <thead className="bg-[#f8f9fa] text-[#033860] text-xs uppercase tracking-wider font-bold border-b border-gray-200">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-4 text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="p-8 text-center text-[#223843]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385] mx-auto mb-2"></div>
                  Loading Data...
                </td>
              </tr>
            ) : empty ? (
              <tr>
                <td colSpan={headers.length} className="p-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}