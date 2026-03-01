import { useState } from "react";
import { 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

// Dummy data mirroring the exact records in your screenshot
const AUDIT_LOGS = [
  { id: 1, date: "January 6, 2025", time: "3:47 PM", user: "User201", area: "Inventory", action: "Updating", record: "C2 Green", summary: "Price: 25.00 -> P35.00" },
  { id: 2, date: "January 6, 2025", time: "3:30 PM", user: "User201", area: "Sales", action: "Adding", record: "Sales Record", summary: "3 Items Checked Out" },
  { id: 3, date: "January 6, 2025", time: "3:15 PM", user: "User201", area: "Sales", action: "Deleting", record: "Sales Record", summary: "Sales Voided" },
  { id: 4, date: "January 6, 2025", time: "3:15 PM", user: "User201", area: "Inventory", action: "Updating", record: "C2 Red Medium", summary: "Stock: 3 -> 30" },
  { id: 5, date: "January 6, 2025", time: "3:15 PM", user: "User201", area: "Inventory", action: "Updating", record: "C2 Red Medium", summary: "Stock: 3 -> 30" },
  { id: 6, date: "January 6, 2025", time: "3:30 PM", user: "User201", area: "Sales", action: "Adding", record: "Sales Record", summary: "3 Items Checked Out" },
  { id: 7, date: "January 6, 2025", time: "3:30 PM", user: "User201", area: "Sales", action: "Adding", record: "Sales Record", summary: "3 Items Checked Out" },
  { id: 8, date: "January 6, 2025", time: "3:30 PM", user: "User201", area: "Sales", action: "Adding", record: "Sales Record", summary: "3 Items Checked Out" },
  { id: 9, date: "January 6, 2025", time: "3:30 PM", user: "User201", area: "Sales", action: "Adding", record: "Sales Record", summary: "3 Items Checked Out" },
  { id: 10, date: "January 6, 2025", time: "3:15 PM", user: "User201", area: "System Settings", action: "Updating", record: "Stock Threshold", summary: "Low Stock: 10 -> 15" },
  { id: 11, date: "January 6, 2025", time: "3:30 PM", user: "User201", area: "Sales", action: "Adding", record: "Sales Record", summary: "3 Items Checked Out" },
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-[#e9e9e9] font-['Work_Sans']">
      {/* Top Header Bar */}
      <div className="w-full h-13 bg-[#002f5a] shrink-0 shadow-sm"></div>

      {/* Main Content */}
      <div className="p-8 flex-1 flex flex-col w-full max-w-425 mx-auto overflow-hidden">
        
        {/* Title */}
        <h1 className="text-[28px] font-bold font-['Raleway'] text-[#223843] mb-6">
          Audit History
        </h1>

        {/* --- Top Controls Row --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          
          {/* Search Bar (Left) */}
          <div className="relative w-85 h-11 bg-white border border-gray-300 rounded-md flex items-center px-4 shadow-sm focus-within:border-[#002f5a] transition-colors">
            <input
              type="text"
              placeholder="Search by user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-[15px] text-[#223843] placeholder-gray-400"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-2 shrink-0" strokeWidth={2} />
          </div>

          {/* Filters (Right) */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Grouped Time Filters */}
            <div className="flex bg-white border border-gray-300 rounded-md shadow-sm h-11">
              <DynamicFilterInput 
                type="time" 
                label="Start Time..." 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                icon={<ClockIcon className="w-4 h-4" />} 
                borderRight 
              />
              <DynamicFilterInput 
                type="time" 
                label="End Time..." 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
                icon={<ClockIcon className="w-4 h-4" />} 
              />
            </div>

            {/* Grouped Date Filters */}
            <div className="flex bg-white border border-gray-300 rounded-md shadow-sm h-11">
              <DynamicFilterInput 
                type="date" 
                label="Start Date..." 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                icon={<CalendarDaysIcon className="w-4 h-4" />} 
                borderRight 
              />
              <DynamicFilterInput 
                type="date" 
                label="End Date..." 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                icon={<CalendarDaysIcon className="w-4 h-4" />} 
              />
            </div>

            {/* Action Dropdown */}
            <div className="relative h-11 bg-white border border-gray-300 rounded-md shadow-sm flex items-center min-w-32.5">
              <select 
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[15px] text-gray-500 pl-4 pr-10 appearance-none cursor-pointer"
              >
                <option value="">Action</option>
                <option value="Adding">Adding</option>
                <option value="Updating">Updating</option>
                <option value="Deleting">Deleting</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 pointer-events-none text-gray-400" />
            </div>

            {/* Area Dropdown */}
            <div className="relative h-11 bg-white border border-gray-300 rounded-md shadow-sm flex items-center min-w-32.5">
              <select 
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[15px] text-gray-500 pl-4 pr-10 appearance-none cursor-pointer"
              >
                <option value="">Area</option>
                <option value="Inventory">Inventory</option>
                <option value="Sales">Sales</option>
                <option value="System Settings">System Settings</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 pointer-events-none text-gray-400" />
            </div>

          </div>
        </div>

        {/* --- Data Table --- */}
        <div className="bg-white rounded-t-[20px] flex-1 flex flex-col shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Table Header */}
          <div className="bg-[#f4f4f4] h-15 grid grid-cols-[160px_140px_180px_160px_140px_200px_1fr_80px] items-center px-8 border-b border-gray-200 shrink-0">
            <div className="text-[15px] font-['Raleway'] text-[#a29898] text-center">Date</div>
            <div className="text-[15px] font-['Raleway'] text-[#a29898] text-center">Time</div>
            <div className="text-[15px] font-['Raleway'] text-[#a29898] text-center">User</div>
            <div className="text-[15px] font-['Raleway'] text-[#a29898] text-center">Area</div>
            <div className="text-[15px] font-['Raleway'] text-[#a29898] text-center">Action</div>
            <div className="text-[15px] font-['Raleway'] text-[#a29898] text-center">Item/Record</div>
            <div className="text-[15px] font-['Raleway'] text-[#a29898] text-center">Summary</div>
            <div className="flex justify-center">
              <div className="w-6 h-6 bg-[#ada7a7] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center">i</div>
            </div> 
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto bg-white pb-4">
            {AUDIT_LOGS.map((log) => (
              <div 
                key={log.id} 
                className="grid grid-cols-[160px_140px_180px_160px_140px_200px_1fr_80px] items-center px-8 h-[70px] border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Date */}
                <div className="text-[15px] font-['Raleway'] text-gray-500 text-center">
                  {log.date}
                </div>

                {/* Time */}
                <div className="text-[15px] font-['Raleway'] text-gray-500 text-center">
                  {log.time}
                </div>

                {/* User (Avatar + Bold Name) */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 mt-1">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <span className="text-[16px] font-['Raleway'] font-bold text-[#223843]">
                    {log.user}
                  </span>
                </div>

                {/* Area */}
                <div className="text-[15px] font-['Raleway'] text-gray-500 text-center">
                  {log.area}
                </div>

                {/* Action Tag */}
                <div className="flex justify-center items-center">
                  <ActionTag action={log.action} />
                </div>

                {/* Item/Record */}
                <div className="text-[15px] font-['Raleway'] text-gray-500 text-center truncate px-2">
                  {log.record}
                </div>

                {/* Summary */}
                <div className="text-[15px] font-['Raleway'] text-gray-500 text-center truncate px-2">
                  {log.summary}
                </div>

                {/* Info Icon Button */}
                <div className="flex justify-center items-center">
                  <button className="w-6 h-6 bg-[#4a5c6a] hover:bg-[#223843] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center transition-colors focus:outline-none shadow-sm">
                    i
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

interface DynamicFilterInputProps {
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  borderRight?: boolean;
}

// Input component that sticks together perfectly
function DynamicFilterInput({ type, label, value, onChange, icon, borderRight }: DynamicFilterInputProps) {
  return (
    <div className={`relative flex items-center w-[150px] px-3 ${borderRight ? 'border-r border-gray-300' : ''}`}>
      <input
        type={type === "date" && !value ? "text" : type === "time" && !value ? "text" : type}
        placeholder={label}
        value={value}
        onChange={onChange}
        onFocus={(e) => (e.target.type = type)}
        onBlur={(e) => {
          if (!e.target.value) e.target.type = "text";
        }}
        className="w-full bg-transparent outline-none text-[14px] text-gray-500 placeholder-gray-400 cursor-pointer"
      />
      <div className="absolute right-3 flex items-center justify-center text-gray-400 pointer-events-none bg-white pl-1">
        {icon}
      </div>
    </div>
  );
}

// Action Tags strictly matched to image colors
function ActionTag({ action }: { action: string }) {
  let styleClasses = "";

  switch (action) {
    case "Adding":
      styleClasses = "bg-[#e2f9af] border-[#c8ef84] text-[#4a5c6a]";
      break;
    case "Updating":
      styleClasses = "bg-[#ffee99] border-[#ffe266] text-[#4a5c6a]";
      break;
    case "Deleting":
      styleClasses = "bg-[#ffba99] border-[#ff8b66] text-[#4a5c6a]";
      break;
    default:
      styleClasses = "bg-gray-100 border-gray-300 text-gray-500";
  }

  return (
    <div className={`h-[24px] px-4 flex items-center justify-center rounded-[10px] border ${styleClasses}`}>
      <span className="text-[13px] font-['Work_Sans'] font-medium leading-none whitespace-nowrap">
        {action}
      </span>
    </div>
  );
}