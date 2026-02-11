import { Outlet, Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <NavBar />

      <main className="flex-1 bg-['e9e9e9']">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
