import {
  CheckCircleIcon,
  TrashIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  isValidDate,
  isFutureDate,
  getTomorrowDateString,
  isValidProductName,
} from "../../../utils/csvValidators";
import type { CSVError, CSVRowData } from "../../../types";

interface ErrorsTabProps {
  errors: CSVError[];
  onUpdateField: (
    index: number,
    field: keyof CSVRowData,
    value: string,
  ) => void;
  onResolve: (index: number) => void;
  onDiscard: (index: number) => void;
}

export default function ErrorsTab({
  errors,
  onUpdateField,
  onResolve,
  onDiscard,
}: ErrorsTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-red-50 p-4 border-b border-red-200 flex justify-between items-center">
        <p className="text-red-800 text-sm font-medium flex items-center gap-2">
          <InformationCircleIcon className="w-5 h-5 shrink-0" /> Fix errors
          inline and click the checkmark to resolve, or discard unneeded rows.
        </p>
      </div>
      <div className="overflow-visible">
        <table className="w-full text-left table-fixed border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase font-bold border-b border-gray-200">
            <tr>
              <th className="p-3 text-left w-1/3">Goods</th>
              <th className="p-3 text-center w-20">Stock</th>
              <th className="p-3 text-center w-24">Unit Cost</th>
              <th className="p-3 text-center w-32">Expiry (Opt)</th>
              <th className="p-3 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {errors.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No unresolved errors.
                </td>
              </tr>
            ) : (
              errors.map((err, i) => {
                const isNameValid =
                  err.name.trim().length > 0 && isValidProductName(err.name);
                const isAmountValid =
                  !isNaN(Number(err.amount)) && Number(err.amount) > 0;
                const isCostValid =
                  !isNaN(Number(err.cost)) && Number(err.cost) > 0;
                const isExpValid =
                  !err.expiryDate ||
                  (isValidDate(err.expiryDate) && isFutureDate(err.expiryDate));
                const isRowValid =
                  isNameValid && isAmountValid && isCostValid && isExpValid;

                return (
                  <tr
                    key={i}
                    className="border-b border-gray-200 last:border-0 bg-red-50/20 relative"
                    style={{ zIndex: 9999 - i }}
                  >
                    <td className="p-3 align-top">
                      <input
                        type="text"
                        value={err.name}
                        onChange={(e) =>
                          onUpdateField(i, "name", e.target.value)
                        }
                        className={`w-full px-2 py-1.5 border rounded outline-none focus:ring-1 transition ${!isNameValid ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                        placeholder="Goods Name"
                      />
                      <p
                        className="text-[10px] text-red-600 font-bold mt-1 truncate"
                        title={err.errorMessage}
                      >
                        {err.errorMessage}
                      </p>
                    </td>
                    <td className="p-3 align-top">
                      <input
                        type="number"
                        value={err.amount || ""}
                        onChange={(e) =>
                          onUpdateField(i, "amount", e.target.value)
                        }
                        className={`w-full px-2 py-1.5 border rounded outline-none focus:ring-1 transition text-center ${!isAmountValid ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                        placeholder="0"
                      />
                    </td>
                    <td className="p-3 align-top">
                      <input
                        type="number"
                        step="0.01"
                        value={err.cost || ""}
                        onChange={(e) =>
                          onUpdateField(i, "cost", e.target.value)
                        }
                        className={`w-full px-2 py-1.5 border rounded outline-none focus:ring-1 transition text-center ${!isCostValid ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-3 align-top">
                      <input
                        type="date"
                        min={getTomorrowDateString()}
                        value={err.expiryDate || ""}
                        onChange={(e) =>
                          onUpdateField(i, "expiryDate", e.target.value)
                        }
                        className={`w-full px-2 py-1.5 border rounded outline-none focus:ring-1 transition text-center text-xs ${!isExpValid ? "border-red-400 focus:border-red-500 focus:ring-red-500 text-red-600" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                      />
                    </td>
                    <td className="p-3 text-center align-top">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onResolve(i)}
                          disabled={!isRowValid}
                          className={`p-1.5 rounded transition shadow-sm ${isRowValid ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}
                          title="Resolve"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDiscard(i)}
                          className="p-1.5 bg-white border border-gray-300 text-gray-500 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition"
                          title="Discard Row"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
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
