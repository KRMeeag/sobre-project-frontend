export const normalizeString = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const isValidDate = (dateString: string) => {
  if (!dateString) return true;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;
  const d = new Date(dateString);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isFutureDate = (dateString: string) => {
  if (!dateString) return true; 
  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
};

export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

export const isValidProductName = (str: string) => {
  return /^[a-zA-Z0-9\s\-_.(),&'%!"]+$/.test(str);
};

// Add this to the bottom of src/utils/csvValidators.ts

export const formatReadableDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  
  // Appending 'T00:00:00' ensures the date doesn't shift backward a day due to timezone offset
  const date = new Date(`${dateString}T00:00:00`); 
  
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", // "long" = February, "short" = Feb
    day: "numeric",
  });
};