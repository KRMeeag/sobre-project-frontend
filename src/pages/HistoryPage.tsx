import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

// Import your components
import DataTable from "../components/DataTable";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal"; 

const API_URL = import.meta.env.VITE_API_URL;

interface AuditLog {
  id: string;
  date: string;
  timestamp: string;
  area: string;
  action: string;
  item: string;
  summary: string;
  receipt_id: string | null; 
  users: {
    username: string;
    photo: string;
  };
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        const storeId = userRes.data?.store_id;

        if (storeId) {
          const logRes = await axios.get(`${API_URL}/audit?store_id=${storeId}`);
          setLogs(logRes.data);
        }
      } catch (err) {
        console.error("Failed to load audit history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatUITime = (sqlTime: string) => {
    const [hours, minutes] = sqlTime.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const formatUIDate = (sqlDate: string) => {
    const date = new Date(sqlDate);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.users?.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter ? log.action === actionFilter : true;
      const matchesArea = areaFilter ? log.area === areaFilter : true;
      const matchesStartDate = startDate ? log.date >= startDate : true;
      const matchesEndDate = endDate ? log.date <= endDate : true;
      
      const timePrefix = log.timestamp.slice(0, 5); 
      const matchesStartTime = startTime ? timePrefix >= startTime : true;
      const matchesEndTime = endTime ? timePrefix <= endTime : true;

      return matchesSearch && matchesAction && matchesArea && 
             matchesStartDate && matchesEndDate && 
             matchesStartTime && matchesEndTime;
    });
  }, [logs, searchQuery, actionFilter, areaFilter, startDate, endDate, startTime, endTime]);

  // CSS Grid Template for History
  const tableGridTemplate = "160px 140px 1fr 160px 140px 200px 250px 80px";

  // The Info Icon Header
  const InfoHeaderIcon = (
    <div className="w-6 h-6 bg-[#ada7a7] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center mx-auto shadow-sm">
      i
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#e9e9e9] font-['Work_Sans']">
      <div className="w-full h-13 bg-[#002f5a] shrink-0 shadow-sm"></div>

      <div className="p-8 flex-1 flex flex-col w-full max-w-[1500px] mx-auto overflow-hidden">
        
        <h1 className="text-[28px] font-bold font-['Raleway'] text-[#223843] mb-6">
          Audit History
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
          <div className="relative w-85 h-11 bg-white border border-gray-300 rounded-md flex items-center px-4 shadow-sm focus-within:border-[#002f5a] transition-colors">
            <input type="text" placeholder="Search by user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent outline-none text-[15px] text-[#223843] placeholder-gray-400" />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-2 shrink-0" strokeWidth={2} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-white border border-gray-300 rounded-md shadow-sm h-11">
              <DynamicFilterInput type="time" label="Start Time..." value={startTime} onChange={(e) => setStartTime(e.target.value)} icon={<ClockIcon className="w-4 h-4" />} borderRight />
              <DynamicFilterInput type="time" label="End Time..." value={endTime} onChange={(e) => setEndTime(e.target.value)} icon={<ClockIcon className="w-4 h-4" />} />
            </div>

            <div className="flex bg-white border border-gray-300 rounded-md shadow-sm h-11">
              <DynamicFilterInput type="date" label="Start Date..." value={startDate} onChange={(e) => setStartDate(e.target.value)} icon={<CalendarDaysIcon className="w-4 h-4" />} borderRight />
              <DynamicFilterInput type="date" label="End Date..." value={endDate} onChange={(e) => setEndDate(e.target.value)} icon={<CalendarDaysIcon className="w-4 h-4" />} />
            </div>

            <div className="relative h-11 bg-white border border-gray-300 rounded-md shadow-sm flex items-center min-w-32.5">
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-full h-full bg-transparent outline-none text-[15px] text-gray-500 pl-4 pr-10 appearance-none cursor-pointer">
                <option value="">Action</option>
                <option value="Adding">Adding</option>
                <option value="Updating">Updating</option>
                <option value="Deleting">Deleting</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 pointer-events-none text-gray-400" />
            </div>

            <div className="relative h-11 bg-white border border-gray-300 rounded-md shadow-sm flex items-center min-w-32.5">
              <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="w-full h-full bg-transparent outline-none text-[15px] text-gray-500 pl-4 pr-10 appearance-none cursor-pointer">
                <option value="">Area</option>
                <option value="Inventory">Inventory</option>
                <option value="Sales">Sales</option>
                <option value="System Settings">System Settings</option>
                <option value="Profile">Profile</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>

        {/* Generic Data Table */}
        <DataTable 
          headers={["Date", "Time", "User", "Area", "Action", "Item/Record", "Summary", InfoHeaderIcon]}
          gridTemplate={tableGridTemplate}
          loading={loading}
          empty={filteredLogs.length === 0}
          emptyMessage="No audit logs match your filters."
        >
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="grid items-center px-8 h-17.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              style={{ gridTemplateColumns: tableGridTemplate }}
            >
              <div className="text-[15px] font-['Raleway'] text-gray-500 text-center">{formatUIDate(log.date)}</div>
              <div className="text-[15px] font-['Raleway'] text-gray-500 text-center">{formatUITime(log.timestamp)}</div>

              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0 overflow-hidden">
                  {log.users?.photo ? (
                    <img src={log.users.photo} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 mt-1">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <span className="text-[16px] font-['Raleway'] font-bold text-[#223843]">
                  {log.users?.username || "Unknown"}
                </span>
              </div>

              <div className="text-[15px] font-['Raleway'] text-gray-500 text-center">{log.area}</div>
              
              <div className="flex justify-center items-center">
                <ActionTag action={log.action} />
              </div>

              <div className="text-[15px] font-['Raleway'] text-gray-500 text-center truncate px-2">{log.item}</div>
              <div className="text-[15px] font-['Raleway'] text-gray-500 text-center truncate px-2">{log.summary}</div>

              <div className="flex justify-center items-center">
                {log.receipt_id ? (
                  <button 
                    onClick={() => setSelectedReceiptId(log.receipt_id)}
                    className="w-6 h-6 bg-[#4a5c6a] hover:bg-[#223843] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center transition-colors focus:outline-none shadow-sm cursor-pointer"
                    title="View Invoice"
                  >
                    i
                  </button>
                ) : (
                  <div className="w-6 h-6 bg-[#ada7a7] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center shadow-sm">
                    i
                  </div>
                )}
              </div>
            </div>
          ))}
        </DataTable>

      </div>

      <InvoiceDetailsModal 
        isOpen={!!selectedReceiptId}
        onClose={() => setSelectedReceiptId(null)}
        receiptId={selectedReceiptId}
      />
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

function DynamicFilterInput({ type, label, value, onChange, icon, borderRight }: DynamicFilterInputProps) {
  return (
    <div className={`relative flex items-center w-37.5 px-3 ${borderRight ? 'border-r border-gray-300' : ''}`}>
      <input
        type={type === "date" && !value ? "text" : type === "time" && !value ? "text" : type}
        placeholder={label}
        value={value}
        onChange={onChange}
        onFocus={(e) => (e.target.type = type)}
        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
        className="w-full bg-transparent outline-none text-[14px] text-gray-500 placeholder-gray-400 cursor-pointer"
      />
      <div className="absolute right-3 flex items-center justify-center text-gray-400 pointer-events-none bg-white pl-1">
        {icon}
      </div>
    </div>
  );
}

function ActionTag({ action }: { action: string }) {
  let styleClasses = "";
  switch (action) {
    case "Adding": styleClasses = "bg-[#e2f9af] border-[#c8ef84] text-[#4a5c6a]"; break;
    case "Updating": styleClasses = "bg-[#ffee99] border-[#ffe266] text-[#4a5c6a]"; break;
    case "Deleting": styleClasses = "bg-[#ffba99] border-[#ff8b66] text-[#4a5c6a]"; break;
    default: styleClasses = "bg-gray-100 border-gray-300 text-gray-500";
  }

  return (
    <div className={`h-6 px-4 flex items-center justify-center rounded-[10px] border ${styleClasses}`}>
      <span className="text-[13px] font-['Work_Sans'] font-medium leading-none whitespace-nowrap">{action}</span>
    </div>
  );
}