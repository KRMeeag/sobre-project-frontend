// --- Sub-Component: Status Badge ---
const StatusBadge = ({ stock }: { stock: number }) => {
  let status = "In Stock";
  let colorClass = "bg-[#daf4a6] text-[#4b6618]";

  if (stock === 0) {
    status = "Out of Stock";
    colorClass = "bg-[#ffccc7] text-[#8c2d2d]";
  } else if (stock <= 10) {
    status = "Low Stock";
    colorClass = "bg-[#fff5b8] text-[#8c7e00]";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;