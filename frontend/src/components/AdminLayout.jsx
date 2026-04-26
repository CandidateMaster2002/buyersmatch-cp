import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut, Users, FileText, MessageSquare, RefreshCw, Image } from "lucide-react";
import { adminLogout, getStoredUser } from "../api/client";
import logo from "../assets/bm-logo-white-text-1B2A4A.jpg";

const SyncButton = ({ label, icon: Icon, endpoint, colorClass, activeColorClass }) => {
  const [state, setState] = useState("idle"); // idle | loading | done | error

  const handleClick = async () => {
    if (state === "loading") return;
    setState("loading");
    try {
      const { triggerSync } = await import('../api/admin');
      await triggerSync(endpoint);
      setState("done");
    } catch {
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const label_ =
    state === "loading" ? "Starting..." :
    state === "done"    ? "Started ✓" :
    state === "error"   ? "Failed ✗" :
    label;

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all
        ${state === "done"    ? "bg-green-500/20 border-green-500/40 text-green-400" :
          state === "error"   ? "bg-red-500/20 border-red-500/40 text-red-400" :
          state === "loading" ? `${colorClass} opacity-60 cursor-wait` :
          `${colorClass} ${activeColorClass}`}
      `}
    >
      <Icon size={16} className={state === "loading" ? "animate-spin" : ""} />
      <span className="hidden sm:inline">{label_}</span>
    </button>
  );
};

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser("ADMIN");

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 sticky top-0 bg-[#0A1128]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-6">
          <Link
            to="/admin/clients"
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <img
              src={logo}
              alt="BuyersMatch"
              className="h-10 w-auto group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block border-l border-white/10 pl-3">
              <p className="text-[10px] text-teal uppercase tracking-widest font-bold">
                Admin Portal
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-bold truncate max-w-[150px]">
              {user?.email}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Administrator
            </p>
          </div>

          <SyncButton
            label="Sync Data"
            icon={RefreshCw}
            endpoint="data"
            colorClass="bg-teal/10 border-teal/30 text-teal"
            activeColorClass="hover:bg-teal hover:text-navy"
          />

          <SyncButton
            label="Sync Media"
            icon={Image}
            endpoint="media"
            colorClass="bg-purple-500/10 border-purple-500/30 text-purple-400"
            activeColorClass="hover:bg-purple-500 hover:text-white"
          />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
