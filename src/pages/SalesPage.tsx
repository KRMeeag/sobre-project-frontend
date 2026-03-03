import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  MagnifyingGlassIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";

// --- TYPES ---
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

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemsAmount, setItemsAmount] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${API_URL}/sales`);
      setReceipts(res.data);
    } catch (err) {
      console.error("Failed to load sales", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch = r.invoice_no.toLowerCase().includes(searchQuery.toLowerCase());
      const receiptDateObj = new Date(r.created_at);

      const receiptDate = receiptDateObj.toISOString().split("T")[0];
      const matchesStartDate = startDate ? receiptDate >= startDate : true;
      const matchesEndDate = endDate ? receiptDate <= endDate : true;

      const hours = String(receiptDateObj.getHours()).padStart(2, "0");
      const minutes = String(receiptDateObj.getMinutes()).padStart(2, "0");
      const receiptTime = `${hours}:${minutes}`;

      const matchesStartTime = startTime ? receiptTime >= startTime : true;
      const matchesEndTime = endTime ? receiptTime <= endTime : true;

      const matchesItems = itemsAmount ? r.total_items.toString() === itemsAmount : true;
      const matchesDiscount = discountFilter ? r.discount.toString() === discountFilter : true;

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
  }, [receipts, searchQuery, startDate, endDate, startTime, endTime, itemsAmount, discountFilter]);

  const totalProfit = filteredReceipts.reduce((sum, r) => sum + r.total_price, 0);
  const totalItems = filteredReceipts.reduce((sum, r) => sum + r.total_items, 0);

  const formatCurrency = (amount: number) => `P${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e9e9e9] font-['Work_Sans'] text-[#223843]">
      <div className="w-full h-13 bg-[#002f5a] shrink-0"></div>

      <div className="p-8 flex-1">
        <h1 className="text-[28px] font-bold font-['Arvo'] mb-6 text-slate-800">Sales Summary</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard title="Total Profit (Filtered)" value={formatCurrency(totalProfit)} />
          <SummaryCard title="Today's Net Profit" value="P5021.16" />
          <SummaryCard title="Today's Cost" value="P2546.78" />
          <SummaryCard title="Total Items Sold (Filtered)" value={totalItems.toString()} />
        </div>

        <h1 className="text-[28px] font-bold font-['Arvo'] mb-4 text-slate-800">Sales History</h1>

        {/* --- FULL WIDTH ALIGNED FILTERS BAR --- */}
        <div className="flex w-full justify-between items-center gap-3 mb-4">
          
          {/* Search Bar - Stretches slightly to fill empty space if needed */}
          <div className="relative flex-1 max-w-70 bg-white border border-gray-200 rounded-md overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number..."
              className="w-full pl-4 pr-10 py-2.5 text-[13px] outline-none text-gray-600 placeholder-gray-400"
            />
            <MagnifyingGlassIcon className="w-4.5 h-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Time Filters Group */}
          <div className="flex bg-white border border-gray-200 rounded-md divide-x divide-gray-200 overflow-hidden shrink-0">
            <DynamicFilterInput
              type="time"
              label="Start Time..."
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              icon={<ClockIcon className="w-3.5 h-3.5" />}
            />
            <DynamicFilterInput
              type="time"
              label="End Time..."
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              icon={<ClockIcon className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Date Filters Group */}
          <div className="flex bg-white border border-gray-200 rounded-md divide-x divide-gray-200 overflow-hidden shrink-0">
            <DynamicFilterInput
              type="date"
              label="Start Date..."
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              icon={<CalendarDaysIcon className="w-3.5 h-3.5" />}
            />
            <DynamicFilterInput
              type="date"
              label="End Date..."
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              icon={<CalendarDaysIcon className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Items Amount Filter */}
          <div className="relative w-35 bg-white border border-gray-200 rounded-md overflow-hidden flex items-center shrink-0">
            <input
              type="number"
              placeholder="Items Amount"
              value={itemsAmount}
              onChange={(e) => setItemsAmount(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 text-[13px] outline-none text-gray-600 placeholder-gray-400"
            />
            <div className="absolute right-2 flex items-center justify-center w-6 h-6 rounded border border-gray-200 bg-white text-gray-400 pointer-events-none">
              <HashtagIcon className="w-3 h-3" />
            </div>
            {itemsAmount && (
              <button onClick={() => setItemsAmount("")} className="absolute right-9 text-gray-300 hover:text-red-400">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Discount Filter */}
          <div className="relative w-30 bg-white border border-gray-200 rounded-md overflow-hidden flex items-center shrink-0">
            <input
              type="number"
              placeholder="Discount"
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 text-[13px] outline-none text-gray-600 placeholder-gray-400"
            />
            <div className="absolute right-2 flex items-center justify-center w-6 h-6 rounded border border-gray-200 bg-white text-gray-400 pointer-events-none font-bold text-[11px]">
              %
            </div>
            {discountFilter && (
              <button onClick={() => setDiscountFilter("")} className="absolute right-9 text-gray-300 hover:text-red-400">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* 3. TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-[11px] uppercase text-gray-400 font-bold tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium text-center">Date</th>
                <th className="px-6 py-4 font-medium text-center">Time</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium text-center">Invoice Number</th>
                <th className="px-6 py-4 font-medium text-center">Subtotal</th>
                <th className="px-6 py-4 font-medium text-center">Discount</th>
                <th className="px-6 py-4 font-medium text-center">Total Price</th>
                <th className="px-6 py-4 font-medium text-center">Items Amount</th>
                <th className="px-6 py-4 text-center">
                  <div className="w-5 h-5 bg-gray-400 text-white rounded-full font-serif italic text-xs flex items-center justify-center mx-auto">
                    i
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">No sales match your search.</td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-center">{formatDate(r.created_at)}</td>
                    <td className="px-6 py-4 text-gray-500 text-center">{formatTime(r.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {r.users?.photo ? (
                          <img src={r.users.photo} className="w-8 h-8 rounded-full" alt="avatar" />
                        ) : (
                          <UserCircleIcon className="w-8 h-8 text-gray-300" />
                        )}
                        <span className="font-bold text-[#223843]">{r.users?.username || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-center">{r.invoice_no}</td>
                    <td className="px-6 py-4 text-gray-500 text-center">{formatCurrency(r.subtotal)}</td>
                    <td className="px-6 py-4 text-gray-500 text-center">{r.discount}%</td>
                    <td className="px-6 py-4 text-gray-500 text-center">{formatCurrency(r.total_price)}</td>
                    <td className="px-6 py-4 text-gray-500 text-center">{r.total_items}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedReceiptId(r.id)}
                        className="text-gray-400 hover:text-gray-700 transition-colors inline-flex justify-center focus:outline-none"
                      >
                        <div className="w-5 h-5 bg-gray-600 hover:bg-[#002f5a] text-white rounded-full font-serif italic text-xs flex items-center justify-center transition-colors">
                          i
                        </div>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. DETAILS MODAL */}
        {selectedReceiptId && (
          <DetailsModal
            receiptId={selectedReceiptId}
            onClose={() => setSelectedReceiptId(null)}
          />
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white px-6 py-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center border border-gray-100">
      <h3 className="text-[#a1a1aa] text-[15px] font-medium mb-3 tracking-wide">{title}</h3>
      <p className="text-[32px] font-bold text-slate-800 font-['Arvo']">{value}</p>
    </div>
  );
}

interface DynamicFilterInputProps {
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;
  icon: React.ReactNode;
}

// Rewritten to match the circular icons
function DynamicFilterInput({ type, label, value, onChange, icon }: DynamicFilterInputProps) {
  return (
    <div className="relative flex items-center w-37.5 bg-white focus-within:bg-gray-50 transition-colors">
      <input
        type={type === "date" && !value ? "text" : type === "time" && !value ? "text" : type}
        placeholder={label}
        value={value}
        onChange={onChange}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.target.type = type)}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          if (!e.target.value) e.target.type = "text";
        }}
        className="w-full pl-4 pr-10 py-2.5 bg-transparent outline-none text-[13px] text-gray-600 placeholder-gray-400 cursor-pointer"
      />
      {value ? (
        <button
          onClick={() => onChange({ target: { value: "" } })}
          className="absolute right-2.5 text-gray-400 hover:text-red-500 bg-white"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      ) : (
        <div className="absolute right-2.5 flex items-center justify-center w-6 h-6 bg-[#f0f2f5] rounded-full text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  );
}

// --- MODAL COMPONENT ---
// (Leave your existing DetailsModal component here exactly as it is)

// --- MODAL COMPONENT ---
// (Leave the DetailsModal component identical to your current working version)
// --- MODAL COMPONENT (Unchanged from previous revision) ---

function DetailsModal({
  receiptId,
  onClose,
}: {
  receiptId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<{
    receipt: Receipt;
    items: SaleItem[];
  } | null>(null);
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
    if (confirm("Are you sure you want to void this sale?")) {
      await axios.delete(`${API_URL}/sales/${receiptId}`);
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#35435a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-175 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="pt-6 px-8 pb-4 flex justify-between items-center">
          <h2 className="text-[15px] font-['Work_Sans'] text-gray-500">
            Details for Invoice No.{" "}
            <span className="font-bold text-slate-800">
              {data?.receipt.invoice_no || "00004654"}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (List) */}
        <div className="px-8 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <p className="text-center py-4 text-gray-500">Loading...</p>
          ) : (
            <table className="w-full text-left">
              <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-100">
                <tr>
                  <th className="pb-4 pl-12 text-center font-normal">Item</th>
                  <th className="pb-4 text-center font-normal">
                    Price
                    <br />
                    Individual
                  </th>
                  <th className="pb-4 text-center font-normal">Amount</th>
                  <th className="pb-4 text-center font-normal">Subtotal</th>
                  <th className="pb-4 w-12 text-center font-normal">
                    <ArrowUturnLeftIcon className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {data?.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                          <img
                            src="/assets/background1.png"
                            alt="item"
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                        <span className="font-bold text-slate-800 leading-tight max-w-30">
                          {item.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      P{item.price_at_sale.toFixed(2)}
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      P{(item.price_at_sale * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button className="p-1.5 bg-[#b13e3e] text-white rounded-md hover:bg-red-800 transition-colors shadow-sm inline-flex focus:outline-none">
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
        <div className="px-8 py-8 flex justify-between items-end">
          <div className="space-y-2 text-[15px]">
            <div className="flex justify-between w-64">
              <span className="font-bold text-slate-800">Subtotal:</span>
              <span className="text-slate-800 font-medium">
                P{data?.receipt.subtotal.toFixed(2) || "500.00"}
              </span>
            </div>
            <div className="flex justify-between w-64">
              <span className="font-bold text-slate-800">Discount:</span>
              <span className="text-slate-800 font-medium">
                {data?.receipt.discount || "12"}%
              </span>
            </div>
            <div className="flex justify-between w-64 pt-3 text-lg">
              <span className="font-extrabold text-slate-800">
                Total Price:
              </span>
              <span className="font-extrabold text-slate-800">
                P{data?.receipt.total_price.toFixed(2) || "440.00"}
              </span>
            </div>
          </div>

          <button
            onClick={handleVoid}
            className="flex items-center gap-2 bg-[#b13e3e] hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-sm active:scale-95 text-[15px] font-['Work_Sans'] focus:outline-none"
          >
            <ArrowUturnLeftIcon className="w-5 h-5 -scale-x-100" />
            Void Entire Sale
          </button>
        </div>
      </div>
    </div>
  );
}
