import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase"; 

const DashboardLayout = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        // 1. Get the current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No user found, redirecting...");
          navigate("/");
          return;
        }

        console.log("Fetching role for user ID:", user.id);

        // 2. Query the 'users' table specifically for this user
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_user_id", user.id)
          .single();

        if (error) {
          // If there's an error (e.g., RLS policy), log it and default to STAFF (Safe)
          console.error("Error fetching role:", error.message);
          setRole("staff"); 
        } else if (data) {
          // Success! Set the real role
          console.log("Role found in DB:", data.role);
          setRole(data.role);
        } else {
          // No data returned? Default to STAFF
          console.warn("No profile found. Defaulting to 'staff'.");
          setRole("staff");
        }

      } catch (err) {
        console.error("Unexpected error:", err);
        setRole("staff");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [navigate]);

  if (loading) return null; 

  return (
    <div className="flex h-screen">
      <NavBar role={role} />
      <main className="flex-1 bg-[#e9e9e9]"> 
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;