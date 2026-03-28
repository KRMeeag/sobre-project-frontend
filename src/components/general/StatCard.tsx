interface StatCardProps {
  label: string;
  value: string | number;
  valueColorClass?: string;
}

export default function StatCard({
  label,
  value,
  valueColorClass = "text-gray-800",
}: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-center">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${valueColorClass}`}>{value}</p>
    </div>
  );
}
