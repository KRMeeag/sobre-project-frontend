import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import type { InventoryItem } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export function useInventoryData() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingSuppliers, setExistingSuppliers] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  
  const [storeId, setStoreId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Initialize User and Store Identity
  useEffect(() => {
    const fetchUserAndStore = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setUserId(user.id);
        
        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        setStoreId(userRes.data?.store_id || null);
      } catch (err) {
        console.error("Failed to load user store_id:", err);
      }
    };
    
    fetchUserAndStore();
  }, []);

  // 2. Fetch Dependent Filter Options (Categories/Suppliers)
  const fetchFilters = useCallback(async () => {
    if (!storeId) return;
    
    try {
      setLoadingFilters(true);
      const [catRes, supRes] = await Promise.all([
        axios.get(`${API_URL}/inventory/categories`, {
          params: { store_id: storeId },
        }),
        axios.get(`${API_URL}/inventory/suppliers`, {
          params: { store_id: storeId },
        }),
      ]);
      
      setExistingCategories(catRes.data.map((c: { category: string }) => c.category));
      setExistingSuppliers(supRes.data.map((s: { supplier: string }) => s.supplier));
    } catch (e) {
      console.error("Failed to fetch filters:", e);
    } finally {
      setLoadingFilters(false);
    }
  }, [storeId]);

  // Automatically fetch filters once storeId is resolved
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // 3. Fetch Core Inventory Data
  const fetchInventory = useCallback(async (params: Record<string, any> = {}) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/inventory`, { params });
      
      setInventory(
        Array.isArray(res.data.data)
          ? res.data.data
          : (res.data?.inventory ?? res.data?.items ?? [])
      );
    } catch (err) {
      console.error("Failed to load inventory", err);
      throw err; // Propagate error so the UI can trigger a toast
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    inventory,
    loading,
    existingCategories,
    existingSuppliers,
    loadingFilters,
    storeId,
    userId,
    fetchInventory,
    fetchFilters
  };
}