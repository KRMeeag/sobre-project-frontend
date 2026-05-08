import { useState } from "react";
import {
  ArchiveBoxIcon,
  ArrowLeftEndOnRectangleIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  UserCircleIcon,
  XMarkIcon // Import X icon to close mobile menu
} from "@heroicons/react/24/solid";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface NavBarProps {
  role: string | null;
  photo?: string | null;
  isOpen: boolean;       
  onClose: () => void;   
}

const NavBar = ({ role, photo, isOpen, onClose }: NavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
    ? allMenuItems.filter((item) => ["pos", "inventory", "sales"].includes(item.id))
    : allMenuItems;

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    setIsLogoutModalOpen(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      {/* MOBILE OVERLAY (Dark background when menu is open) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={onClose} 
      />

      {/* THE ACTUAL NAVBAR */}
      {/* RESPONSIVE FIX: Using h-[100dvh] ensures it fits strictly inside the visible mobile screen */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-24 h-[100dvh] lg:h-full bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-full"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Logo Section - shrink-0 prevents it from being crushed */}
        <div className="mb-2 flex flex-col items-center mt-4 lg:mt-0 shrink-0">
          <img
            src="/assets/background1.png"
            alt="Sobre Logo"
            className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
          />
          <h1 className="text-lg lg:text-xl font-bold text-gray-800 tracking-wide mt-1">Sobre</h1>
        </div>

        {/* Main Navigation */}
        {/* RESPONSIVE FIX: flex-1, min-h-0, and overflow-y-auto allows the middle items to scroll on tiny screens! */}
        <nav className="flex-1 min-h-0 overflow-y-auto w-full px-2 flex flex-col gap-2 mt-4 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose} 
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200 group shrink-0
                  ${
                    isActive
                      ? "bg-cyan-50 border-2 border-cyan-500 text-cyan-800"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-2 border-transparent"
                  }`}
              >
                {/* RESPONSIVE FIX: Adjusted icon and text sizing for better mobile fit */}
                <item.icon
                  className={`w-7 h-7 lg:w-9 lg:h-9 mb-1 ${isActive ? "text-cyan-700" : "text-gray-600 group-hover:text-gray-800"}`}
                />
                <span
                  className={`text-[10px] lg:text-xs font-medium text-center leading-tight ${isActive ? "font-bold" : ""}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        {/* RESPONSIVE FIX: shrink-0 keeps it from disappearing, and pb-6 adds safe zone for bottom phone edge */}
        <div className="w-full px-2 mt-auto pt-4 border-t border-gray-100 flex flex-col items-center space-y-4 shrink-0 pb-6 lg:pb-2">
          
          <Link
            to="/profile"
            onClick={onClose} 
            className={`flex flex-col items-center transition-all focus:outline-none rounded-full p-1 border-2 ${
              location.pathname === "/profile"
                ? "border-cyan-500 shadow-md"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            {photo ? (
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden aspect-square shrink-0 border border-gray-100 bg-gray-50">
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <UserCircleIcon className={`w-10 h-10 lg:w-12 lg:h-12 ${location.pathname === "/profile" ? "text-cyan-700" : "text-gray-400"}`} />
            )
            }
          </Link>

          <button
            onClick={handleLogoutClick}
            className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeftEndOnRectangleIcon className="w-6 h-6 lg:w-7 lg:h-7 mb-1" />
            <span className="text-[10px] lg:text-xs font-medium">Log Out</span>
          </button>
        </div>
      </aside>

       {/* LOGOUT MODAL */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-[#223843] mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Are you sure you want to log out?
              </h2>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={cancelLogout}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'Work Sans, sans-serif' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-lg bg-[#cb4a4a] hover:bg-red-800 text-white font-bold transition-colors shadow-sm"
                  style={{ fontFamily: 'Work Sans, sans-serif' }}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default NavBar;