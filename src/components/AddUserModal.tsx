import { useState } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentCheckIcon } from "@heroicons/react/24/solid";

const API_URL = import.meta.env.VITE_API_URL;

// 1. ADD adminUserId to the interface here
interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string | null;
  adminUserId: string | null; 
  onSuccess: () => void;
}

// 2. Destructure adminUserId here
export default function AddUserModal({ isOpen, onClose, storeId, adminUserId, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!storeId) {
      setError("No store associated with your account.");
      return;
    }
    if (!formData.email || !formData.password || !formData.username) {
      setError("Username, Email, and Password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/users/org`, {
        ...formData,
        store_id: storeId,
        admin_user_id: adminUserId, // 3. Pass it to the backend here for the audit log
      });
      
      setFormData({ username: "", email: "", password: "", phone: "" });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#35435a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-162.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-8 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-[18px] font-['Work_Sans'] text-gray-500">
            Add New User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6">
          {error && <div className="mb-4 text-red-500 text-sm font-medium">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-[13px] font-bold text-gray-400 mb-1.5 font-['Work_Sans']">Username</label>
              <input type="text" placeholder="User201" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-[#002f5a] focus:ring-1 focus:ring-[#002f5a] transition-all bg-white" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-400 mb-1.5 font-['Work_Sans']">Password</label>
              <input type="password" placeholder="********" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-[#002f5a] focus:ring-1 focus:ring-[#002f5a] transition-all bg-white" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-400 mb-1.5 font-['Work_Sans']">Email</label>
              <input type="email" placeholder="user201@store.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-[#002f5a] focus:ring-1 focus:ring-[#002f5a] transition-all bg-white" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-400 mb-1.5 font-['Work_Sans']">Phone</label>
              <input type="text" placeholder="0900 000 0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] text-gray-700 focus:outline-none focus:border-[#002f5a] focus:ring-1 focus:ring-[#002f5a] transition-all bg-white" />
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-4 flex justify-end">
          <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-[#002f5a] hover:bg-[#001f3f] text-white font-medium py-3 px-6 rounded-lg transition-colors text-[14px] font-['Work_Sans'] focus:outline-none shadow-sm disabled:opacity-50">
            <DocumentCheckIcon className="w-4 h-4" />
            {loading ? "Creating..." : "Create New User"}
          </button>
        </div>

      </div>
    </div>
  );
}