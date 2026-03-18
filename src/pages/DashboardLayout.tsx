import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";

const DashboardLayout = () => {
  const [role, setRole] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null); // New state for photo
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
          .select("role, photo") // Fetch photo as well
          .eq("auth_user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error.message);
          setRole("staff");
        } else if (data) {
          setRole(data.role);
          setPhoto(data.photo); // Save the photo URL
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

  if (loading) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Pass the photo down to NavBar */}
      <NavBar role={role} photo={photo} /> 
      <main className="flex-1 bg-[#e9e9e9] overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;