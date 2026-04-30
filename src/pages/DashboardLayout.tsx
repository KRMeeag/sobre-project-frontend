import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";
import { Bars3Icon } from "@heroicons/react/24/outline"; // Import hamburger icon

const DashboardLayout = () => {
  const [role, setRole] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);
  
  // NEW: State to control the mobile slide-out navbar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu when route changes (optional, but good UX)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  if (loading) return null;

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#f3f4f6]">
      
      {/* MOBILE TOP BAR (Only visible on < lg screens) */}
      <div className="lg:hidden flex items-center justify-between h-14 bg-[#004385] px-4 shrink-0 shadow-md z-30">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white hover:bg-[#003060] p-1.5 rounded-lg transition-colors focus:outline-none"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        
        {/* Centered Logo */}
        <div className="flex items-center justify-center absolute left-0 right-0 pointer-events-none">
          <img
            src="/assets/background.png" // Updated to use the white icon
            alt="Sobre Logo"
            className="h-8 object-contain"
          />
        </div>
        
        {/* Empty div to balance flexbox spacing against the hamburger icon */}
        <div className="w-9 h-9"></div> 
      </div>

      {/* NAVBAR */}
      <NavBar 
        role={role} 
        photo={photo} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      /> 

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;