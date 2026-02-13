import { useState, useEffect } from "react";
import axios from "axios";
import { 
  MagnifyingGlassIcon, 
  InformationCircleIcon, 
  ArrowUturnLeftIcon, 
  XMarkIcon 
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

  // Fetch Data on Load
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      // In a real app, you'd pass the store_id here
      const res = await axios.get(`${API_URL}/sales`);
      setReceipts(res.data);
    } catch (err) {
      console.error("Failed to load sales", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULATE SUMMARY STATS (Client-side for now) ---
  const totalProfit = receipts.reduce((sum, r) => sum + r.total_price, 0); // Simplified logic
  const totalItems = receipts.reduce((sum, r) => sum + r.total_items, 0);
  
  // Formatter helpers
  const formatCurrency = (amount: number) => `₱${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-8 bg-[#f3f4f6] min-h-screen font-['Work_Sans'] text-[#223843]">
      
      {/* 1. SALES SUMMARY SECTION */}
      <h1 className="text-2xl font-bold font-['Arvo'] mb-6 text-[#223843]">Sales Summary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard title="This Month's Profit" value={formatCurrency(totalProfit)} />
        <SummaryCard title="Today's Net Profit" value="₱5,021.16" /> 
        <SummaryCard title="Today's Cost" value="₱2,546.78" />
        <SummaryCard title="Total Items Sold" value={totalItems.toString()} />
      </div>

      {/* 2. SALES HISTORY SECTION */}
      <h1 className="text-2xl font-bold font-['Arvo'] mb-4 text-[#223843]">Sales History</h1>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-50px">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by invoice number..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#087CA7]"
          />
        </div>
        
        {/* Mock Filters for UI match */}
        <FilterButton label="Start Time..." icon="clock" />
        <FilterButton label="End Time..." icon="clock" />
        <FilterButton label="Start Date..." icon="calendar" />
        <FilterButton label="End Date..." icon="calendar" />
        <FilterButton label="Items Amount #" />
        <FilterButton label="Discount %" />
      </div>

      {/* 3. TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-bold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Invoice Number</th>
              <th className="px-6 py-4">Subtotal</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Total Price</th>
              <th className="px-6 py-4 text-center">Items Amount</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8">Loading...</td></tr>
            ) : receipts.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600">{formatDate(r.created_at)}</td>
                <td className="px-6 py-4 text-gray-600">{formatTime(r.created_at)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {r.users?.photo ? (
                      <img src={r.users.photo} className="w-6 h-6 rounded-full" alt="avatar" />
                    ) : (
                      <UserCircleIcon className="w-6 h-6 text-gray-300" />
                    )}
                    <span className="font-bold text-[#223843]">{r.users?.username || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono">{r.invoice_no}</td>
                <td className="px-6 py-4 text-gray-600">{formatCurrency(r.subtotal)}</td>
                <td className="px-6 py-4 text-gray-600">{r.discount}%</td>
                <td className="px-6 py-4 font-bold text-[#223843]">{formatCurrency(r.total_price)}</td>
                <td className="px-6 py-4 text-center">{r.total_items}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedReceiptId(r.id)}
                    className="text-gray-400 hover:text-[#087CA7] transition-colors"
                  >
                    <InformationCircleIcon className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            ))}
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
  );
}

// --- SUB-COMPONENTS ---

function SummaryCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center h-32">
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[#223843] font-['Arvo']">{value}</p>
    </div>
  );
}

function FilterButton({ label, icon }: { label: string, icon?: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-500 hover:bg-gray-200 transition-colors">
      {label}
      {/* Simple icon logic based on props */}
      {icon === 'calendar' && <span className="text-lg">📅</span>}
      {icon === 'clock' && <span className="text-lg">🕒</span>}
    </button>
  );
}

// --- MODAL COMPONENT ---

function DetailsModal({ receiptId, onClose }: { receiptId: string, onClose: () => void }) {
  const [data, setData] = useState<{ receipt: Receipt, items: SaleItem[] } | null>(null);
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
    if(confirm("Are you sure you want to void this sale?")) {
      await axios.delete(`${API_URL}/sales/${receiptId}`);
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-['Work_Sans'] text-gray-600">
            Details for Invoice No. <span className="font-bold text-[#223843]">{data?.receipt.invoice_no}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (List) */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? <p className="text-center">Loading...</p> : (
            <table className="w-full text-left">
              <thead className="text-xs text-gray-400 font-bold uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3 pl-2">Item</th>
                  <th className="pb-3 text-right">Price Individual</th>
                  <th className="pb-3 text-center">Amount</th>
                  <th className="pb-3 text-right">Subtotal</th>
                  <th className="pb-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data?.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        {/* Placeholder Image since Inventory image not in schema */}
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">
                          📦
                        </div>
                        <span className="font-bold text-[#223843]">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-gray-600">₱{item.price_at_sale.toFixed(2)}</td>
                    <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-4 text-right font-medium text-gray-800">₱{(item.price_at_sale * item.quantity).toFixed(2)}</td>
                    <td className="py-4 text-right">
                      <button className="p-1 bg-[#b13e3e] text-white rounded hover:bg-red-700 transition">
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
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-end">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between w-48">
              <span className="font-bold text-[#223843]">Subtotal:</span>
              <span className="text-gray-600">₱{data?.receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48">
              <span className="font-bold text-[#223843]">Discount:</span>
              <span className="text-gray-600">{data?.receipt.discount}%</span>
            </div>
            <div className="flex justify-between w-48 mt-2 text-lg">
              <span className="font-extrabold text-[#223843]">Total Price:</span>
              <span className="font-extrabold text-[#223843]">₱{data?.receipt.total_price.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleVoid}
            className="flex items-center gap-2 bg-[#b13e3e] hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md active:scale-95"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Void Entire Sale
          </button>
        </div>

      </div>
    </div>
  );
}