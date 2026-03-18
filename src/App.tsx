import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
import POSPage from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import HistoryPage from "./pages/HistoryPage";
import SalesPage from "./pages/SalesPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [user, setUser] = useState<any>(null);
  // 1. Initialize loading to true
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        // 2. Stop loading once the session check finishes
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Render nothing (or a spinner) while checking auth
  if (loading) {
    return null; // Replace with <LoadingSpinner /> if desired
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route
          path="/"
          element={user ? <Navigate to="/pos" replace /> : <AuthPage />}
        />

        {/* protected */}
        <Route
          element={user ? <DashboardLayout /> : <Navigate to="/" replace />}
        >
          <Route path="/pos" element={<POSPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}