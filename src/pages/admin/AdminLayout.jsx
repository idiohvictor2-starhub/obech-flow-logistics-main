import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Image,
  Users,
  ShieldCheck,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  Globe,
  CircleDollarSign
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ADMIN_LINKS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Bookings", path: "/admin/bookings", icon: ClipboardList },
  { label: "Tracking Control", path: "/admin/tracking", icon: MapPin },
  { label: "Manage Photos", path: "/admin/photos", icon: Image },
  { label: "Customers", path: "/admin/customers", icon: Users },
  { label: "Drivers & Riders", path: "/admin/drivers", icon: ShieldCheck },
  { label: "Vehicles/Fleet", path: "/admin/vehicles", icon: Truck },
  { label: "Locations/Hubs", path: "/admin/locations", icon: Globe },
  { label: "Pricing Rules", path: "/admin/pricing", icon: CircleDollarSign },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-steel border-t-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  const getPageTitle = () => {
    const active = ADMIN_LINKS.find((link) => link.path === location.pathname);
    return active ? active.label : "Admin Portal";
  };

  return (
    <div className="min-h-screen bg-steel/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy border-r border-white/10 text-white shrink-0">
        {/* Sidebar Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Obech Logo" className="w-8 h-8 object-contain" />
            <span className="font-heading font-black text-lg tracking-tight text-white group-hover:text-orange transition-colors">
              Obech Admin
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all duration-200 ${
                  isActive
                    ? "bg-orange text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-orange"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-white/5 bg-navy-dark flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-orange shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email || "admin@obechflow.com"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-white/5 transition-colors text-left"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar overlay) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 bottom-0 left-0 w-64 bg-navy border-r border-white/10 text-white z-50 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Obech Logo" className="w-8 h-8 object-contain" />
            <span className="font-heading font-black text-lg tracking-tight">Obech Admin</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="py-6 px-4 space-y-1 overflow-y-auto h-[calc(100vh-170px)]">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all ${
                  isActive ? "bg-orange text-white" : "text-white/70 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-orange"} />
                  {link.label}
                </div>
                <ChevronRight size={14} className="opacity-30" />
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-navy-dark">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header navbar */}
        <header className="h-20 bg-white border-b border-steel flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-navy p-2 hover:bg-steel/50 rounded-lg"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg lg:text-xl font-heading font-black text-navy uppercase tracking-wide">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-navy">Administrator</p>
              <p className="text-xs text-muted-foreground">Operations Level 1</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-navy/5 border border-steel flex items-center justify-center text-orange font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Outlet Content Container */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
