export const formatDate = (dateString?: string | null, format: "short" | "long" = "short") => {
  if (!dateString) return "N/A";
  
  // Safe parsing: If it's a strict YYYY-MM-DD string, append T00:00:00 to prevent timezone shifting
  const safeDateString = dateString.includes("T") ? dateString : `${dateString}T00:00:00`;
  const date = new Date(safeDateString);

  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: format, 
    day: "numeric",
  });
};