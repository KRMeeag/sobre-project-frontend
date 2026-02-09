import { supabase } from "../lib/supabase";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#004385] text-white">
      <h1 className="text-5xl mb-4">Account Verified 🎉</h1>
      <p>Dashboard coming soon...</p>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-8 px-6 py-3 bg-green-600 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
