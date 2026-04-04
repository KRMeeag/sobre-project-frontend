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
} from "@heroicons/react/24/outline";
import DataTable from "../components/DataTable";

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
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemsAmount, setItemsAmount] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
      
      const calculatedPct = r.subtotal > 0 ? Math.round((1 - (r.total_price / r.subtotal)) * 100).toString() : "0";
      const matchesDiscount = discountFilter ? calculatedPct === discountFilter : true;

      return matchesSearch && matchesStartDate && matchesEndDate && matchesStartTime && matchesEndTime && matchesItems && matchesDiscount;
    });
  }, [receipts, searchQuery, startDate, endDate, startTime, endTime, itemsAmount, discountFilter]);

  const totalProfit = filteredReceipts.reduce((sum, r) => sum + r.total_price, 0);
  const totalItems = filteredReceipts.reduce((sum, r) => sum + r.total_items, 0);

  const formatCurrency = (amount: number) => `P${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const InfoHeaderIcon = <div className="w-6 h-6 bg-[#ada7a7] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center mx-auto shadow-sm">i</div>;

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
      <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>
      
      <main className="flex-1 p-8 overflow-y-scroll bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] transition-colors">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#004385] font-['Raleway'] mb-2">Sales Summary</h1>
          <p className="text-gray-500 text-sm">Monitor your store's performance and transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 shrink-0">
          <SummaryCard title="This Month's Profit" value={formatCurrency(totalProfit)} />
          <SummaryCard title="Today's Net Profit" value="P5021.16" />
          <SummaryCard title="Today's Cost" value="P2546.78" />
          <SummaryCard title="Total Items Sold" value={totalItems.toString()} />
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 shrink-0 w-full">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64 h-11 bg-white border border-gray-300 rounded-lg flex items-center px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <input 
                type="text" 
                placeholder="Search invoice number..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-transparent outline-none text-[14px] text-gray-700 placeholder-gray-400" 
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-2 shrink-0" strokeWidth={2} />
            </div>

            <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm h-11 focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <DynamicFilterInput type="time" label="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} icon={<ClockIcon className="w-4 h-4" />} borderRight />
              <DynamicFilterInput type="time" label="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} icon={<ClockIcon className="w-4 h-4" />} />
            </div>

            <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm h-11 focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <DynamicFilterInput type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} icon={<CalendarDaysIcon className="w-4 h-4" />} borderRight />
              <DynamicFilterInput type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} icon={<CalendarDaysIcon className="w-4 h-4" />} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative h-11 w-full sm:w-44 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <input 
                type="number" 
                placeholder="Item Amount" 
                value={itemsAmount} 
                onChange={(e) => setItemsAmount(e.target.value)} 
                className="w-full h-full bg-transparent outline-none text-[14px] text-gray-700 pl-4 pr-10" 
              />
              <HashtagIcon className="w-4 h-4 absolute right-3 pointer-events-none text-gray-400" />
            </div>

            <div className="relative h-11 w-full sm:w-44 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#087CA7] focus-within:border-transparent transition-all">
              <input 
                type="number" 
                placeholder="Discount" 
                value={discountFilter} 
                onChange={(e) => setDiscountFilter(e.target.value)} 
                className="w-full h-full bg-transparent outline-none text-[14px] text-gray-700 pl-4 pr-10" 
              />
              <span className="absolute right-3 pointer-events-none text-gray-400 font-bold text-[14px]">%</span>
            </div>
          </div>

        </div>

        <DataTable 
          headers={[
            "Date", 
            "Time", 
            "User", 
            <span className="whitespace-nowrap px-2 block">Invoice Number</span>, // Fixed overlap
            "Subtotal", 
            "Discount", 
            <span className="whitespace-nowrap px-2 block">Total Price</span>,    // Ensure text wraps cleanly
            <span className="whitespace-nowrap px-2 block">Items Amount</span>,   // Ensure text wraps cleanly
            InfoHeaderIcon
          ]}
          loading={loading}
          empty={filteredReceipts.length === 0}
          emptyMessage="No sales match your search filters."
        >
          {filteredReceipts.map((r, index) => {
            const discountPercentage = r.subtotal > 0 ? Math.round((1 - (r.total_price / r.subtotal)) * 100) : 0;
            return (
              <tr 
                key={r.id} 
                className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}`}
              >
                <td className="p-4 text-center text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                <td className="p-4 text-center text-gray-500 whitespace-nowrap">{formatTime(r.created_at)}</td>
                
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0 overflow-hidden">
                      {r.users?.photo ? <img src={r.users.photo} alt="avatar" className="w-full h-full object-cover" /> : <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 mt-1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
                    </div>
                    <span className="font-bold text-[#223843] whitespace-nowrap">{r.users?.username || "Unknown"}</span>
                  </div>
                </td>

                <td className="p-4 text-center text-gray-500 truncate max-w-[120px] sm:max-w-[160px]" title={r.invoice_no}>{r.invoice_no}</td>
                <td className="p-4 text-center text-gray-500">{formatCurrency(r.subtotal)}</td>
                <td className="p-4 text-center text-gray-500">{discountPercentage}%</td>
                <td className="p-4 font-bold text-[#223843] text-center">{formatCurrency(r.total_price)}</td>
                <td className="p-4 text-center text-gray-500">{r.total_items}</td>
                
                <td className="p-4">
                  <div className="flex justify-center items-center">
                    <button onClick={() => setSelectedReceiptId(r.id)} className="w-6 h-6 bg-[#4a5c6a] hover:bg-[#002f5a] text-white rounded-full font-serif italic text-[13px] flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none">i</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>

        {selectedReceiptId && (
          <DetailsModal receiptId={selectedReceiptId} authUserId={authUserId} onClose={() => setSelectedReceiptId(null)} />
        )}
      </main>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white px-6 py-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center border border-gray-200 transition-shadow hover:shadow-md">
      <h3 className="text-[#a1a1aa] text-[15px] font-medium mb-3 tracking-wide">{title}</h3>
      <p className="text-[32px] font-bold text-[#004385] font-['Arvo']">{value}</p>
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
    <div className={`relative flex items-center w-32 sm:w-36 px-3 ${borderRight ? 'border-r border-gray-300' : ''}`}>
      <input
        type={type === "date" && !value ? "text" : type === "time" && !value ? "text" : type}
        placeholder={label}
        value={value}
        onChange={onChange}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.target.type = type)}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => { if (!e.target.value) e.target.type = "text"; }}
        className="w-full bg-transparent outline-none text-[13px] text-gray-700 placeholder-gray-400 cursor-pointer"
      />
      <div className="absolute right-3 flex items-center justify-center text-gray-400 pointer-events-none bg-white pl-1">
        {icon}
      </div>
    </div>
  );
}

