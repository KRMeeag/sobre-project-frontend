import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import DataTable from "../components/DataTable";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import InventoryAuditModal from "../components/InventoryAuditModal";

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
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null,
  );
  const [selectedInventoryLog, setSelectedInventoryLog] =
    useState<AuditLog | null>(null);

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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        const storeId = userRes.data?.store_id;

        if (storeId) {
          const logRes = await axios.get(
            `${API_URL}/audit?store_id=${storeId}`,
          );
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
    const [hours, minutes] = sqlTime.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const formatUIDate = (sqlDate: string) => {
    const date = new Date(sqlDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.users?.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter ? log.action === actionFilter : true;
      const matchesArea = areaFilter ? log.area === areaFilter : true;
      const matchesStartDate = startDate ? log.date >= startDate : true;
      const matchesEndDate = endDate ? log.date <= endDate : true;

      const timePrefix = log.timestamp.slice(0, 5);
      const matchesStartTime = startTime ? timePrefix >= startTime : true;
      const matchesEndTime = endTime ? timePrefix <= endTime : true;

      return (
        matchesSearch &&
        matchesAction &&
        matchesArea &&
        matchesStartDate &&
        matchesEndDate &&
        matchesStartTime &&
        matchesEndTime
      );
    });
  }, [
    logs,
    searchQuery,
    actionFilter,
    areaFilter,
    startDate,
    endDate,
    startTime,
    endTime,
  ]);

  const InfoHeaderIcon = (
    <div className="w-6 h-6 bg-[#ada7a7] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center mx-auto shadow-sm">
      i
    </div>
  );

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
      <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>

      <main className="flex-1 p-8 overflow-y-scroll bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] transition-colors">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#004385] font-['Raleway'] mb-2">
            Audit History
          </h1>
          <p className="text-gray-500 text-sm">
            Track user actions and system changes
          </p>
        </div>

        {/* --- RESTRUCTURED FILTER SECTION --- */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 shrink-0 w-full">
          {/* LEFT GROUP: Search, Time, and Date grouped together */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64 h-11 bg-white border border-gray-300 rounded-lg flex items-center px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <input
                type="text"
                placeholder="Search by user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-gray-700 placeholder-gray-400"
              />
              <MagnifyingGlassIcon
                className="w-5 h-5 text-gray-400 ml-2 shrink-0"
                strokeWidth={2}
              />
            </div>

            <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm h-11 focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <DynamicFilterInput
                type="time"
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                icon={<ClockIcon className="w-4 h-4" />}
                borderRight
              />
              <DynamicFilterInput
                type="time"
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                icon={<ClockIcon className="w-4 h-4" />}
              />
            </div>

            <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm h-11 focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <DynamicFilterInput
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={<CalendarDaysIcon className="w-4 h-4" />}
                borderRight
              />
              <DynamicFilterInput
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                icon={<CalendarDaysIcon className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* RIGHT GROUP: Action and Area */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative h-11 w-full sm:w-40 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-gray-700 pl-4 pr-10 appearance-none cursor-pointer"
              >
                <option value="">Action</option>
                <option value="Adding">Adding</option>
                <option value="Updating">Updating</option>
                <option value="Deleting">Deleting</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 pointer-events-none text-gray-400" />
            </div>

            <div className="relative h-11 w-full sm:w-40 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full h-full bg-transparent outline-none text-[14px] text-gray-700 pl-4 pr-10 appearance-none cursor-pointer"
              >
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

        <DataTable
          headers={[
            "Date",
            "Time",
            "User",
            "Area",
            "Action",
            <span className="whitespace-nowrap px-2 block">Item/Record</span>, // Fixed overlap
            <span className="whitespace-nowrap px-2 block">Summary</span>, // Fixed overlap
            InfoHeaderIcon,
          ]}
          loading={loading}
          empty={filteredLogs.length === 0}
          emptyMessage="No audit logs match your filters."
        >
          {filteredLogs.map((log, index) => (
            <tr
              key={log.id}
              className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}`}
            >
              <td className="p-4 text-center text-gray-500 whitespace-nowrap">
                {formatUIDate(log.date)}
              </td>
              <td className="p-4 text-center text-gray-500 whitespace-nowrap">
                {formatUITime(log.timestamp)}
              </td>

              <td className="p-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0 overflow-hidden">
                    {log.users?.photo ? (
                      <img
                        src={log.users.photo}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="white"
                        className="w-5 h-5 mt-1"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <span className="font-bold text-[#223843] whitespace-nowrap">
                    {log.users?.username || "Unknown"}
                  </span>
                </div>
              </td>

              <td className="p-4 text-center text-gray-500 whitespace-nowrap">
                {log.area}
              </td>

              <td className="p-4">
                <div className="flex justify-center items-center">
                  <ActionTag action={log.action} />
                </div>
              </td>

              <td
                className="p-4 text-center text-gray-500 truncate max-w-30 sm:max-w-45"
                title={log.item}
              >
                {log.item}
              </td>
              <td
                className="p-4 text-center text-gray-500 truncate max-w-37.5 sm:max-w-50"
                title={log.summary}
              >
                {log.summary}
              </td>

              <td className="p-4">
                <div className="flex justify-center items-center">
                  {log.receipt_id ? (
                    <button
                      onClick={() => setSelectedReceiptId(log.receipt_id)}
                      className="w-6 h-6 bg-[#4a5c6a] hover:bg-[#002f5a] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center transition-colors focus:outline-none shadow-sm cursor-pointer"
                      title="View Invoice"
                    >
                      i
                    </button>
                  ) : log.area === "Inventory" ? (
                    // NEW: Button for Inventory Details
                    <button
                      onClick={() => setSelectedInventoryLog(log)}
                      className="w-6 h-6 bg-[#4a5c6a] hover:bg-[#002f5a] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center transition-colors focus:outline-none shadow-sm cursor-pointer"
                      title="View Inventory Updates"
                    >
                      i
                    </button>
                  ) : (
                    <div className="w-6 h-6 bg-[#ada7a7] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center shadow-sm">
                      i
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </main>

      <InvoiceDetailsModal
        isOpen={!!selectedReceiptId}
        onClose={() => setSelectedReceiptId(null)}
        receiptId={selectedReceiptId}
      />

      <InventoryAuditModal
        isOpen={!!selectedInventoryLog}
        onClose={() => setSelectedInventoryLog(null)}
        log={selectedInventoryLog}
      />
    </div>
  );
}

interface DynamicFilterInputProps {
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  borderRight?: boolean;
}

function DynamicFilterInput({
  type,
  label,
  value,
  onChange,
  icon,
  borderRight,
}: DynamicFilterInputProps) {
  return (
    <div
      className={`relative flex items-center w-32 sm:w-36 px-3 ${borderRight ? "border-r border-gray-300" : ""}`}
    >
      <input
        type={
          type === "date" && !value
            ? "text"
            : type === "time" && !value
              ? "text"
              : type
        }
        placeholder={label}
        value={value}
        onChange={onChange}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
          (e.target.type = type)
        }
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          if (!e.target.value) e.target.type = "text";
        }}
        className="w-full bg-transparent outline-none text-[13px] text-gray-700 placeholder-gray-400 cursor-pointer"
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
    case "Adding": // Matches Inventory Green
      styleClasses = "bg-[#daf4a6] text-[#4b6618]"; 
      break;
    case "Updating": // Matches Inventory Yellow
      styleClasses = "bg-[#fff5b8] text-[#8c7e00]"; 
      break;
    case "Deleting": // Matches Inventory Red
      styleClasses = "bg-[#ffccc7] text-[#8c2d2d]"; 
      break;
    default:
      styleClasses = "bg-gray-100 text-gray-500";
  }

  return (
    <div className={`px-3 py-1 inline-flex items-center justify-center rounded-full text-xs font-bold shadow-sm ${styleClasses}`}>
      <span className="font-['Work_Sans'] leading-none whitespace-nowrap">{action}</span>
    </div>
  );
}
