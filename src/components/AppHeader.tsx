import { Bell, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { NotificationPanel } from "./NotificationPanel";

export const AppHeader = () => {
  const { user, logout, isDarkMode, toggleDarkMode, notifications } = useFinance();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
            <img src="/logo.png" alt="FinanceBudy Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-lg font-bold font-display text-foreground hidden sm:block">FinanceBudy</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse-soft">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
          </div>

          {user && (
            <div className="flex items-center gap-2 ml-2">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-semibold">{user.avatar}</span>
              </div>
              <span className="text-sm font-medium text-foreground hidden md:block">{user.name}</span>
              <button onClick={logout} className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
