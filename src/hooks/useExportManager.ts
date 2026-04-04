import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export function useExportManager(
  userId: string | null, 
  showToast: (msg: string, type: "success" | "error") => void
) {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleExportPDF = async (reportType: "operational" | "financial") => {
    if (!userId) {
      showToast("User session not found.", "error");
      return;
    }

    setIsExportMenuOpen(false); 
    setIsExporting(true);
    
    try {
      const endpoint = reportType === "operational" 
        ? "/inventory/pdfOperational" 
        : "/inventory/pdfFinancial";

      const response = await axios.get(`${API_URL}${endpoint}`, {
        params: { user_id: userId },
        responseType: "blob", 
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);

      showToast(`${reportType === "operational" ? "Operational" : "Financial"} PDF generated successfully.`, "success");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      showToast("Failed to generate PDF report.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    isExportMenuOpen,
    setIsExportMenuOpen,
    handleExportPDF
  };
}