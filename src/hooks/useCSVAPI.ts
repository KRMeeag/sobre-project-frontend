import axios from "axios";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

interface useCSVAPIProps {
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export function useCSVAPI({ onSuccess, showToast }: useCSVAPIProps) {
  
  const submitImport = async (updates: any[], newItems: any[], supplier: string) => {
    try {
      // 1. Authenticate
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        showToast("Authentication error: No active session found.", "error");
        throw new Error("No user session");
      }

      // 2. Execute the import payload
      await axios.post(`${API_URL}/inventory/import?users_id=${userId}`, {
        updates,
        newItems,
        supplier,
      });

      // 3. Trigger success UX
      showToast(
        `Successfully imported ${updates.length} updates and ${newItems.length} new items.`,
        "success"
      );

      // 4. Fire the callback to refresh UI data
      onSuccess();

    } catch (err: any) {
      console.error("CSV Import Error:", err);
      showToast(
        err.response?.data?.error || "A critical error occurred during the CSV import.",
        "error"
      );
      // Re-throw so the modal knows to halt its closing sequence
      throw err;
    }
  };

  return { submitImport };
}