import {
  ArchiveBoxIcon,
  ArrowLeftEndOnRectangleIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface NavBarProps {
  role: string | null;
}

const NavBar = ({ role }: NavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Debugging: Check what the NavBar actually receives
  // console.log("NavBar received role:", role);

  const allMenuItems = [
    { id: "pos", icon: CurrencyDollarIcon, label: "POS", path: "/pos" },
    { id: "inventory", icon: ArchiveBoxIcon, label: "Inventory", path: "/inventory" },
    { id: "history", icon: DocumentTextIcon, label: "History", path: "/history" },
    { id: "sales", icon: PresentationChartBarIcon, label: "Sales", path: "/sales" },
    { id: "settings", icon: CogIcon, label: "Settings", path: "/settings" },
  ];

  // ROBUST FILTER LOGIC:
  // 1. Convert to lowercase and trim spaces to avoid mismatches
  // 2. If it is "staff", show ONLY POS and Inventory
  // 3. If it is "manager" (or anything else), show EVERYTHING
  const isStaff = role?.toLowerCase().trim() === "staff";

  const menuItems = isStaff
    ? allMenuItems.filter((item) => ["pos", "inventory"].includes(item.id))
    : allMenuItems;

  // ... rest of your code (Logout, Return) ...
  // (Your return statement and logout logic remain exactly the same as before)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside className="w-24 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 shadow-xl">
      {/* ... Logo Section ... */}
      <div className="mb-2 flex flex-col items-center">
        <img src="/assets/background1.png" alt="Sobre Logo" className="w-12 h-12 object-contain" />
        <h1 className="text-xl font-bold text-gray-800 tracking-wide">Sobre</h1>
      </div>

      {/* ... Navigation Items ... */}
      <nav className="flex-1 w-full px-2 space-y-4">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 group
                ${isActive
                    ? "bg-cyan-50 border-2 border-cyan-500 text-cyan-800"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              <item.icon className={`w-10 h-10 mb-1 ${isActive ? "text-cyan-700" : "text-gray-600 group-hover:text-gray-800"}`} />
              <span className={`text-xs font-medium ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ... Bottom Section ... */}
      <div className="w-full px-2 mt-auto pt-4 border-t border-gray-100 flex flex-col items-center space-y-4">
        <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <UserCircleIcon className="w-10 h-10" />
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors pb-4">
          <ArrowLeftEndOnRectangleIcon className="w-7 h-7 mb-1" />
          <span className="text-xs font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default NavBar;