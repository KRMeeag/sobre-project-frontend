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
  // 1. Initialize User and Store Identity
  useEffect(() => {
    const fetchUserAndStore = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false); // FIX: Stop loading if not authenticated
          return;
        }

        setUserId(user.id);

        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        const fetchedStoreId = userRes.data?.store_id || null;

        setStoreId(fetchedStoreId);

        // FIX: If the user exists but has no store_id, stop the spinner.
        // (If they DO have a store_id, fetchInventory will run and stop the spinner).
        if (!fetchedStoreId) {
          setLoading(false);
          console.warn("User has no store_id assigned.");
        }
      } catch (err) {
        console.error("Failed to load user store_id:", err);
        setLoading(false); // FIX: Stop loading if the API request crashes
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

      setExistingCategories(
        catRes.data.map((c: { category: string }) => c.category),
      );
      setExistingSuppliers(
        supRes.data.map((s: { supplier: string }) => s.supplier),
      );
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
  const fetchInventory = useCallback(
    async (params: Record<string, any> = {}, silent: boolean = false) => {
      // --- CRITICAL FIX 1: Abort if store identity isn't loaded yet ---
      if (!storeId) return;

      try {
        // ONLY trigger the loading spinner if this is NOT a silent fetch
        if (!silent) {
          setLoading(true);
        }

        // --- CRITICAL FIX 2: Inject store_id into all outgoing requests ---
        const requestParams = {
          ...params,
          store_id: storeId,
        };

        const res = await axios.get(`${API_URL}/inventory`, {
          params: requestParams,
        });

        setInventory(
          Array.isArray(res.data.data)
            ? res.data.data
            : (res.data?.inventory ?? res.data?.items ?? []),
        );
      } catch (err) {
        console.error("Failed to load inventory", err);
        throw err;
      } finally {
        // Only turn off the spinner if we actually turned it on
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [storeId],
  );

  return {
    inventory,
    loading,
    existingCategories,
    existingSuppliers,
    loadingFilters,
    storeId,
    userId,
    fetchInventory,
    fetchFilters,
  };
}
