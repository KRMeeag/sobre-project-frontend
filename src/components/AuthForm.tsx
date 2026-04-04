import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import axios from "axios";
import { getAllProvinces, getCities, getBarangays, type LocationNode } from "../lib/philippines";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data stores the actual string names to send to Supabase
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    building: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
  });

  // Selected codes trigger the PSGC API calls
  const [selectedCodes, setSelectedCodes] = useState({
    province: "",
    city: "",
    barangay: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Location Lists
  const [provincesList, setProvincesList] = useState<LocationNode[]>([]);
  const [citiesList, setCitiesList] = useState<LocationNode[]>([]);
  const [barangaysList, setBarangaysList] = useState<LocationNode[]>([]);

  useEffect(() => {
    setStep(1);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      fullName: "", email: "", password: "", confirmPassword: "",
      storeName: "", building: "", street: "", barangay: "", city: "", province: "",
    });
    setSelectedCodes({ province: "", city: "", barangay: "" });
  }, [isSignUp]);

  // 1. Fetch Provinces on Mount
  useEffect(() => {
    getAllProvinces().then(setProvincesList).catch(console.error);
  }, []);

  // 2. Fetch Cities when Province changes
  useEffect(() => {
    if (selectedCodes.province) {
      getCities(selectedCodes.province).then(setCitiesList).catch(console.error);
    } else {
      setCitiesList([]);
    }
    // Reset downward dependencies
    setBarangaysList([]);
  }, [selectedCodes.province]);

  // 3. Fetch Barangays when City changes
  useEffect(() => {
    if (selectedCodes.city) {
      getBarangays(selectedCodes.city).then(setBarangaysList).catch(console.error);
    } else {
      setBarangaysList([]);
    }
  }, [selectedCodes.city]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Invalid email address";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.storeName.trim()) newErrors.storeName = "Store name is required";
    if (!formData.street.trim()) newErrors.street = "Street is required";
    if (!formData.barangay.trim()) newErrors.barangay = "Barangay is required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.city) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && step === 1) return handleNext();
    if (isSignUp && !validateStep2()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email: formData.email, 
          password: formData.password 
        });
        if (authError) throw authError;

        if (authData.user) {
          await axios.post(`${API_URL}/users`, {
            auth_user_id: authData.user.id,
            username: formData.fullName,
            role: "manager",
            store_name: formData.storeName,
            building: formData.building,
            street: formData.street,
            barangay: formData.barangay,
            city: formData.city,
            province: formData.province
          });
          alert("Check your email for confirmation!");
          window.location.reload();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: formData.email, 
          password: formData.password 
        });
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
        
        <div className="text-center mb-4">
          <img src="/assets/background1.png" className="w-10 h-10 mx-auto mb-4" alt="Sobre Icon" />
          
          <h1 className="text-[33px] font-['Raleway'] font-extrabold text-[#223843] leading-[1.1] mb-2 px-2">
            {isSignUp ? "Create a Manager's Account" : "Data Driven Insights with Sobre"}
          </h1>
          
          <p className="text-gray-500 font-['Work_Sans'] text-[13px] leading-relaxed mb-4 px-2">
            {isSignUp 
              ? "Make an account for your store so that you can kickstart your data-driven stock monitoring today!" 
              : "Make smarter decisions with your shop's stocks using Sobre: Sell, Observe, Restock."}
          </p>
          
          <h2 className="text-2xl font-['Arvo'] font-bold text-[#223843]">
            {isSignUp ? (step === 1 ? "Sign-Up (Step 1/2)" : "Sign-Up (Step 2/2)") : "Log-In"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {!isSignUp && (
            <div className="animate-in fade-in duration-300 space-y-3">
              <InputField 
                label="Email" type="email" placeholder="user@email.com" required
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
              
              <PasswordField 
                label="Password" placeholder="**********" required
                value={formData.password} 
                show={showPassword} 
                onToggle={() => setShowPassword(!showPassword)}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          )}

          {isSignUp && step === 1 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputField 
                label="Full Name" placeholder="Juan Dela Cruz" required error={errors.fullName}
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              />
              
              <InputField 
                label="Email" type="email" placeholder="user@email.com" required error={errors.email}
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
              
              <PasswordField 
                label="Password" placeholder="**********" required error={errors.password}
                value={formData.password} 
                show={showPassword} 
                onToggle={() => setShowPassword(!showPassword)}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />

              <PasswordField 
                label="Confirm Password" placeholder="**********" required error={errors.confirmPassword}
                value={formData.confirmPassword} 
                show={showConfirmPassword} 
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
              />
            </div>
          )}

          {isSignUp && step === 2 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
              <InputField 
                label="Store Name" placeholder="Establishment Name" required error={errors.storeName}
                value={formData.storeName} 
                onChange={(e) => setFormData({...formData, storeName: e.target.value})} 
              />
              
              <InputField 
                label="Building (Optional)" placeholder="Unit 101, Blue Bldg"
                value={formData.building} 
                onChange={(e) => setFormData({...formData, building: e.target.value})} 
              />

              <InputField 
                label="Street" placeholder="Rizal Avenue" required error={errors.street}
                value={formData.street} 
                onChange={(e) => setFormData({...formData, street: e.target.value})} 
              />
              
              {/* BARANGAY UPDATED TO DROPDOWN */}
              <SelectField 
                label="Barangay" 
                required 
                error={errors.barangay}
                value={selectedCodes.barangay}
                onChange={(e) => {
                  const code = e.target.value;
                  const name = barangaysList.find(b => b.code === code)?.name || "";
                  setSelectedCodes(prev => ({ ...prev, barangay: code }));
                  setFormData(prev => ({ ...prev, barangay: name }));
                }}
                options={barangaysList}
                defaultOption={selectedCodes.city ? "Select Barangay" : "Select City First"}
                disabled={!selectedCodes.city}
              />
              
              {/* CITY PLACED BEFORE PROVINCE AS REQUESTED */}
              <SelectField 
                label="City / Municipality" 
                required 
                error={errors.city}
                value={selectedCodes.city}
                onChange={(e) => {
                  const code = e.target.value;
                  const name = citiesList.find(c => c.code === code)?.name || "";
                  setSelectedCodes(prev => ({ ...prev, city: code, barangay: "" }));
                  setFormData(prev => ({ ...prev, city: name, barangay: "" }));
                }}
                options={citiesList}
                defaultOption={selectedCodes.province ? "Select City" : "Select Province First"}
                disabled={!selectedCodes.province}
              />

              <SelectField 
                label="Province" 
                required 
                error={errors.province}
                value={selectedCodes.province}
                onChange={(e) => {
                  const code = e.target.value;
                  const name = provincesList.find(p => p.code === code)?.name || "";
                  setSelectedCodes(prev => ({ ...prev, province: code, city: "", barangay: "" }));
                  setFormData(prev => ({ ...prev, province: name, city: "", barangay: "" }));
                }}
                options={provincesList}
                defaultOption="Select Province"
              />

            </div>
          )}

          <div className="pt-2 space-y-3">
            {!isSignUp ? (
              <Button text={loading ? "..." : "Login to Sobre"} disabled={loading} />
            ) : step === 1 ? (
              <Button type="button" text="Next Step →" onClick={handleNext} />
            ) : (
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-sm transition-all font-['Work_Sans'] focus:outline-none"
                >
                  Back
                </button>
                <Button className="w-2/3" text={loading ? "..." : "Create Manager's Account"} disabled={loading} />
              </div>
            )}
          </div>

        </form>

        <div className="mt-4 text-center pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-500 mb-4 font-['Work_Sans']">
            {isSignUp ? "Already have an account? Login below!" : "Don't have an account? Click the button below!"}
          </p>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)} 
            className="w-full bg-[#087CA7] hover:bg-[#004385] text-white font-bold py-2 rounded-lg transition-all text-sm font-['Work_Sans'] focus:outline-none"
          >
            {isSignUp ? "Login to Sobre" : "Create a manager's account"}
          </button>
        </div>
        
        {isSignUp && (
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-2 h-2 rounded-full transition-all ${step === 1 ? 'bg-[#004385] w-4' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full transition-all ${step === 2 ? 'bg-[#004385] w-4' : 'bg-gray-300'}`} />
          </div>
        )}
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField = ({ label, error, ...props }: InputFieldProps) => (
  <div className="flex flex-col">
    <label className="text-[11px] font-bold text-gray-500 font-['Work_Sans'] ml-1 mb-1 uppercase tracking-tighter">
      {label} {props.required && "*"}
    </label>
    <input 
      className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#087CA7] outline-none transition-all ${error ? 'border-red-500' : 'border-gray-300'}`}
      {...props} 
    />
    {error && <span className="text-red-500 text-[10px] ml-1 mt-0.5">{error}</span>}
  </div>
);

interface PasswordFieldProps extends InputFieldProps {
  show: boolean;
  onToggle: () => void;
}

const PasswordField = ({ label, show, onToggle, error, ...props }: PasswordFieldProps) => (
  <div className="flex flex-col">
    <label className="text-[11px] font-bold text-gray-500 font-['Work_Sans'] ml-1 mb-1 uppercase tracking-tighter">
      {label} *
    </label>
    <div className="relative w-full">
      <input 
        type={show ? "text" : "password"} 
        className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#087CA7] outline-none pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden transition-all ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...props} 
      />
      <button 
        type="button" 
        onClick={onToggle} 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#087CA7] focus:outline-none flex items-center justify-center"
      >
        {show ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        )}
      </button>
    </div>
    {error && <span className="text-red-500 text-[10px] ml-1 mt-0.5">{error}</span>}
  </div>
);

// UPDATED: Now accepts an array of { code, name } objects
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: LocationNode[];
  defaultOption: string;
}

const SelectField = ({ label, error, options, defaultOption, ...props }: SelectFieldProps) => (
  <div className="flex flex-col">
    <label className="text-[11px] font-bold text-gray-500 font-['Work_Sans'] ml-1 mb-1 uppercase tracking-tighter">
      {label} {props.required && "*"}
    </label>
    <select 
      className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#087CA7] outline-none bg-white transition-all ${error ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
      {...props}
    >
      <option value="">{defaultOption}</option>
      {options.map(opt => <option key={opt.code} value={opt.code}>{opt.name}</option>)}
    </select>
    {error && <span className="text-red-500 text-[10px] ml-1 mt-0.5">{error}</span>}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

const Button = ({ text, className = "", ...props }: ButtonProps) => (
  <button 
    className={`w-full bg-[#004385] hover:bg-[#031a6b] text-white font-bold py-2 rounded-lg shadow-md transition-all active:scale-[0.98] font-['Work_Sans'] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {text}
  </button>
);