import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";

const iconMap = {
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  alert: <ShieldAlert className="h-4 w-4 text-destructive" />,
  info: <Info className="h-4 w-4 text-info" />,
};

export const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { notifications, markNotificationRead } = useFinance();

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-elevated animate-scale-in z-50">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Notifications</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map(n => (
          <button key={n.id} onClick={() => markNotificationRead(n.id)}
            className={`w-full text-left p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? "bg-accent/30" : ""}`}>
            <div className="flex gap-3">
              <div className="mt-0.5">{iconMap[n.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
              </div>
              {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
