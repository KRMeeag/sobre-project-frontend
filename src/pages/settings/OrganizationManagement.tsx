import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { supabase } from "../../lib/supabase";
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

import AddUserModal from "../../components/AddUserModal";
import DeleteUserModal from "../../components/DeleteUserModal";

const API_URL = import.meta.env.VITE_API_URL;

interface OrgUser {
  id: string;
  auth_user_id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  photo?: string;
  store_name: string;
  province: string;
}

export default function OrganizationManagement() {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeletingMode, setIsDeletingMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>("");
  const [isSavingRole, setIsSavingRole] = useState(false);

  const fetchOrganizationUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      const userRes = await axios.get(`${API_URL}/users/${user.id}`);
      const storeId = userRes.data?.store_id;
      setCurrentUserRole(userRes.data?.role || "staff");

      if (!storeId) {
        setLoading(false);
        return;
      }

      setCurrentStoreId(storeId);
      const orgUsersRes = await axios.get(`${API_URL}/users/store/${storeId}`);
      setUsers(orgUsersRes.data);
    } catch (err) {
      console.error("Failed to load organization users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "" || u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleSelectUser = (authId: string) => {
    if (selectedUserIds.includes(authId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== authId));
    } else {
      setSelectedUserIds([...selectedUserIds, authId]);
    }
  };

  const handleCancelDeleteMode = () => {
    setIsDeletingMode(false);
    setSelectedUserIds([]);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await axios.post(`${API_URL}/users/org/delete`, { 
        userIds: selectedUserIds, 
        admin_user_id: currentUserId,
        store_id: currentStoreId 
      });
      setIsDeleteModalOpen(false);
      handleCancelDeleteMode();
      fetchOrganizationUsers();
    } catch (err) {
      alert("Failed to delete users.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UPDATED: Prevent self-editing for Main Manager ---
  const handleEditClick = (targetUser: OrgUser) => {
    const isTargetMainManager = targetUser.role.toLowerCase() === 'main manager';
    const isSelf = targetUser.auth_user_id === currentUserId;

    if (isTargetMainManager && currentUserRole.toLowerCase() !== 'main manager') {
      alert("You do not have permission to edit the Main Manager's role.");
      return;
    }

    // Failsafe: Prevent Main Manager from editing their own role
    if (isTargetMainManager && isSelf) {
      alert("Action denied: As the Main Manager, you cannot edit your own role to prevent a power vacuum.");
      return;
    }

    setEditingUserId(targetUser.auth_user_id);
    setEditingRole(targetUser.role);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditingRole("");
  };

  const handleSaveRole = async (targetAuthUserId: string) => {
    if (!targetAuthUserId) return;
    
    setIsSavingRole(true);
    try {
      await axios.put(`${API_URL}/users/org/${targetAuthUserId}/role`, {
        role: editingRole.toLowerCase(),
        admin_user_id: currentUserId,
        store_id: currentStoreId
      });
      
      setUsers(prev => prev.map(u => 
        u.auth_user_id === targetAuthUserId ? { ...u, role: editingRole.toLowerCase() } : u
      ));
      
      cancelEditing();
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to save user role.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const usersToDelete = users.filter(u => selectedUserIds.includes(u.auth_user_id));

  return (
    <div className="w-full animate-in fade-in duration-300 relative">
      <h1 className="text-4xl font-bold font-['Raleway'] text-[#004385] mb-8">User Management</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-75 h-11 bg-white border border-gray-300 rounded-lg flex items-center px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#087CA7] outline-none">
            <input type="text" placeholder="Search by user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent outline-none text-[15px] text-gray-700" />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="relative w-32.5 h-11 bg-white border border-gray-300 rounded-lg flex items-center shadow-sm">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full h-full bg-transparent outline-none text-[15px] pl-4 pr-10 appearance-none capitalize text-gray-600">
              <option value="">Roles</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 absolute right-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isDeletingMode ? (
            <>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#2aa564] hover:bg-[#238f55] text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm"><PlusIcon className="w-5 h-5" />New User</button>
              <button onClick={() => setIsDeletingMode(true)} className="flex items-center gap-2 bg-white border border-[#b13e3e] hover:bg-red-50 text-[#b13e3e] font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm"><TrashIcon className="w-5 h-5" />Delete User</button>
            </>
          ) : (
            <>
              <button onClick={() => selectedUserIds.length > 0 && setIsDeleteModalOpen(true)} disabled={selectedUserIds.length === 0} className="bg-[#b13e3e] hover:bg-[#8c2d2d] text-white font-bold px-6 py-2.5 rounded-lg disabled:opacity-50 shadow-sm transition-colors text-sm">Confirm ({selectedUserIds.length})</button>
              <button onClick={handleCancelDeleteMode} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors text-sm">Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed transition-all">
            <thead className="bg-[#f8f9fa] text-[#033860] text-xs uppercase tracking-wider font-bold border-b border-gray-200">
              <tr>
                {isDeletingMode && <th className="p-4 w-[5%] text-center">#</th>}
                <th className="p-4 w-[35%] text-center">Name</th>
                <th className="p-4 w-[25%] text-center">Email</th>
                <th className="p-4 w-[15%] text-center">Roles</th>
                <th className="p-4 w-[10%] text-center">Status</th>
                {!isDeletingMode && <th className="p-4 w-[10%] text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={isDeletingMode ? 5 : 6} className="p-8 text-center text-[#223843]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385] mx-auto mb-2"></div>
                    Loading Data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isDeletingMode ? 5 : 6} className="p-8 text-center text-gray-500">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => {
                  const isEditingThisRow = editingUserId === u.auth_user_id;
                  const hasChanges = editingRole.toLowerCase() !== u.role.toLowerCase();
                  
                  // --- UPDATED: Hiding logic for the edit button ---
                  const isMainManager = u.role.toLowerCase() === 'main manager';
                  const isSelf = u.auth_user_id === currentUserId; 
                  
                  // canEdit is false if a lower user tries to edit main manager, OR if main manager tries to edit self
                  const canEdit = !(isMainManager && currentUserRole.toLowerCase() !== 'main manager') && !(isMainManager && isSelf);

                  return (
                    <tr 
                      key={u.auth_user_id} 
                      onClick={() => isDeletingMode && handleSelectUser(u.auth_user_id)}
                      className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${selectedUserIds.includes(u.auth_user_id) ? 'bg-red-50' : index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}`}
                    >
                      {isDeletingMode && (
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-400 text-[#b13e3e] focus:ring-[#b13e3e] w-4 h-4 cursor-pointer"
                            checked={selectedUserIds.includes(u.auth_user_id)} 
                            readOnly 
                          />
                        </td>
                      )}
                      
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                            <img src={u.photo || "/assets/background1.png"} className="w-full h-full object-cover" alt="Profile" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-[#223843] truncate w-40">{u.username}</span>
                            <span className="text-xs text-gray-500 truncate w-40">{u.store_name} • {u.province}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-center text-gray-600 truncate max-w-50">{u.email}</td>
                      
                      <td className="p-4 text-center">
                        {isEditingThisRow ? (
                          <select value={editingRole} onChange={(e) => setEditingRole(e.target.value)} className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#087CA7]">
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                          </select>
                        ) : (
                          <span className="capitalize text-gray-800 font-medium">{u.role}</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex justify-center"><StatusPill status={u.status} /></div>
                      </td>

                      {!isDeletingMode && (
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            {isEditingThisRow ? (
                              <>
                                <button onClick={(e) => {e.stopPropagation(); handleSaveRole(u.auth_user_id)}} disabled={!hasChanges || isSavingRole} className={`p-1.5 rounded transition-colors ${hasChanges ? "bg-[#2aa564] hover:bg-[#238f55] text-white shadow-sm" : "bg-gray-100 text-gray-400"}`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button onClick={(e) => {e.stopPropagation(); cancelEditing()}} className="p-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 rounded transition-colors shadow-sm">
                                  <XMarkIcon className="w-4 h-4"/>
                                </button>
                              </>
                            ) : (
                              canEdit && (
                                <button onClick={(e) => {e.stopPropagation(); handleEditClick(u)}} className="p-1.5 text-gray-400 hover:text-[#087CA7] transition-colors rounded-full hover:bg-gray-100">
                                  <PencilSquareIcon className="w-5 h-5"/>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        storeId={currentStoreId} 
        adminUserId={currentUserId} 
        onSuccess={fetchOrganizationUsers} 
      />
      
      <DeleteUserModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} users={usersToDelete} onConfirm={handleDeleteConfirm} loading={isDeleting} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status.toLowerCase() === 'active';
  
  // Matches Inventory "In Stock" (Green) and "Out of Stock" (Red)
  const colorClass = isActive 
    ? "bg-[#daf4a6] text-[#4b6618]" 
    : "bg-[#ffccc7] text-[#8c2d2d]";

  return (
    <span className={`px-3 py-1 inline-flex items-center justify-center rounded-full text-xs font-bold shadow-sm font-['Work_Sans'] ${colorClass}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}