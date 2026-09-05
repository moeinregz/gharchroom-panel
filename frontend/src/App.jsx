import React, { useState } from "react";
import {
  LayoutDashboard, CheckSquare, Users, MessageSquare, Phone, ShoppingCart,
  Clock, FileText, Settings as SettingsIcon, StickyNote, Package, Truck,
  Leaf, Menu, LogOut, Sun, Moon,
} from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { Avatar, ROLES } from "./components/ui";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Chat from "./pages/Chat";
import Crm from "./pages/Crm";
import Orders from "./pages/Orders";
import Attendance from "./pages/Attendance";
import Notes from "./pages/Notes";
import Reports from "./pages/Reports";
import { MyOrders, Tracking } from "./pages/Customer";
import SettingsPage from "./pages/Settings";

const NAV = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard, roles: Object.keys(ROLES) },
  { id: "tasks", label: "وظایف", icon: CheckSquare, roles: ["admin", "manager", "sales", "accounting", "seo", "editor"] },
  { id: "team", label: "اعضای تیم", icon: Users, roles: ["admin", "manager"] },
  { id: "chat", label: "گفتگوی تیمی", icon: MessageSquare, roles: ["admin", "manager", "sales", "accounting", "seo", "editor"] },
  { id: "crm", label: "CRM تماس‌ها", icon: Phone, roles: ["admin", "manager", "sales"] },
  { id: "orders", label: "سفارش‌ها", icon: ShoppingCart, roles: ["admin", "manager", "sales", "accounting"] },
  { id: "attendance", label: "حضور و غیاب", icon: Clock, roles: ["admin", "manager", "sales", "accounting", "seo", "editor"] },
  { id: "notes", label: "یادداشت‌های من", icon: StickyNote, roles: ["sales"] },
  { id: "reports", label: "گزارش‌های کاری", icon: FileText, roles: ["admin", "manager", "sales", "accounting", "seo", "editor"] },
  { id: "myorders", label: "سفارش‌های من", icon: Package, roles: ["customer"] },
  { id: "tracking", label: "رهگیری سفارش", icon: Truck, roles: ["customer"] },
  { id: "settings", label: "دسترسی گفتگو", icon: SettingsIcon, roles: ["admin", "manager"] },
];

function Shell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nav = NAV.filter((n) => n.roles.includes(user.role));
  const [page, setPage] = useState(nav[0]?.id || "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = {
    dashboard: <Dashboard user={user} />,
    tasks: <Tasks user={user} />,
    team: <Team user={user} />,
    chat: <Chat user={user} />,
    crm: <Crm user={user} />,
    orders: <Orders user={user} />,
    attendance: <Attendance user={user} />,
    notes: <Notes />,
    reports: <Reports user={user} />,
    myorders: <MyOrders />,
    tracking: <Tracking />,
    settings: <SettingsPage />,
  };

  return (
    <div className="cmd-shell">
      {sidebarOpen && <div className="cmd-sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
      <aside className={`cmd-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="cmd-brand">
          <div className="cmd-brand-icon"><Leaf size={19} /></div>
          <div>
            <div className="cmd-brand-title">قارچ روم</div>
            <div className="cmd-brand-sub">مدیریت یکپارچه شرکت</div>
          </div>
        </div>
        <nav className="cmd-nav">
          {nav.map((n) => (
            <button key={n.id} className={`cmd-nav-item ${page === n.id ? "active" : ""}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
              <n.icon size={17} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="cmd-sidebar-foot">
          <div className="cmd-user-card">
            <Avatar name={user.name} size={34} />
            <div style={{ minWidth: 0 }}>
              <div className="cmd-user-name" style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div className="cmd-user-role" style={{ fontSize: 10.5 }}>{ROLES[user.role]}</div>
            </div>
          </div>
          <button className="cmd-logout" onClick={logout}><LogOut size={14} />خروج از حساب</button>
        </div>
      </aside>

      <div className="cmd-main">
        <header className="cmd-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="cmd-hamburger" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <div className="cmd-topbar-title">{nav.find((n) => n.id === page)?.label}</div>
          </div>
          <button className="cmd-theme-toggle" onClick={toggleTheme} title="تغییر حالت روشن/تیره">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </header>
        <main className="cmd-page">{pages[page]}</main>
      </div>
    </div>
  );
}

function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <div className="cmd-loading">در حال بارگذاری...</div>;
  return user ? <Shell /> : <Home />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}
