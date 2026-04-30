import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ComboboxInput from "../../general/ComboboxInput";
import type { CSVNewItem } from "../../../types";
// Remove formatReadableDate from the csvValidators import
import { formatDate } from "../../../utils/date.utils"; // Adjust path as needed

interface NewItemsTabProps {
  items: CSVNewItem[];
  existingCategories: string[];
  onChange: (
    index: number,
    field: "sellingPrice" | "category",
    value: string,
  ) => void;
}

export default function NewItemsTab({
  items,
  existingCategories,
  onChange,
}: NewItemsTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="bg-green-50 p-4 border-b border-green-200">
        <p className="text-green-800 text-sm font-medium flex items-center gap-2">
          <InformationCircleIcon className="w-5 h-5 shrink-0" /> Please set the
          Category and Selling Price for these new products before confirming.
        </p>
      </div>
      {/* Change this: <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible"> */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="bg-[#f8f9fa] text-[#033860] uppercase tracking-wider font-bold border-b border-gray-200">
            <tr>
              <th className="p-3 text-left w-[25%]">Goods</th>
              <th className="p-3 text-center w-[10%]">Stock</th>
              <th className="p-3 text-center w-[15%]">Unit Cost</th>
              <th className="p-3 text-center w-[15%]">Expiry</th>
              <th className="p-3 text-left w-[20%]">
                Category <span className="text-red-500">*</span>
              </th>
              <th className="p-3 text-left w-[15%]">
                Price <span className="text-red-500">*</span>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No new items found.
                </td>
              </tr>
            ) : (
              items.map((item, i) => {
                const isPriceValid = item.sellingPrice > 0;
                const isCategoryValid = item.category.trim().length > 0;
                const isPriceWarning =
                  isPriceValid && item.sellingPrice < item.cost;

                const categoryBg = isCategoryValid
                  ? "bg-green-50/30"
                  : "bg-red-50/50";
                const priceBg = !isPriceValid
                  ? "bg-red-50/50"
                  : isPriceWarning
                    ? "bg-yellow-50/50"
                    : "bg-green-50/30";

                return (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors relative focus-within:z-50"
                    style={{ zIndex: 9999 - i }}
                  >
                    <td
                      className="p-3 text-left font-medium truncate"
                      title={item.name}
                    >
                      {item.name}
                    </td>
                    <td className="p-3 text-center">{item.amount}</td>
                    <td className="p-3 text-center">₱{item.cost.toFixed(2)}</td>

                    <td className="p-3 text-center text-gray-600">
                      {item.expiryDate
                        ? formatDate(item.expiryDate, "long")
                        : "N/A"}{" "}
                    </td>

                    <td className={`p-2 ${categoryBg} align-top`}>
                      <ComboboxInput
                        hideLabel
                        value={item.category}
                        options={existingCategories}
                        placeholder="Category..."
                        onChange={(e) =>
                          onChange(i, "category", e.target.value)
                        }
                        onSelect={(val) => onChange(i, "category", val)}
                        className="z-50"
                      />
                    </td>
                    <td className={`p-2 ${priceBg} align-top`}>
                      <div className="relative">
                        <span className="absolute left-2 top-2.5 text-gray-500 font-medium">
                          ₱
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.sellingPrice || ""}
                          onChange={(e) =>
                            onChange(i, "sellingPrice", e.target.value)
                          }
                          className={`w-full pl-6 pr-2 py-2 border rounded-lg outline-none text-sm transition ${!isPriceValid ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : isPriceWarning ? "border-yellow-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"}`}
                          placeholder="0.00"
                        />
                      </div>
                      {isPriceWarning && (
                        <p className="text-[10px] text-yellow-700 mt-1 font-bold flex items-center gap-1 leading-tight">
                          <ExclamationTriangleIcon className="w-3 h-3 shrink-0" />{" "}
                          Lower than cost.
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
