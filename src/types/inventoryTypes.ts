export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  cost: number;
  price: number;
  discount: number;
  suggested_order: number;
  supplier: string;
  average_per_day: number;
  sales_last_7_days: number;
  reorder_needed: boolean;
  sales_today: number;
  photo: string;
  total_stock: number;
  nearest_expiry: string;
  is_restock_needed: boolean;
  is_expiry_soon: boolean;
  created_at: string;
}

export interface StockItem {
  id: string;
  expiry_date: string;
  amount: number;
  barcode: string;
  restock_date: string;
}

export type FilterKey = "category" | "stockStatus" | "supplier" | "restock" | "expiry";

export interface CSVRowData {
  name: string;
  cost: number;
  amount: number;
  expiryDate?: string;
  rawRow: number;
}

export interface CSVError extends CSVRowData {
  errorMessage: string;
}

export interface CSVUpdate extends CSVRowData {
  inventoryId: string;
  currentStock: number;
}

export interface CSVNewItem extends CSVRowData {
  sellingPrice: number; 
  category: string; // Now strictly required
}
