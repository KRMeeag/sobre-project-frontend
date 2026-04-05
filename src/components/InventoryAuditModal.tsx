import { XMarkIcon } from "@heroicons/react/24/outline";

// We mirror the AuditLog interface from HistoryPage
interface AuditLog {
  id: string;
  date: string;
  timestamp: string;
  area: string;
  action: string;
  item: string;
  summary: string;
  users: {
    username: string;
    photo?: string;
  };
}

interface InventoryAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export default function InventoryAuditModal({ isOpen, onClose, log }: InventoryAuditModalProps) {
  if (!isOpen || !log) return null;

  // Helper function to format SQL time (e.g., 14:30:00 -> 2:30 PM)
  const formatUITime = (sqlTime: string) => {
    const [hours, minutes] = sqlTime.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const formatUIDate = (sqlDate: string) => {
    return new Date(sqlDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Smart Parser: This splits the summary string to make the values BOLD.
  // E.g., "Cost: 25 - 35" becomes Label: "Cost", Value (Bold): "25 - 35"
  const renderSummaryDetails = (summary: string) => {
    // Split the summary by commas or newlines in case there are multiple changes
    const parts = summary.split(/(?:\n|,)/).filter(Boolean);

    return (
      <ul className="space-y-2 mt-3">
        {parts.map((part, idx) => {
          // If the string has a colon (e.g. "Cost: 25 - 35")
          if (part.includes(':')) {
            const [label, ...rest] = part.split(':');
            return (
              <li key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-500 font-medium text-[14px]">{label.trim()}</span>
                {/* THIS IS THE BOLD VALUE */}
                <span className="text-[#004385] font-extrabold text-[15px]">{rest.join(':').trim()}</span>
              </li>
            );
          }
          // Fallback if there is no colon
          return (
            <li key={idx} className="p-3 bg-white rounded-lg border border-gray-200 text-[#004385] font-bold text-[14px] text-center shadow-sm">
              {part.trim()}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    // Matches Invoice Modal backdrop and z-index exactly
    <div className="fixed inset-0 bg-[#35435a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      
      {/* Matches Invoice Modal container: max-w-175 and rounded-3xl */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-175 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Matched to Invoice Modal formatting */}
        <div className="pt-6 px-8 pb-4 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-[15px] font-['Work_Sans'] text-gray-500">
            Details for Inventory {log.action} — <span className="font-bold text-slate-800">{log.item}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#b13e3e] transition-colors focus:outline-none">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Matched to Invoice Modal scrolling area */}
        <div className="px-8 py-6 max-h-[50vh] overflow-y-auto custom-scrollbar font-['Work_Sans']">
          
          {/* User & Time Info Card (from your pasted code) */}
          <div className="flex items-center gap-4 mb-8 bg-[#f8f9fa] p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
              {log.users?.photo ? (
                <img src={log.users.photo} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 mt-1">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold text-[#223843] text-[16px]">{log.users?.username || "Unknown User"}</p>
              <p className="text-gray-500 text-[13px] font-medium">
                {formatUIDate(log.date)} at {formatUITime(log.timestamp)}
              </p>
            </div>
          </div>

          {/* Action Details (from your pasted code) */}
          <div className="bg-[#f8f9fa] p-5 rounded-xl border border-gray-100">
            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">Modifications Made</h3>
            {/* The Smart Parser renders the bolded changes here */}
            {renderSummaryDetails(log.summary)}
          </div>

        </div>

        {/* Footer - Matched to Invoice Modal's fat gray footer */}
        <div className="px-8 py-8 flex justify-end border-t border-gray-100 bg-[#f8f9fa]">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg transition-all shadow-sm text-[14px] font-['Work_Sans'] focus:outline-none"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}