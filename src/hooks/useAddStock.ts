import { useState } from "react";
import axios from "axios";
import { isValidDate, isFutureDate } from "../utils/csvValidators";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

export function useAddStock(inventoryId: string, onSuccess: () => void) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. ADD SUPPLIER TO STATE
  const [form, setForm] = useState({
    amount: "",
    expiry_date: "",
    supplier: "",
  });

  // 2. STRICT VALIDATION
  const isAmountValid = !isNaN(Number(form.amount)) && Number(form.amount) > 0;
  const isExpValid =
    !form.expiry_date ||
    (isValidDate(form.expiry_date) && isFutureDate(form.expiry_date));

  // MUST NOT BE EMPTY
  const isSupplierValid = form.supplier.trim().length > 0;

  const isValid =
    isAmountValid && isExpValid && isSupplierValid && form.amount !== "";

  const updateForm = (
    field: "amount" | "expiry_date" | "supplier",
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const cancel = () => {
    setForm({ amount: "", expiry_date: "", supplier: "" });
    setIsAdding(false);
  };

  const submit = async () => {
    if (!isValid) return;
    setIsSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || "";

      // 3. SEND SUPPLIER IN PAYLOAD
      await axios.post(`${API_URL}/stock?users_id=${userId}`, {
        inventory_id: inventoryId,
        amount: Number(form.amount),
        expiry_date: form.expiry_date || null,
        supplier: form.supplier.trim(), // Strict injection matching our controller
      });

      setForm({ amount: "", expiry_date: "", supplier: "" });
      setIsAdding(false);
      onSuccess(); // Triggers the UI refresh
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isAdding,
    setIsAdding,
    form,
    updateForm,
    isSaving,
    isAmountValid,
    isExpValid,
    isSupplierValid, // Export new validation flag for the UI
    isValid,
    submit,
    cancel,
  };
}
