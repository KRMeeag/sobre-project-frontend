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
  photo?: string | null; // Added photo prop
}

const NavBar = ({ role, photo }: NavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const allMenuItems = [
    { id: "pos", icon: CurrencyDollarIcon, label: "POS", path: "/pos" },
    {
      id: "inventory",
      icon: ArchiveBoxIcon,
      label: "Inventory",
      path: "/inventory",
    },
    {
      id: "history",
      icon: DocumentTextIcon,
      label: "History",
      path: "/history",
    },
    {
      id: "sales",
      icon: PresentationChartBarIcon,
      label: "Sales",
      path: "/sales",
    },
    { id: "settings", icon: CogIcon, label: "Settings", path: "/settings" },
  ];

  const isStaff = role?.toLowerCase().trim() === "staff";

  const menuItems = isStaff
    ? allMenuItems.filter((item) => ["pos", "inventory"].includes(item.id))
    : allMenuItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside className="w-24 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 shadow-xl z-50">
      <div className="mb-2 flex flex-col items-center">
        <img
          src="/assets/background1.png"
          alt="Sobre Logo"
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-xl font-bold text-gray-800 tracking-wide">Sobre</h1>
      </div>

      <nav className="flex-1 w-full px-2 space-y-4">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? "bg-cyan-50 border-2 border-cyan-500 text-cyan-800"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              <item.icon
                className={`w-10 h-10 mb-1 ${isActive ? "text-cyan-700" : "text-gray-600 group-hover:text-gray-800"}`}
              />
              <span
                className={`text-xs font-medium ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="w-full px-2 mt-auto pt-4 border-t border-gray-100 flex flex-col items-center space-y-4">
        
        {/* AVATAR LINK */}
        <Link
          to="/profile"
          className={`flex flex-col items-center transition-all focus:outline-none rounded-full p-1 border-2 ${
            location.pathname === "/profile"
              ? "border-cyan-500 shadow-md"
              : "border-transparent hover:border-gray-300"
          }`}
        >
          {photo ? (
            <div className="w-10 h-10 rounded-full overflow-hidden aspect-square shrink-0 border border-gray-100 bg-gray-50">
              <img src={photo} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <UserCircleIcon className={`w-10 h-10 ${location.pathname === "/profile" ? "text-cyan-700" : "text-gray-400"}`} />
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors pb-4"
        >
          <ArrowLeftEndOnRectangleIcon className="w-7 h-7 mb-1" />
          <span className="text-xs font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default NavBar;