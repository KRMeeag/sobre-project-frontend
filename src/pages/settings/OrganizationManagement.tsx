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

  const handleEditClick = (targetUser: OrgUser) => {
    if (targetUser.role.toLowerCase() === 'main manager' && currentUserRole.toLowerCase() !== 'main manager') {
      alert("You do not have permission to edit the Main Manager's role.");
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

  if (loading) return <div className="animate-pulse text-gray-500 p-10">Loading...</div>;

  const gridTemplate = isDeletingMode 
    ? "grid-cols-[80px_2.5fr_2.5fr_1.5fr_1.5fr]" 
    : "grid-cols-[2.5fr_2.5fr_1.5fr_1.5fr_1fr]";

  return (
    <div className="w-full animate-in fade-in duration-300 relative">
      <h1 className="text-[32px] font-bold font-['Arvo'] text-[#223843] mb-8">User & Role Management</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-75 h-11.5 bg-white border border-gray-300 rounded-lg flex items-center px-4 shadow-sm focus-within:border-[#002f5a]">
            <input type="text" placeholder="Search by user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent outline-none text-[15px]" />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="relative w-32.5 h-11.5 bg-white border border-gray-300 rounded-lg flex items-center">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full h-full bg-transparent outline-none text-[15px] pl-4 pr-10 appearance-none capitalize">
              <option value="">Roles</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 absolute right-3 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isDeletingMode ? (
            <>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#34a853] text-white px-5 py-2.5 rounded-lg"><PlusIcon className="w-5 h-5" />New User</button>
              <button onClick={() => setIsDeletingMode(true)} className="flex items-center gap-2 bg-[#cb4a4a] text-white px-5 py-2.5 rounded-lg"><TrashIcon className="w-5 h-5" />Delete User</button>
            </>
          ) : (
            <>
              <button onClick={() => selectedUserIds.length > 0 && setIsDeleteModalOpen(true)} disabled={selectedUserIds.length === 0} className="bg-[#cb4a4a] text-white px-5 py-2.5 rounded-lg disabled:opacity-50">Confirm ({selectedUserIds.length})</button>
              <button onClick={handleCancelDeleteMode} className="bg-white border px-5 py-2.5 rounded-lg">Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className={`bg-[#f4f4f4] h-15 grid ${gridTemplate} items-center px-8 border-b`}>
          {isDeletingMode && <div className="text-center font-semibold text-[#a29898]">#</div>}
          <div className="text-center font-semibold text-[#a29898]">Name</div>
          <div className="text-center font-semibold text-[#a29898]">Email</div>
          <div className="text-center font-semibold text-[#a29898]">Roles</div>
          <div className="text-center font-semibold text-[#a29898]">Status</div>
          {!isDeletingMode && <div className="text-center font-semibold text-[#a29898]">Action</div>}
        </div>

        <div className="flex flex-col">
          {filteredUsers.map((u) => {
            const isEditingThisRow = editingUserId === u.auth_user_id;
            const hasChanges = editingRole.toLowerCase() !== u.role.toLowerCase();
            const isMainManager = u.role.toLowerCase() === 'main manager';
            const canEdit = !(isMainManager && currentUserRole.toLowerCase() !== 'main manager');

            return (
              <div key={u.auth_user_id} className={`grid ${gridTemplate} items-center px-8 h-20 border-b hover:bg-gray-50 ${selectedUserIds.includes(u.auth_user_id) ? 'bg-red-50' : ''}`} onClick={() => isDeletingMode && handleSelectUser(u.auth_user_id)}>
                {isDeletingMode && <div className="flex justify-center"><input type="checkbox" checked={selectedUserIds.includes(u.auth_user_id)} readOnly /></div>}
                <div className="flex items-center gap-4 ml-6">
                  <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 overflow-hidden border border-gray-200">
                    {/* FIX: Removed opacity-60 to make image perfectly clear */}
                    <img src={u.photo || "/assets/background1.png"} className="w-full h-full object-cover" alt="Profile" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#223843]">{u.username}</span>
                    <span className="text-xs text-gray-400">{u.store_name} • {u.province}</span>
                  </div>
                </div>
                <div className="text-center truncate px-4">{u.email}</div>
                <div className="flex justify-center">
                  {isEditingThisRow ? (
                    <select value={editingRole} onChange={(e) => setEditingRole(e.target.value)} className="border rounded px-2 py-1">
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </select>
                  ) : <span className="capitalize">{u.role}</span>}
                </div>
                <div className="flex justify-center"><StatusPill status={u.status} /></div>
                {!isDeletingMode && (
                  <div className="flex justify-center gap-2">
                    {isEditingThisRow ? (
                      <>
                        <button onClick={(e) => {e.stopPropagation(); handleSaveRole(u.auth_user_id)}} disabled={!hasChanges || isSavingRole} className={hasChanges ? "text-green-600" : "text-gray-300"}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        </button>
                        <button onClick={(e) => {e.stopPropagation(); cancelEditing()}}><XMarkIcon className="w-6 h-6 text-red-500"/></button>
                      </>
                    ) : (canEdit && <button onClick={(e) => {e.stopPropagation(); handleEditClick(u)}}><PencilSquareIcon className="w-6 h-6 text-gray-500"/></button>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FIX: Added adminUserId prop to the modal so the backend can trigger the log */}
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
  return (
    <div className={`h-7 w-25 flex items-center justify-center rounded-full text-[14px] font-bold ${isActive ? "bg-[#e2f9af] text-[#71c33f]" : "bg-[#ffceb9] text-[#f2744e]"}`}>
      {isActive ? "Active" : "Inactive"}
    </div>
  );
}