function DetailsModal({ receiptId, authUserId, onClose }: { receiptId: string; authUserId: string | null; onClose: () => void; }) {
  const [data, setData] = useState<{ receipt: Receipt; items: SaleItem[]; } | null>(null);
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
          data: { admin_user_id: authUserId }
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
          data: { admin_user_id: authUserId }
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
  const discountPercentage = subtotal > 0 ? Math.round((1 - (totalPrice / subtotal)) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-[#35435a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-175 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="pt-6 px-8 pb-4 flex justify-between items-center">
          <h2 className="text-[15px] font-['Work_Sans'] text-gray-500">
            Details for Invoice No. <span className="font-bold text-slate-800">{data?.receipt.invoice_no || "..."}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#b13e3e] transition-colors focus:outline-none">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385]"></div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-[12px] text-gray-400 font-medium border-b border-gray-100">
                <tr>
                  <th className="pb-4 pl-12 text-center font-normal">Item</th>
                  <th className="pb-4 text-center font-normal">Price Individual</th>
                  <th className="pb-4 text-center font-normal">Amount</th>
                  <th className="pb-4 text-center font-normal">Subtotal</th>
                  <th className="pb-4 w-12 text-center font-normal"><ArrowUturnLeftIcon className="w-4 h-4 mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {data?.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                          <span className="text-gray-400 text-[10px] font-medium">Img</span>
                        </div>
                        <span className="font-bold text-slate-800 leading-tight max-w-30">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-gray-500">P{Number(item.price_at_sale).toFixed(2)}</td>
                    <td className="py-4 text-center text-gray-500">{item.quantity}</td>
                    <td className="py-4 text-center text-gray-500">P{(Number(item.price_at_sale) * item.quantity).toFixed(2)}</td>
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

        <div className="px-8 py-8 flex justify-between items-end border-t border-gray-100 bg-[#f8f9fa]">
          <div className="space-y-2 text-[15px]">
            <div className="flex justify-between w-64"><span className="font-bold text-gray-600">Subtotal:</span><span className="text-gray-800 font-medium">P{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between w-64"><span className="font-bold text-gray-600">Discount:</span><span className="text-gray-800 font-medium">{discountPercentage}%</span></div>
            <div className="flex justify-between w-64 pt-3 text-lg"><span className="font-extrabold text-[#004385]">Total Price:</span><span className="font-extrabold text-[#004385]">P{totalPrice.toFixed(2)}</span></div>
          </div>

          <button onClick={handleVoid} className="flex items-center gap-2 bg-[#b13e3e] hover:bg-[#8c2d2d] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-sm active:scale-95 text-[15px] font-['Work_Sans'] focus:outline-none">
            <ArrowUturnLeftIcon className="w-5 h-5 -scale-x-100" />
            Void Entire Sale
          </button>
        </div>
      </div>
    </div>
  );
}