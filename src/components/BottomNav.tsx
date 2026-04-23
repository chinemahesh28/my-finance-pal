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

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border md:hidden">
      <div className="bottom-nav-container flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`bottom-nav-item flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
