import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";

const DashboardLayout = () => {
  const [role, setRole] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("role, photo") 
          .eq("auth_user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error.message);
          setRole("staff");
        } else if (data) {
          setRole(data.role);
          setPhoto(data.photo); 
        } else {
          setRole("staff");
        }

      } catch (err) {
        console.error("Unexpected error:", err);
        setRole("staff");
      } finally {
        setLoading(false);
      }
    };

    fetchUserContext();
  }, [navigate]);

  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPhoto(customEvent.detail); 
    };

    window.addEventListener("avatarChanged", handleAvatarUpdate);
    return () => window.removeEventListener("avatarChanged", handleAvatarUpdate);
  }, []);

  if (loading) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <NavBar role={role} photo={photo} /> 
      {/* Updated background and overflow to match InventoryPage structure */}
      <main className="flex-1 bg-[#f3f4f6] overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;