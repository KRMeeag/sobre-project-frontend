import {
  ArchiveBoxIcon,
  ArrowLeftEndOnRectangleIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  UserCircleIcon, // Added for the profile avatar
} from "@heroicons/react/24/solid";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define menu items
  const menuItems = [
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
    {
      id: "settings",
      icon: CogIcon,
      label: "Settings",
      path: "/settings",
    },
  ];

  const handleLogout = () => {
    console.log("Logging out...");
    supabase.auth.signOut();
  };

  return (
    <aside className="w-24 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 shadow-xl">
      {/* 1. Logo Section */}
      <div className="mb-2 flex flex-col items-center">
        <img
          src="../../public/assets/background1.png"
          alt="Sobre Logo"
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-xl font-bold text-gray-800 tracking-wide">Sobre</h1>
      </div>

      {/* 2. Navigation Items */}
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

      {/* 3. Bottom Section (Profile & Logout) */}
      <div className="w-full px-2 mt-auto pt-4 border-t border-gray-100 flex flex-col items-center space-y-4">
        {/* Profile */}
        <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <UserCircleIcon className="w-10 h-10" />
        </button>

        {/* Logout */}
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
