import { useState } from "react";
import type { InventoryItem } from "../types";
import {
  ArrowDownCircleIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";
import InventoryItemDetails from "./InventoryItemDetails";

const InventoryRow = ({
  item,
  isEven,
}: {
  item: InventoryItem;
  isEven: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${expanded ? "bg-gray-50" : "bg-white"}`}
      >
        <td className="p-4 text-center">
          <input
            type="checkbox"
            className="rounded text-[#004385] focus:ring-[#004385]"
          />
        </td>
        <td className="p-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto">
            {item.photo ? (
              <img
                src={item.photo}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-gray-500">
                {item.name.charAt(0)}
              </span>
            )}
          </div>
        </td>
        <td className="p-2 font-medium text-[#223843] text-center truncate">
          {item.name}
        </td>
        <td className="p-2 text-gray-600 text-center truncate">{item.sku}</td>
        <td className="p-2 text-[#223843] text-center">
          P{item.price.toFixed(2)}
        </td>
        <td className="p-2 text-gray-600 text-center truncate">
          {item.nearest_expiry ?? "No Items"}
        </td>
        <td className="p-1 text-center">
          <div className="flex justify-center">
            <StatusBadge stock={item.total_stock} />
          </div>
        </td>
        <td className="p-2 text-center">{item.total_stock}</td>
        <td className="p-2 text-center">{item.suggested_order}</td>
        <td className="p-2 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-full hover:bg-gray-200 text-[#223843] transition-colors mx-auto flex items-center justify-center"
          >
            {expanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ArrowDownCircleIcon className="w-6 h-6" />
            )}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={10} className="p-0">
            <InventoryItemDetails item={item} />
          </td>
        </tr>
      )}
    </>
  );
};

export default InventoryRow;
