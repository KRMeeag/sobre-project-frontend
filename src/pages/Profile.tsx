import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import {
  PencilSquareIcon,
  DocumentCheckIcon,
  XMarkIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    username: "",
    role: "",
    phone: "",
    storeName: "",
    formattedAddress: "",
    photo: "",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setAuthUserId(user.id);

        const userRes = await axios.get(`${API_URL}/users/${user.id}`);
        const userData = userRes.data;

        let storeData = null;
        try {
          const storeRes = await axios.get(`${API_URL}/store/user/${user.id}`);
          storeData = storeRes.data;
        } catch (err) {
          console.warn("No store linked to this user yet.");
        }

        let address = "No Address Provided";
        if (storeData) {
          setStoreId(storeData.id);
          const addressParts = [
            storeData.building,
            storeData.street,
            storeData.barangay,
            storeData.city,
            storeData.province,
          ].filter(Boolean);

          if (addressParts.length > 0) {
            address = addressParts.join(", ");
          }
        }

        const loadedProfile = {
          username: userData?.username || "Unknown User",
          role: userData?.role
            ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
            : "Staff",
          phone: userData?.phone || "No Phone Number",
          storeName: storeData?.store_name || "No Store Linked",
          formattedAddress: address,
          photo: userData?.photo || "",
        };

        setProfileData(loadedProfile);
        setEditForm({
          username: loadedProfile.username,
          phone:
            loadedProfile.phone === "No Phone Number"
              ? ""
              : loadedProfile.phone,
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

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploadingAvatar(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${authUserId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("users")
        .update({ photo: publicUrl })
        .eq("auth_user_id", authUserId);

      if (updateError) throw updateError;

      setProfileData((prev) => ({ ...prev, photo: publicUrl }));

      window.dispatchEvent(
        new CustomEvent("avatarChanged", { detail: publicUrl }),
      );

      await axios.post(`${API_URL}/audit`, {
        users_id: authUserId,
        store_id: storeId,
        area: "Profile",
        action: "Updating",
        item: "Profile Info",
        summary: "Updated the profile picture",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      alert(error.message || "Error uploading avatar!");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (editForm.phone && editForm.phone.length !== 11) {
      alert("Phone number must be exactly 11 digits long."); // Or use your UI toast/error state
      return;
    }

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

      if (editForm.username !== profileData.username) {
        await axios.post(`${API_URL}/audit`, {
          users_id: authUserId,
          store_id: storeId,
          area: "Profile",
          action: "Updating",
          item: "Profile Info",
          summary: "Updated username",
        });
      }
      if (editForm.phone !== profileData.phone) {
        await axios.post(`${API_URL}/audit`, {
          users_id: authUserId,
          store_id: storeId,
          area: "Profile",
          action: "Updating",
          item: "Profile Info",
          summary: "Updated phone number",
        });
      }
      if (editForm.password.trim() !== "") {
        await axios.post(`${API_URL}/audit`, {
          users_id: authUserId,
          store_id: storeId,
          area: "Profile",
          action: "Updating",
          item: "Profile Info",
          summary: "Updated password",
        });
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
      <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
        <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004385] mx-auto mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-['Work_Sans'] bg-[#f3f4f6] overflow-hidden relative">
      <div className="h-6 bg-[#004385] w-full shrink-0 shadow-md z-20"></div>

      <main className="flex-1 p-8 overflow-y-scroll bg-[#f3f4f6] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c4bcc0] hover:[&::-webkit-scrollbar-thumb]:bg-[#087CA7] [&::-webkit-scrollbar-thumb]:rounded-full transition-colors flex items-center justify-center">
        <div className="w-full max-w-262.5">
          <h1 className="text-4xl font-bold text-[#004385] font-['Raleway'] mb-6">
            {isEditing ? "Edit Profile" : "Profile"}
          </h1>

          <div className="bg-white rounded-xl border border-gray-200 p-12 min-h-120 w-full shadow-sm flex flex-col md:flex-row gap-16 items-center">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden relative shadow-sm transition-all group-hover:brightness-75 aspect-square border border-gray-200">
                {uploadingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-white font-semibold">
                      Uploading...
                    </span>
                  </div>
                ) : profileData.photo ? (
                  <img
                    src={profileData.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-32 h-32 mt-4"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>

              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <CameraIcon className="w-10 h-10 mb-2" />
                <span className="font-semibold text-sm">Change Photo</span>
              </div>
            </div>

            <div className="flex-1 w-full pt-2">
              {!isEditing ? (
                <div className="flex flex-col h-full justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 mb-10">
                    <div>
                      <p className="text-[14px] font-bold text-[#004385] mb-1">
                        Username
                      </p>
                      <p className="text-[15px] text-gray-600">
                        {profileData.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#004385] mb-1">
                        Role
                      </p>
                      <p className="text-[15px] text-gray-600">
                        {profileData.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#004385] mb-1">
                        Phone
                      </p>
                      <p className="text-[15px] text-gray-600">
                        {profileData.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#004385] mb-1">
                        Store Name
                      </p>
                      <p className="text-[15px] text-gray-600">
                        {profileData.storeName}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[14px] font-bold text-[#004385] mb-1">
                        Address
                      </p>
                      <p className="text-[15px] text-gray-600 leading-relaxed pr-8">
                        {profileData.formattedAddress}
                      </p>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none shadow-sm"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-center gap-7">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => {
                        // Instantly remove anything that is NOT a letter or a space
                        const sanitizedUsername = e.target.value.replace(
                          /[^a-zA-Z\s]/g,
                          "",
                        );
                        setEditForm({
                          ...editForm,
                          username: sanitizedUsername,
                        });
                      }}
                      className="w-full max-w-105 border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-700 focus:outline-none focus:border-[#087CA7] focus:ring-1 focus:ring-[#087CA7] transition-all bg-white shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="****************"
                      value={editForm.password}
                      onChange={(e) =>
                        setEditForm({ ...editForm, password: e.target.value })
                      }
                      className="w-full max-w-105 border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-700 focus:outline-none focus:border-[#087CA7] focus:ring-1 focus:ring-[#087CA7] transition-all bg-white shadow-sm placeholder:text-gray-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 italic">
                      Leave blank to keep your current password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-gray-500 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="09000000000"
                      value={editForm.phone}
                      onChange={(e) => {
                        // 1. Remove all letters/special chars (\D)
                        // 2. Cap the string at exactly 11 characters
                        const sanitizedPhone = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 11);
                        setEditForm({ ...editForm, phone: sanitizedPhone });
                      }}
                      className="w-full max-w-105 border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-700 focus:outline-none focus:border-[#087CA7] focus:ring-1 focus:ring-[#087CA7] transition-all bg-white shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#2aa564] hover:bg-[#238f55] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm focus:outline-none shadow-sm disabled:opacity-50"
                    >
                      <DocumentCheckIcon className="w-5 h-5" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      onClick={() => {
                        setEditForm({
                          username: profileData.username,
                          phone:
                            profileData.phone === "No Phone Number"
                              ? ""
                              : profileData.phone,
                          password: "",
                        });
                        setIsEditing(false);
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-6 rounded-lg transition-colors text-sm focus:outline-none disabled:opacity-50 shadow-sm"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
