import { useState, useCallback, useMemo } from "react";
import Papa from "papaparse";
import {
  normalizeString,
  isValidDate,
  isFutureDate,
  isValidProductName,
} from "../utils/csvValidators";
import type {
  InventoryItem,
  CSVRowData,
  CSVError,
  CSVUpdate,
  CSVNewItem,
} from "../types";

export function useCSVImport(existingInventory: InventoryItem[]) {
  const [isParsing, setIsParsing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [errors, setErrors] = useState<CSVError[]>([]);
  const [updates, setUpdates] = useState<CSVUpdate[]>([]);
  const [newItems, setNewItems] = useState<CSVNewItem[]>([]);

  const inventoryMap = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    existingInventory.forEach((item) =>
      map.set(normalizeString(item.name), item),
    );
    return map;
  }, [existingInventory]);

  const parseFile = useCallback(
    (file: File) => {
      setIsParsing(true);
      setGlobalError(null);
      setErrors([]);
      setUpdates([]);
      setNewItems([]);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const requiredHeaders = ["Goods", "Price", "Expiry Date", "Quantity"];
          const missingHeaders = requiredHeaders.filter(
            (h) => !headers.includes(h),
          );

          if (missingHeaders.length > 0) {
            setGlobalError(
              `Missing required columns: ${missingHeaders.join(", ")}.`,
            );
            setIsParsing(false);
            return;
          }

          const tempErrors: CSVError[] = [];
          const tempUpdates: CSVUpdate[] = [];
          const tempNewItems: CSVNewItem[] = [];

          results.data.forEach((row: any, index) => {
            const rawRow = index + 2;
            const goods = row["Goods"]?.toString().trim() || "";
            const costRaw = row["Price"]?.toString().trim();
            const quantityRaw = row["Quantity"]?.toString().trim();
            const expiryDateRaw = row["Expiry Date"]?.toString().trim();

            let errorMessage = "";

            if (!goods) errorMessage = "Missing 'Goods' name.";
            else if (!isValidProductName(goods))
              errorMessage = "Name contains invalid special characters.";
            else if (
              !quantityRaw ||
              isNaN(Number(quantityRaw)) ||
              Number(quantityRaw) <= 0
            )
              errorMessage = "Quantity must be greater than 0.";
            else if (!costRaw || isNaN(Number(costRaw)) || Number(costRaw) <= 0)
              errorMessage = "Cost must be a valid number greater than 0.";
            else if (
              expiryDateRaw &&
              (!isValidDate(expiryDateRaw) || !isFutureDate(expiryDateRaw))
            )
              errorMessage = "Expiry Date must be a future date.";

            const parsedData: CSVRowData = {
              name: goods,
              cost: costRaw ? Number(costRaw) : 0,
              amount: Number(quantityRaw),
              expiryDate: expiryDateRaw || undefined,
              rawRow,
            };

            if (errorMessage) {
              tempErrors.push({ ...parsedData, errorMessage });
              return;
            }

            const existingItem = inventoryMap.get(normalizeString(goods));

            if (existingItem)
              tempUpdates.push({
                ...parsedData,
                inventoryId: existingItem.id,
                currentStock: existingItem.total_stock || 0,
              });
            else
              tempNewItems.push({
                ...parsedData,
                sellingPrice: 0,
                category: "",
              });
          });

          setErrors(tempErrors);
          setUpdates(tempUpdates);
          setNewItems(tempNewItems);
          setIsParsing(false);
        },
        error: () => {
          setGlobalError("Failed to parse the file. It may be corrupted.");
          setIsParsing(false);
        },
      });
    },
    [inventoryMap],
  );

  const resetImport = () => {
    setGlobalError(null);
    setErrors([]);
    setUpdates([]);
    setNewItems([]);
  };

  return {
    isParsing,
    globalError,
    setGlobalError,
    errors,
    updates,
    newItems,
    parseFile,
    resetImport,
  };
}
