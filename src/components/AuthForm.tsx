import { useState } from "react";
import { supabase } from "../lib/supabase";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [establishment, setEstablishment] = useState("");
  const [location, setLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await axios.post(`${API_URL}/users`, {
            auth_user_id: data.user.id,
            username: email.split("@")[0],
            establishment,
            location,
            role: "manager",
          });
          alert("Check your email for confirmation!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-[30%] bg-white flex flex-col items-center justify-center p-6 border-l border-gray-100 min-h-screen">
      <div className="w-full max-w-90 flex flex-col">
        {/* Branding Icon */}
        <div className="text-center mb-4">
          <img src="/assets/background1.png" className="w-10 h-10 mx-auto mb-4" alt="Sobre Icon" />
          
          {/* DYNAMIC TEXT BASED ON LOGIN/SIGNUP */}
          <h1 className="text-[33px] font-['Raleway'] font-extrabold text-[#223843] leading-[1.1] mb-2 px-2">
            {isSignUp ? "Create a Manager's Account" : "Data Driven Insights with Sobre"}
          </h1>
          <p className="text-gray-500 font-['Work_Sans'] text-[13px] leading-relaxed mb-4 px-2">
            {isSignUp 
              ? "Make an account for your store so that you can kickstart your data-driven stock monitoring today!" 
              : "Make smarter decisions with your shop's stocks using Sobre: Sell, Observe, Restock."}
          </p>
          
          <h2 className="text-2xl font-['Arvo'] font-bold text-[#223843]">
            {isSignUp ? "Sign-Up" : "Log-In"}
          </h2>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 font-['Work_Sans'] ml-1 mb-1 uppercase tracking-tighter">Email</label>
            <input 
              type="email" placeholder="user@email.com" required
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#087CA7] outline-none transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {isSignUp && (
            <>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 font-['Work_Sans'] ml-1 mb-1 uppercase tracking-tighter">Store Name</label>
                <input 
                  placeholder="Establishment Name" required
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#087CA7] outline-none"
                  value={establishment} onChange={(e) => setEstablishment(e.target.value)} 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 font-['Work_Sans'] ml-1 mb-1 uppercase tracking-tighter">Location</label>
                <input 
                  placeholder="Location" required
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#087CA7] outline-none"
                  value={location} onChange={(e) => setLocation(e.target.value)} 
                />
              </div>
            </>
          )}

          <div className="flex flex-col relative">
            <label className="text-[11px] font-bold text-gray-500 font-['Work_Sans'] ml-1 mb-1 uppercase tracking-tighter">Password</label>
            <input 
              type={showPassword ? "text" : "password"} placeholder="**********" required
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#087CA7] outline-none pr-10"
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2.75 text-gray-400 hover:text-[#087CA7]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#004385] hover:bg-[#031a6b] text-white font-bold py-2 rounded-lg shadow-md transition-all active:scale-[0.98] mt-2 font-['Work_Sans']"
          >
            {loading ? "..." : isSignUp ? "Create Manager's Account" : "Login to Sobre"}
          </button>
        </form>

        <div className="mt-4 text-center pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-500 mb-4 font-['Work_Sans']">
            {isSignUp ? "Already have an account? Login below!" : "Don't have an account? Click the button below!"}
          </p>
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="w-full bg-[#087CA7] hover:bg-[#004385] text-white font-bold py-2 rounded-lg transition-all text-sm font-['Work_Sans']"
          >
            {isSignUp ? "Login to Sobre" : "Create a manager's account"}
          </button>
        </div>
      </div>
    </div>
  );
}