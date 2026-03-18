import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { 
  PencilSquareIcon, 
  DocumentCheckIcon, 
  XMarkIcon,
  CameraIcon // <-- Camera icon for the upload overlay
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // State for avatar upload
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  // Reference for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Data States
  const [profileData, setProfileData] = useState({
    username: "",
    role: "",
    phone: "",
    storeName: "",
    formattedAddress: "",
    photo: "", // <-- Holds the photo URL
  });

  // Edit Form States
  const [editForm, setEditForm] = useState({
    username: "",
    phone: "",
    password: "", 
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 1. Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setAuthUserId(user.id);

        // 2. Fetch User Profile (public.users)
        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        const userData = userRes.data;

        // 3. Fetch Linked Store Profile (public.store)
        let storeData = null;
        try {
          const storeRes = await axios.get(`${API_URL}/store/user/${user.id}`);
          storeData = storeRes.data;
        } catch (err) {
          console.warn("No store linked to this user yet.");
        }

        // 4. Format Address
        let address = "No Address Provided";
        if (storeData) {
          setStoreId(storeData.id);
          const addressParts = [
            storeData.building,
            storeData.street,
            storeData.barangay,
            storeData.city,
            storeData.province
          ].filter(Boolean); 
          
          if (addressParts.length > 0) {
            address = addressParts.join(", ");
          }
        }

        // 5. Set States
        const loadedProfile = {
          username: userData?.username || "Unknown User",
          role: userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Staff",
          phone: userData?.phone || "No Phone Number",
          storeName: storeData?.store_name || "No Store Linked",
          formattedAddress: address,
          photo: userData?.photo || "", // Load the photo URL
        };

        setProfileData(loadedProfile);
        setEditForm({
          username: loadedProfile.username,
          phone: loadedProfile.phone === "No Phone Number" ? "" : loadedProfile.phone,
          password: "", 
        });

      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // --- AVATAR UPLOAD LOGIC ---
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Generate a unique file name to avoid caching issues
      const fileName = `${authUserId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Update the 'photo' column in the public.users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo: publicUrl })
        .eq('auth_user_id', authUserId);

      if (updateError) throw updateError;

      // 4. Update local state so the image changes immediately
      setProfileData(prev => ({ ...prev, photo: publicUrl }));
      // Fire Audit Log using the state variable
      await axios.post(`${API_URL}/audit`, {
        users_id: authUserId,
        store_id: storeId, // <-- Fixed
        area: "Profile",
        action: "Updating",
        item: "Profile Info",
        summary: "Updated the profile picture"
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.message || 'Error uploading avatar!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- SAVE PROFILE TEXT DATA LOGIC ---
  const handleSave = async () => {
    if (!authUserId) return;
    setSaving(true);

    try {
      const { error: userError } = await supabase
        .from("users")
        .update({
          username: editForm.username,
          phone: editForm.phone,
        })
        .eq("auth_user_id", authUserId);

      if (userError) throw userError;

      if (editForm.password.trim() !== "") {
        const { error: authError } = await supabase.auth.updateUser({
          password: editForm.password,
        });
        if (authError) throw authError;
      }

      setProfileData((prev) => ({
        ...prev,
        username: editForm.username,
        phone: editForm.phone || "No Phone Number",
      }));
      
      setEditForm((prev) => ({ ...prev, password: "" }));
      setIsEditing(false);
      // Check what changed and fire specific logs using the state variable
      if (editForm.username !== profileData.username) {
        await axios.post(`${API_URL}/audit`, { users_id: authUserId, store_id: storeId, area: "Profile", action: "Updating", item: "Profile Info", summary: "Updated username" }); // <-- Fixed
      }
      if (editForm.phone !== profileData.phone) {
        await axios.post(`${API_URL}/audit`, { users_id: authUserId, store_id: storeId, area: "Profile", action: "Updating", item: "Profile Info", summary: "Updated the number" }); // <-- Fixed
      }
      if (editForm.password.trim() !== "") {
        await axios.post(`${API_URL}/audit`, { users_id: authUserId, store_id: storeId, area: "Profile", action: "Updating", item: "Profile Info", summary: "Updated password" }); // <-- Fixed
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      alert(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#e9e9e9] font-['Work_Sans'] text-[#223843]">
        <div className="w-full h-13 bg-[#002f5a] shrink-0 shadow-sm"></div>
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="animate-pulse text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#e9e9e9] font-['Work_Sans'] text-[#223843]">
      {/* Top Header Bar */}
      <div className="w-full h-13 bg-[#002f5a] shrink-0 shadow-sm"></div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-10 flex items-center justify-center">
        <div className="w-full max-w-262.5">
          <h1 className="text-[26px] font-bold text-[#1e3445] mb-6">
            {isEditing ? "Edit Profile" : "Profile"}
          </h1>

          <div className="bg-white rounded-2xl border-[1.5px] p-12 min-h-120 w-full shadow-sm flex flex-col md:flex-row gap-16 items-center">
            
            {/* --- Avatar Area with Hover & Upload --- */}
            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />

              {/* PERFECT CIRCLE STYLING */}
              <div className="w-64 h-64 bg-[#b3b9bc] rounded-full flex items-center justify-center overflow-hidden relative shadow-sm transition-all group-hover:brightness-75 aspect-square border-4 border-white">
                {uploadingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-white font-semibold">Uploading...</span>
                  </div>
                ) : profileData.photo ? (
                  <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" className="w-32 h-32 mt-4">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>

              {/* Hover Overlay with Camera Icon */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <CameraIcon className="w-10 h-10 mb-2" />
                <span className="font-semibold text-sm">Change Photo</span>
              </div>
            </div>

            {/* Details / Form Area */}
            <div className="flex-1 w-full pt-2">
              
              {/* --- VIEW MODE --- */}
              {!isEditing ? (
                <div className="flex flex-col h-full justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 mb-10">
                    <div>
                      <p className="text-[14px] font-bold text-[#1e3445] mb-1">Username</p>
                      <p className="text-[15px] text-[#4a5c6a]">{profileData.username}</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1e3445] mb-1">Role</p>
                      <p className="text-[15px] text-[#4a5c6a]">{profileData.role}</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1e3445] mb-1">Phone</p>
                      <p className="text-[15px] text-[#4a5c6a]">{profileData.phone}</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1e3445] mb-1">Store Name</p>
                      <p className="text-[15px] text-[#4a5c6a]">{profileData.storeName}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[14px] font-bold text-[#1e3445] mb-1">Address</p>
                      <p className="text-[15px] text-[#4a5c6a] leading-relaxed pr-8">
                        {profileData.formattedAddress}
                      </p>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#1e3445] text-[#1e3445] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (

              /* --- EDIT MODE --- */
                <div className="flex flex-col h-full justify-center gap-7">
                  
                  <div>
                    <label className="block text-[13px] font-bold text-gray-400 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full max-w-105 border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-700 focus:outline-none focus:border-[#002f5a] focus:ring-1 focus:ring-[#002f5a] transition-all bg-[#fdfdfd]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-gray-400 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="****************"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full max-w-105 border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-700 focus:outline-none focus:border-[#002f5a] focus:ring-1 focus:ring-[#002f5a] transition-all bg-[#fdfdfd] placeholder:text-gray-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 italic">
                      Leave blank to keep your current password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-gray-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="0900 000 0000"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full max-w-105 border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-700 focus:outline-none focus:border-[#002f5a] focus:ring-1 focus:ring-[#002f5a] transition-all bg-[#fdfdfd]"
                    />
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#002f5a] hover:bg-[#001f3f] text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm focus:outline-none shadow-sm disabled:opacity-50"
                    >
                      <DocumentCheckIcon className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditForm({
                          username: profileData.username,
                          phone: profileData.phone === "No Phone Number" ? "" : profileData.phone,
                          password: "",
                        });
                        setIsEditing(false);
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 bg-white border border-[#1e3445] text-[#1e3445] hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors text-sm focus:outline-none disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}