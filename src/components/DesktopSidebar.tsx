import { LayoutDashboard, Wallet, ArrowLeftRight, Grid3X3, Lightbulb, FileBarChart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/account", icon: Wallet, label: "Account" },
  { path: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { path: "/categories", icon: Grid3X3, label: "Categories" },
  { path: "/insights", icon: Lightbulb, label: "Insights" },
  { path: "/reports", icon: FileBarChart, label: "Reports" },
];

export const DesktopSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card min-h-[calc(100vh-4rem)] p-4 gap-1">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </aside>
  );
};
