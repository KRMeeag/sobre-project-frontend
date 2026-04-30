import { useState, useEffect } from "react";
import type { InventoryItem } from "../../types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import InventoryItemDetails from "./InventoryItemDetails";
import { formatDate } from "../../utils/date.utils";
import StatusBadge from "./StatusBadge";

interface InventoryRowProps {
  item: InventoryItem;
  isEven: boolean;
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdate: () => void;
}

const InventoryRow = ({
  item,
  isDeleteMode,
  isSelected,
  onToggleSelect,
  onUpdate,
}: InventoryRowProps) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isDeleteMode) {
      setExpanded(false);
    }
  }, [isDeleteMode]);

  return (
    <>
      <tr
        // UX FIX: Entire row is clickable when not in delete mode
        onClick={() => !isDeleteMode && setExpanded(!expanded)}
        className={`border-b border-gray-200 hover:bg-blue-50/30 transition-colors ${
          expanded ? "bg-gray-50" : "bg-white"
        } ${isSelected ? "bg-red-50/40" : ""} ${!isDeleteMode ? "cursor-pointer" : ""}`}
      >
        <td 
          className="p-4 text-center" 
          // Stop row expansion when clicking the checkbox cell
          onClick={(e) => isDeleteMode && e.stopPropagation()}
        >
          {isDeleteMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item.id)}
              className="rounded border-gray-400 w-4 h-4 text-[#b13e3e] focus:ring-[#b13e3e] cursor-pointer"
            />
          ) : (
            <span className="text-gray-400 text-xs font-bold uppercase">--</span>
          )}
        </td>

        <td className="p-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto shadow-sm">
            {item.photo ? (
              <img
                src={item.photo}
                alt={item.name || "Item"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-gray-500">
                {(item.name || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </td>
        <td className="p-2 font-medium text-[#223843] text-center truncate">
          {item.name || "Unnamed Item"}
        </td>
        <td className="p-2 text-gray-600 text-center font-mono text-xs">
          {item.sku || "N/A"}
        </td>
        <td className="p-2 text-[#223843] text-center font-medium">
          ₱{Number(item.price || 0).toFixed(2)}
        </td>
        <td className="p-2 text-gray-600 text-center truncate">
          {item.nearest_expiry ? formatDate(item.nearest_expiry) : "N/A"}
        </td>
        <td className="p-1 text-center">
          <div className="flex justify-center">
            <StatusBadge stock={item.total_stock || 0} />
          </div>
        </td>
        <td className="p-2 text-center font-bold">{item.total_stock || 0}</td>
        <td className="p-2 text-center">{item.suggested_order || 0}</td>

        {!isDeleteMode && (
          <td className="p-2 text-center animate-in fade-in">
            {/* The button's click naturally bubbles up to the <tr>, expanding the row */}
            <button
              className={`p-1.5 rounded-full transition-colors mx-auto flex items-center justify-center ${expanded ? "bg-[#004385] text-white" : "hover:bg-gray-200 text-[#223843]"}`}
            >
              {expanded ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          </td>
        )}
      </tr>

      {expanded && !isDeleteMode && (
        <tr>
          {/* Prevent expanding/collapsing when interacting with the inner details menu */}
          <td colSpan={10} className="p-0 cursor-default" onClick={(e) => e.stopPropagation()}>
            <InventoryItemDetails item={item} onUpdate={onUpdate} />
          </td>
        </tr>
      )}
    </>
  );
};

export default InventoryRow;