import { useState, useEffect } from "react";
import {
  normalizeString,
  isValidProductName,
  isValidDate,
  isFutureDate,
} from "../utils/csvValidators";
import type {
  InventoryItem,
  CSVError,
  CSVUpdate,
  CSVNewItem,
  CSVRowData,
} from "../types";

export function useCSVReviewState(
  initialErrors: CSVError[],
  initialUpdates: CSVUpdate[],
  initialNewItems: CSVNewItem[],
  existingInventory: InventoryItem[],
) {
  const [localErrors, setLocalErrors] = useState<CSVError[]>([]);
  const [localDiscarded, setLocalDiscarded] = useState<CSVError[]>([]);
  const [localUpdates, setLocalUpdates] = useState<CSVUpdate[]>([]);
  const [localNewItems, setLocalNewItems] = useState<CSVNewItem[]>([]);

  // Sync when new file is parsed
  useEffect(() => {
    setLocalErrors(initialErrors);
    setLocalUpdates(initialUpdates);
    setLocalNewItems(initialNewItems);
    setLocalDiscarded([]);
  }, [initialErrors, initialUpdates, initialNewItems]);

  // In src/hooks/useCSVReviewState.ts
  const handleNewItemChange = (
    index: number,
    field: "sellingPrice" | "category",
    value: string,
  ) => {
    const updated = [...localNewItems];
    if (field === "sellingPrice")
      updated[index].sellingPrice = Number(value) || 0;
    else updated[index].category = value;
    setLocalNewItems(updated);
  };

  const handleErrorChange = (
    index: number,
    field: keyof CSVRowData,
    value: string,
  ) => {
    const updated = [...localErrors];
    if (field === "cost" || field === "amount")
      updated[index][field] = Number(value) || 0;
    else (updated[index] as any)[field] = value;
    setLocalErrors(updated);
  };

  const handleDiscardError = (index: number) => {
    const itemToDiscard = localErrors[index];
    const updatedErrors = [...localErrors];
    updatedErrors.splice(index, 1);
    setLocalErrors(updatedErrors);
    setLocalDiscarded((prev) => [...prev, itemToDiscard]);
  };

  const handleRestoreError = (index: number) => {
    const itemToRestore = localDiscarded[index];
    const updatedDiscarded = [...localDiscarded];
    updatedDiscarded.splice(index, 1);
    setLocalDiscarded(updatedDiscarded);
    setLocalErrors((prev) => [...prev, itemToRestore]);
  };

  const handleResolveError = (index: number) => {
    const errRow = localErrors[index];
    let errorMessage = "";

    const goods = errRow.name.trim();
    const cost = Number(errRow.cost);
    const amount = Number(errRow.amount);
    const expiry = errRow.expiryDate?.trim();

    if (!goods) errorMessage = "Missing 'Goods' name.";
    else if (!isValidProductName(goods))
      errorMessage = "Name contains invalid special characters.";
    else if (isNaN(amount) || amount <= 0)
      errorMessage = "Quantity must be greater than 0.";
    else if (isNaN(cost) || cost <= 0)
      errorMessage = "Cost must be greater than 0.";
    else if (expiry && (!isValidDate(expiry) || !isFutureDate(expiry)))
      errorMessage = "Expiry Date must be a future date.";

    if (errorMessage) {
      const updated = [...localErrors];
      updated[index].errorMessage = errorMessage;
      setLocalErrors(updated);
      return;
    }

    const updatedErrors = [...localErrors];
    updatedErrors.splice(index, 1);
    setLocalErrors(updatedErrors);

    const existingItem = existingInventory.find(
      (item) => normalizeString(item.name) === normalizeString(goods),
    );

    if (existingItem) {
      setLocalUpdates((prev) => [
        ...prev,
        {
          ...errRow,
          name: goods,
          inventoryId: existingItem.id,
          currentStock: existingItem.total_stock || 0,
        },
      ]);
    } else {
      setLocalNewItems((prev) => [
        ...prev,
        { ...errRow, name: goods, sellingPrice: 0, category: "" },
      ]);
    }
  };

  const clearState = () => {
    setLocalErrors([]);
    setLocalDiscarded([]);
    setLocalUpdates([]);
    setLocalNewItems([]);
  };

  return {
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
  };
}
