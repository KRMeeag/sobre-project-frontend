import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

interface OrgUser {
  id: string;
  auth_user_id: string;
  username: string;
  email: string;
  role: string;
  photo?: string;
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: OrgUser[];
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteUserModal({ isOpen, onClose, users, onConfirm, loading }: DeleteUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#35435a]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-162.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-[18px] font-['Work_Sans'] text-gray-500">
            Delete User
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <h3 className="text-center text-[18px] font-bold font-['Raleway'] text-[#223843] mb-8">
            Are you sure you want to delete the following users:
          </h3>

          <div className="flex flex-col gap-6 max-h-75 overflow-y-auto px-4">
            {users.map((u) => (
              <div key={u.auth_user_id} className="grid grid-cols-[1fr_2fr_1fr] items-center gap-4">
                
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d1d5db] flex items-center justify-center shrink-0 border border-gray-300 overflow-hidden">
                    {u.photo ? (
                      <img src={u.photo} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 mt-1">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[16px] font-['Raleway'] font-bold text-[#223843]">
                    {u.username}
                  </span>
                </div>

                {/* Email */}
                <div className="text-[15px] font-['Raleway'] text-gray-600 text-center truncate">
                  {u.email}
                </div>

                {/* Role */}
                <div className="text-[15px] font-['Raleway'] text-gray-600 text-right capitalize pr-2">
                  {u.role}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 flex justify-end">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 bg-[#cb4a4a] hover:bg-[#b13e3e] text-white font-medium py-3 px-6 rounded-lg transition-colors text-[14px] font-['Work_Sans'] focus:outline-none shadow-sm disabled:opacity-50"
          >
            <TrashIcon className="w-5 h-5" />
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>

      </div>
    </div>
  );
}