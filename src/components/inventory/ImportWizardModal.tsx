import { useState } from "react";
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { useCSVImport } from "../../hooks/useCSVImport";
import { useCSVReviewState } from "../../hooks/useCSVReviewState";
import type { InventoryItem, CSVNewItem } from "../../types";
import ComboboxInput from "../general/ComboboxInput";
import { formatDate } from "../../utils/date.utils";
import ErrorsTab from "./csv-import/ErrorsTab";
import NewItemsTab from "./csv-import/NewItemsTab";

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingInventory: InventoryItem[];
  existingCategories: string[];
  existingSuppliers: string[];
  onConfirm: (
    updates: any[],
    newItems: CSVNewItem[],
    supplier: string,
  ) => Promise<void>;
}

export default function ImportWizardModal({
  isOpen,
  onClose,
  existingInventory,
  existingCategories,
  existingSuppliers,
  onConfirm,
}: ImportWizardModalProps) {
  const {
    isParsing,
    globalError,
    setGlobalError,
    errors,
    updates,
    newItems,
    parseFile,
    resetImport,
  } = useCSVImport(existingInventory);

  const {
    localErrors,
    localDiscarded,
    localUpdates,
    localNewItems,
    handleNewItemChange,
    handleErrorChange,
    handleDiscardError,
    handleRestoreError,
    handleResolveError,
    clearState,
  } = useCSVReviewState(errors, updates, newItems, existingInventory);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "summary" | "errors" | "updates" | "newItems" | "discarded"
  >("summary");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const hasParsedData =
    localErrors.length > 0 ||
    localUpdates.length > 0 ||
    localNewItems.length > 0 ||
    localDiscarded.length > 0;
  const isNewItemsValid = localNewItems.every(
    (item) => item.sellingPrice > 0 && item.category.trim().length > 0,
  );
  const hasValidImportData =
    localUpdates.length > 0 || localNewItems.length > 0;
  const isConfirmDisabled =
    !hasValidImportData || isSubmitting || !isNewItemsValid;

  const handleFileChange = (file?: File) => {
    setGlobalError(null);
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setGlobalError(
        "Invalid file type. Please upload a strictly formatted .csv file.",
      );
      setPendingFile(null);
      return;
    }
    setPendingFile(file);
  };

  const handleClose = () => {
    resetImport();
    clearState();
    setPendingFile(null);
    setSelectedSupplier("");
    setActiveTab("summary");
    onClose();
  };

  const handleConfirm = async () => {
    if (
      localNewItems.some(
        (i) => i.sellingPrice > 0 && i.sellingPrice < i.cost,
      ) &&
      !window.confirm(
        "Some items have a selling price lower than their unit cost. Are you sure you want to proceed?",
      )
    )
      return;
    if (
      localErrors.length > 0 &&
      !window.confirm(
        `There are still ${localErrors.length} unresolved errors in the Errors tab.\n\nProceeding will permanently discard these rows. Are you sure you want to continue?`,
      )
    )
      return;

    setIsSubmitting(true);
    try {
      await onConfirm(localUpdates, localNewItems, selectedSupplier);
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-['Work_Sans'] p-4 overflow-y-auto">
      {/* 2. REMOVED h-[85vh] and overflow-hidden. ADDED my-auto and relative */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-auto relative flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-[#f8f9fa] shrink-0 rounded-t-xl">
          <h2 className="text-2xl font-bold text-[#004385] flex items-center gap-2">
            <DocumentArrowUpIcon className="w-6 h-6" /> Import CSV
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-[#b13e3e] transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {globalError && (
          <div className="bg-red-50 text-red-700 px-6 py-3 border-b border-red-200 flex items-center gap-2 font-medium text-sm shrink-0">
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />{" "}
            {globalError}
          </div>
        )}

        {/* Body */}
        {/* 3. REMOVED overflow-hidden here */}
        <div className="flex-1 flex flex-col bg-gray-50">
          
          {/* STEP 1: Upload */}
          {!hasParsedData && !isParsing && (
            <div className="p-10 flex flex-col items-center justify-center">
              <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-6 z-20 relative">
                  <ComboboxInput
                    label="Supplier"
                    name="supplier"
                    value={selectedSupplier}
                    options={existingSuppliers}
                    required
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    onSelect={setSelectedSupplier}
                  />
                </div>
                <div className="mb-6 relative z-10">
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                    CSV File <span className="text-red-500">*</span>
                  </label>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handleFileChange(e.dataTransfer.files?.[0]);
                    }}
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition ${dragActive ? "border-[#087CA7] bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
                  >
                    {pendingFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircleIcon className="w-10 h-10 text-green-500 mb-2" />
                        <p className="text-sm font-bold text-center">
                          {pendingFile.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setPendingFile(null);
                          }}
                          className="mt-3 text-xs text-red-500 hover:text-white font-bold px-3 py-1 border border-red-200 hover:bg-red-500 rounded-full flex items-center gap-1"
                        >
                          <XMarkIcon className="w-3 h-3" /> Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <DocumentArrowUpIcon className="w-10 h-10 mb-2" />
                        <p className="text-sm font-semibold">
                          Click or drag & drop
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />
                  </label>
                </div>
                <button
                  onClick={() => pendingFile && parseFile(pendingFile)}
                  disabled={!pendingFile || !selectedSupplier}
                  className="w-full bg-[#004385] text-white py-3 rounded-lg font-bold shadow hover:bg-[#003060] disabled:opacity-50"
                >
                  Import CSV Data
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Spinner */}
          {isParsing && (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#087CA7] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Validating Data...</p>
            </div>
          )}

          {/* STEP 3: Review */}
          {hasParsedData && !isParsing && (
            <div className="flex-1 flex flex-col">
              {/* Tab Nav */}
              <div className="flex border-b border-gray-200 bg-white px-6 shrink-0">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-4 py-4 font-bold text-sm border-b-2 ${activeTab === "summary" ? "border-[#004385] text-[#004385]" : "border-transparent text-gray-500"}`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab("errors")}
                  className={`px-4 py-4 font-bold text-sm border-b-2 flex items-center gap-1 ${activeTab === "errors" ? "border-red-500 text-red-600" : "border-transparent text-gray-500"}`}
                >
                  Errors{" "}
                  <span className="bg-red-100 text-red-600 px-2 rounded-full text-xs">
                    {localErrors.length}
                  </span>
                </button>
                {localDiscarded.length > 0 && (
                  <button
                    onClick={() => setActiveTab("discarded")}
                    className={`px-4 py-4 font-bold text-sm border-b-2 flex items-center gap-1 ${activeTab === "discarded" ? "border-gray-500 text-gray-700" : "border-transparent text-gray-500"}`}
                  >
                    Discarded{" "}
                    <span className="bg-gray-100 text-gray-600 px-2 rounded-full text-xs">
                      {localDiscarded.length}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("updates")}
                  className={`px-4 py-4 font-bold text-sm border-b-2 flex items-center gap-1 ${activeTab === "updates" ? "border-[#087CA7] text-[#087CA7]" : "border-transparent text-gray-500"}`}
                >
                  Updates{" "}
                  <span className="bg-blue-100 text-blue-600 px-2 rounded-full text-xs">
                    {localUpdates.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("newItems")}
                  className={`px-4 py-4 font-bold text-sm border-b-2 flex items-center gap-1 ${activeTab === "newItems" ? "border-[#2aa564] text-[#2aa564]" : "border-transparent text-gray-500"}`}
                >
                  New Items{" "}
                  <span className="bg-green-100 text-green-600 px-2 rounded-full text-xs">
                    {localNewItems.length}
                  </span>
                </button>
              </div>

              {/* Tab Contents */}
              {/* 4. REMOVED overflow-y-auto here to allow breakout */}
              <div className="p-6">
                {activeTab === "summary" && (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-red-200 flex flex-col items-center">
                      <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mb-2" />
                      <h3 className="text-3xl font-bold">
                        {localErrors.length}
                      </h3>
                      <p className="text-gray-500">Errors</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-blue-200 flex flex-col items-center">
                      <InformationCircleIcon className="w-10 h-10 text-blue-500 mb-2" />
                      <h3 className="text-3xl font-bold">
                        {localUpdates.length}
                      </h3>
                      <p className="text-gray-500">Existing Items</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-green-200 flex flex-col items-center">
                      <CheckCircleIcon className="w-10 h-10 text-green-500 mb-2" />
                      <h3 className="text-3xl font-bold">
                        {localNewItems.length}
                      </h3>
                      <p className="text-gray-500">New Items</p>
                    </div>
                  </div>
                )}

                {activeTab === "errors" && (
                  <ErrorsTab
                    errors={localErrors}
                    onUpdateField={handleErrorChange}
                    onResolve={handleResolveError}
                    onDiscard={handleDiscardError}
                  />
                )}

                {activeTab === "newItems" && (
                  <NewItemsTab
                    items={localNewItems}
                    existingCategories={existingCategories}
                    onChange={handleNewItemChange}
                  />
                )}

                {activeTab === "updates" && (
                  <table className="w-full text-left bg-white rounded-lg border border-gray-200">
                    <thead className="bg-blue-50 text-blue-800 text-[11px] uppercase border-b border-blue-200">
                      <tr>
                        <th className="p-3">Goods</th>
                        <th className="p-3 text-center">New Stock</th>
                        <th className="p-3 text-center">Cost</th>
                        <th className="p-3 text-center">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {localUpdates.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-6 text-center text-gray-500"
                          >
                            No updates.
                          </td>
                        </tr>
                      ) : (
                        localUpdates.map((u, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-3">{u.name}</td>
                            <td className="p-3 text-center text-blue-600 font-bold">
                              +{u.amount}
                            </td>
                            <td className="p-3 text-center">
                              ₱{u.cost.toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              {u.expiryDate
                                ? formatDate(u.expiryDate, "long")
                                : "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === "discarded" && (
                  <table className="w-full text-left bg-white rounded-lg border border-gray-200 opacity-70">
                    <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase border-b border-gray-200">
                      <tr>
                        <th className="p-3">Goods</th>
                        <th className="p-3 text-center">Stock</th>
                        <th className="p-3 text-center">Cost</th>
                        <th className="p-3 text-center">Restore</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {localDiscarded.map((d, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3">{d.name}</td>
                          <td className="p-3 text-center">{d.amount}</td>
                          <td className="p-3 text-center">₱{d.cost}</td>
                          <td className="p-3 text-center text-gray-500">
                            {d.expiryDate
                              ? formatDate(d.expiryDate, "long")
                              : "N/A"}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleRestoreError(i)}
                              className="p-1.5 bg-white border border-gray-300 rounded hover:bg-blue-50 mx-auto block"
                            >
                              <ArrowUturnLeftIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white flex justify-between shrink-0 rounded-b-xl">
          <button
            onClick={() => {
              if (hasParsedData || pendingFile) {
                resetImport();
                clearState();
                setPendingFile(null);
                setActiveTab("summary");
              } else handleClose();
            }}
            className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
          >
            {hasParsedData || pendingFile ? "Back" : "Cancel"}
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={`px-8 py-2.5 rounded-lg shadow font-bold flex items-center gap-2 transition ${isConfirmDisabled ? "bg-gray-300 text-gray-500 shadow-none" : "bg-[#004385] text-white hover:bg-[#003060]"}`}
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting ? "Importing..." : "Confirm Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}