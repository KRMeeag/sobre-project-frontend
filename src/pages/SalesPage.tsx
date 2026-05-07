import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import {
  MagnifyingGlassIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
  HashtagIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface SaleItem {
  id: string;
  product_name: string;
  quantity: number;
  price_at_sale: number;
}

interface Receipt {
  id: string;
  invoice_no: string;
  created_at: string;
  subtotal: number;
  discount: number;
  total_price: number;
  total_cost?: number;
  total_items: number;
  users?: {
    username: string;
    photo?: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL;

export default function SalesPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemsAmount, setItemsAmount] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");

  const [revenueRange, setRevenueRange] = useState("30days");
  const [profitRange, setProfitRange] = useState("today");
  const [costRange, setCostRange] = useState("today");
  const [itemsRange, setItemsRange] = useState("all");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setAuthUserId(user.id);

        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        const storeId = userRes.data?.store_id;

        if (storeId) {
          const res = await axios.get(`${API_URL}/sales?store_id=${storeId}`);
          setReceipts(res.data);
        }
      } catch (err) {
        console.error("Failed to load sales", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch = r.invoice_no
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const receiptDateObj = new Date(r.created_at);
      const receiptDate = receiptDateObj.toISOString().split("T")[0];
      const matchesStartDate = startDate ? receiptDate >= startDate : true;
      const matchesEndDate = endDate ? receiptDate <= endDate : true;

      const hours = String(receiptDateObj.getHours()).padStart(2, "0");
      const minutes = String(receiptDateObj.getMinutes()).padStart(2, "0");
      const receiptTime = `${hours}:${minutes}`;

      const matchesStartTime = startTime ? receiptTime >= startTime : true;
      const matchesEndTime = endTime ? receiptTime <= endTime : true;
      const matchesItems = itemsAmount
        ? r.total_items.toString() === itemsAmount
        : true;

      const calculatedPct =
        r.subtotal > 0
          ? Math.round((1 - r.total_price / r.subtotal) * 100).toString()
          : "0";
      const matchesDiscount = discountFilter
        ? calculatedPct === discountFilter
        : true;

      return (
        matchesSearch &&
        matchesStartDate &&
        matchesEndDate &&
        matchesStartTime &&
        matchesEndTime &&
        matchesItems &&
        matchesDiscount
      );
    });
  }, [
    receipts,
    searchQuery,
    startDate,
    endDate,
    startTime,
    endTime,
    itemsAmount,
    discountFilter,
  ]);

  const isWithinRange = (dateString: string, range: string) => {
    if (range === "all") return true;

    const date = new Date(dateString);
    const now = new Date();

    if (range === "today") {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    const timeDiff = now.getTime() - date.getTime();
    if (range === "7days") return timeDiff <= 7 * 24 * 60 * 60 * 1000;
    if (range === "30days") return timeDiff <= 30 * 24 * 60 * 60 * 1000;

    return true;
  };

  const metrics = useMemo(() => {
    let revenue = 0;
    let profit = 0;
    let cost = 0;
    let items = 0;

    receipts.forEach((r) => {
      const rRevenue = r.total_price || 0;
      const rCost = r.total_cost || 0;
      const rProfit = rRevenue - rCost;
      const rItems = r.total_items || 0;

      if (isWithinRange(r.created_at, revenueRange)) revenue += rRevenue;
      if (isWithinRange(r.created_at, profitRange)) profit += rProfit;
      if (isWithinRange(r.created_at, costRange)) cost += rCost;
      if (isWithinRange(r.created_at, itemsRange)) items += rItems;
    });

    return { revenue, profit, cost, items };
  }, [receipts, revenueRange, profitRange, costRange, itemsRange]);

  const formatCurrency = (amount: number) => `P${amount.toFixed(2)}`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const InfoHeaderIcon = (
    <div className="w-6 h-6 bg-[#ada7a7] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center mx-auto shadow-sm">
      i
    </div>
  );

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
      <div className="hidden lg:block h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>
      
      {/* RESPONSIVE UPDATE: overflow-x-hidden and w-full applied */}
      <main className="flex-1 p-4 md:p-8 overflow-y-scroll overflow-x-hidden bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] transition-colors w-full">
        
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[#004385] font-['Raleway'] mb-1 md:mb-2">
            Sales Summary
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor your store's performance and transactions
          </p>
        </div>

        {/* RESPONSIVE UPDATE: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 w-full shrink-0">
          <SummaryCard title="Revenue" value={formatCurrency(metrics.revenue)} range={revenueRange} onRangeChange={setRevenueRange} />
          <SummaryCard title="Net Profit" value={formatCurrency(metrics.profit)} range={profitRange} onRangeChange={setProfitRange} />
          <SummaryCard title="Total Cost" value={formatCurrency(metrics.cost)} range={costRange} onRangeChange={setCostRange} />
          <SummaryCard title="Items Sold" value={metrics.items.toString()} range={itemsRange} onRangeChange={setItemsRange} />
        </div>

        {/* --- GRID BASED FILTERS (Matches HistoryPage exact layout) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full shrink-0">
          
          {/* 1. Search Bar */}
          <div className="relative w-full h-11 bg-white border border-gray-300 rounded-lg flex items-center px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
            <input
              type="text"
              placeholder="Search invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-w-0 bg-transparent outline-none text-[13px] sm:text-[14px] text-gray-700 placeholder-gray-400"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-2 shrink-0" strokeWidth={2} />
          </div>

          {/* 2. Time Filter */}
          <div className="flex w-full bg-white border border-gray-300 rounded-lg shadow-sm h-11 focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
            <DynamicFilterInput type="time" label="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} icon={<ClockIcon className="w-4 h-4" />} borderRight />
            <DynamicFilterInput type="time" label="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} icon={<ClockIcon className="w-4 h-4" />} />
          </div>

          {/* 3. Date Filter */}
          <div className="flex w-full bg-white border border-gray-300 rounded-lg shadow-sm h-11 focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
            <DynamicFilterInput type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} icon={<CalendarDaysIcon className="w-4 h-4" />} borderRight />
            <DynamicFilterInput type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} icon={<CalendarDaysIcon className="w-4 h-4" />} />
          </div>

          {/* 4. Items Amount and Discount Filter */}
          <div className="flex w-full gap-3">
            <div className="relative h-11 flex-1 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <input
                type="number"
                placeholder="Item Amount"
                value={itemsAmount}
                onChange={(e) => setItemsAmount(e.target.value)}
                className="w-full min-w-0 h-full bg-transparent outline-none text-[13px] sm:text-[14px] text-gray-700 pl-3 pr-8 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <HashtagIcon className="w-4 h-4 absolute right-2 sm:right-3 pointer-events-none text-gray-400" />
            </div>

            <div className="relative h-11 flex-1 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <input
                type="number"
                placeholder="Discount"
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className="w-full min-w-0 h-full bg-transparent outline-none text-[13px] sm:text-[14px] text-gray-700 pl-3 pr-8 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-2 sm:right-3 pointer-events-none text-gray-400 font-bold text-[13px] sm:text-[14px]">
                %
              </span>
            </div>
          </div>
        </div>

        {/* --- NATIVE SCROLLABLE TABLE (Replaces old DataTable for mobile layout) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-fixed min-w-[1000px] transition-all">
            <thead className="bg-[#f8f9fa] text-[#033860] text-xs uppercase tracking-wider font-bold border-b border-gray-200">
              <tr>
                <th className="p-4 w-[10%] text-center">Date</th>
                <th className="p-4 w-[10%] text-center">Time</th>
                <th className="p-4 w-[15%] text-left pl-6">User</th>
                <th className="p-4 w-[20%] text-center">Invoice Number</th>
                <th className="p-4 w-[10%] text-center">Subtotal</th>
                <th className="p-4 w-[10%] text-center">Discount</th>
                <th className="p-4 w-[10%] text-center">Total Price</th>
                <th className="p-4 w-[10%] text-center">Items Amount</th>
                <th className="p-4 w-[5%] text-center">{InfoHeaderIcon}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#223843]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385] mx-auto mb-2"></div>
                    Loading Data...
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No sales match your search filters.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r, index) => {
                  const discountPercentage = r.subtotal > 0 ? Math.round((1 - r.total_price / r.subtotal) * 100) : 0;
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}`}
                    >
                      <td className="p-4 text-center text-gray-500 whitespace-nowrap text-sm">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="p-4 text-center text-gray-500 whitespace-nowrap text-sm">
                        {formatTime(r.created_at)}
                      </td>

                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                            {r.users?.photo ? (
                              <img src={r.users.photo} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 mt-1">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            )}
                          </div>
                          <span className="font-bold text-[#223843] whitespace-nowrap text-sm">
                            {r.users?.username || "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center text-gray-500 truncate text-sm" title={r.invoice_no}>
                        {r.invoice_no}
                      </td>
                      <td className="p-4 text-center text-gray-500 text-sm">
                        {formatCurrency(r.subtotal)}
                      </td>
                      <td className="p-4 text-center text-gray-500 text-sm">
                        {discountPercentage}%
                      </td>
                      <td className="p-4 font-bold text-[#223843] text-center text-sm">
                        {formatCurrency(r.total_price)}
                      </td>
                      <td className="p-4 text-center text-gray-500 text-sm">
                        {r.total_items}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center">
                          <button
                            onClick={() => setSelectedReceiptId(r.id)}
                            className="w-6 h-6 bg-[#4a5c6a] hover:bg-[#002f5a] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none"
                          >
                            i
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selectedReceiptId && (
          <DetailsModal
            receiptId={selectedReceiptId}
            authUserId={authUserId}
            onClose={() => setSelectedReceiptId(null)}
          />
        )}
      </main>
    </div>
  );
}

// ---------------- Helper Components ----------------

interface SummaryCardProps {
  title: string;
  value: string;
  range: string;
  onRangeChange: (range: string) => void;
}

function SummaryCard({ title, value, range, onRangeChange }: SummaryCardProps) {
  return (
    <div className="bg-white px-4 sm:px-5 py-5 sm:py-6 rounded-2xl shadow-sm flex flex-col justify-center border border-gray-200 transition-shadow hover:shadow-md relative">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-2 xl:gap-0 w-full mb-2 sm:mb-3">
        <h3 className="text-[#a1a1aa] text-[11px] sm:text-[13px] font-bold tracking-wide uppercase">
          {title}
        </h3>
        <div className="relative self-start xl:self-auto">
          <select
            value={range}
            onChange={(e) => onRangeChange(e.target.value)}
            className="appearance-none bg-blue-50 text-[#087CA7] text-[10px] sm:text-[11px] font-bold py-1 pl-2 pr-6 rounded outline-none cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDownIcon
            className="w-3 h-3 absolute right-2 top-1.5 pointer-events-none text-[#087CA7]"
            strokeWidth={3}
          />
        </div>
      </div>
      <p className="text-[22px] sm:text-[32px] font-bold text-[#004385] font-['Arvo'] mt-1">
        {value}
      </p>
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

function DynamicFilterInput({ type, label, value, onChange, icon, borderRight }: DynamicFilterInputProps) {
  return (
    // min-w-0 prevents mobile screen stretching
    <div className={`relative flex items-center flex-1 min-w-0 px-2 sm:px-3 py-1 ${borderRight ? "border-r border-gray-300" : ""}`}>
      <input
        type={type === "date" && !value ? "text" : type === "time" && !value ? "text" : type}
        placeholder={label}
        value={value}
        onChange={onChange}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.target.type = type)}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          if (!e.target.value) e.target.type = "text";
        }}
        className="w-full min-w-0 bg-transparent outline-none text-[12px] sm:text-[13px] text-gray-700 placeholder-gray-400 cursor-pointer pr-6"
      />
      <div className="absolute right-2 flex items-center justify-center text-gray-400 pointer-events-none bg-white">
        {icon}
      </div>
    </div>
  );
}

function DetailsModal({ receiptId, authUserId, onClose }: { receiptId: string; authUserId: string | null; onClose: () => void }) {
  const [data, setData] = useState<{ receipt: Receipt; items: SaleItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/sales/${receiptId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [receiptId]);

  if (!data && loading) return null;

  const handleVoid = async () => {
    if (confirm("Are you sure you want to void this entire sale?")) {
      try {
        await axios.delete(`${API_URL}/sales/${receiptId}`, {
          data: { admin_user_id: authUserId },
        });
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Failed to void sale.");
      }
    }
  };

  const handleVoidItem = async (itemId: string, productName: string) => {
    if (confirm(`Are you sure you want to void ${productName}?`)) {
      try {
        await axios.delete(`${API_URL}/sales/${receiptId}/item/${itemId}`, {
          data: { admin_user_id: authUserId },
        });
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Failed to void item.");
      }
    }
  };

  const subtotal = data?.receipt?.subtotal || 0;
  const totalPrice = data?.receipt?.total_price || 0;
  const discountPercentage = subtotal > 0 ? Math.round((1 - totalPrice / subtotal) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-[#35435a]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-175 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="pt-6 px-4 sm:px-8 pb-4 flex justify-between items-center shrink-0">
          <h2 className="text-[14px] sm:text-[15px] font-['Work_Sans'] text-gray-500">
            Details for Invoice No.{" "}
            <span className="font-bold text-slate-800 break-all">
              {data?.receipt.invoice_no || "..."}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#b13e3e] transition-colors focus:outline-none ml-2"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Table - Wrapped in overflow-x-auto so it doesn't break modal bounds */}
        <div className="px-2 sm:px-8 overflow-y-auto overflow-x-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385]"></div>
            </div>
          ) : (
            <table className="w-full text-left min-w-[500px]">
              <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-100">
                <tr>
                  <th className="pb-4 pl-4 sm:pl-12 text-left font-normal">Item</th>
                  <th className="pb-4 text-center font-normal">Price</th>
                  <th className="pb-4 text-center font-normal">Amount</th>
                  <th className="pb-4 text-center font-normal">Subtotal</th>
                  <th className="pb-4 w-12 text-center font-normal">
                    <ArrowUturnLeftIcon className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] sm:text-[14px]">
                {data?.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-2 sm:pl-0">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 hidden sm:flex">
                          <span className="text-gray-400 text-[9px] sm:text-[10px] font-medium">Img</span>
                        </div>
                        <span className="font-bold text-slate-800 leading-tight max-w-24 sm:max-w-40 break-words">
                          {item.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      P{Number(item.price_at_sale).toFixed(2)}
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      P{(Number(item.price_at_sale) * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => handleVoidItem(item.id, item.product_name)}
                        title={`Void ${item.product_name}`}
                        className="p-1.5 bg-[#b13e3e] text-white rounded-md hover:bg-[#8c2d2d] transition-colors shadow-sm inline-flex focus:outline-none"
                      >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-0 border-t border-gray-100 bg-[#f8f9fa] shrink-0">
          <div className="space-y-2 text-[14px] sm:text-[15px] w-full sm:w-auto">
            <div className="flex justify-between w-full sm:w-64">
              <span className="font-bold text-gray-600">Subtotal:</span>
              <span className="text-gray-800 font-medium">P{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full sm:w-64">
              <span className="font-bold text-gray-600">Discount:</span>
              <span className="text-gray-800 font-medium">{discountPercentage}%</span>
            </div>
            <div className="flex justify-between w-full sm:w-64 pt-3 text-lg">
              <span className="font-extrabold text-[#004385]">Total Price:</span>
              <span className="font-extrabold text-[#004385]">P{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleVoid}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#b13e3e] hover:bg-[#8c2d2d] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-sm active:scale-95 text-[14px] sm:text-[15px] font-['Work_Sans'] focus:outline-none"
          >
            <ArrowUturnLeftIcon className="w-5 h-5 -scale-x-100" />
            Void Entire Sale
          </button>
        </div>

      </div>
    </div>
  );
}