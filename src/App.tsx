import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FinanceProvider, useFinance } from "@/contexts/FinanceContext";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import InsightsPage from "./pages/InsightsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useFinance();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-5xl">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useFinance();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/dashboard" element={<AuthenticatedLayout><DashboardPage /></AuthenticatedLayout>} />
      <Route path="/account" element={<AuthenticatedLayout><AccountsPage /></AuthenticatedLayout>} />
      <Route path="/transactions" element={<AuthenticatedLayout><TransactionsPage /></AuthenticatedLayout>} />
      <Route path="/categories" element={<AuthenticatedLayout><CategoriesPage /></AuthenticatedLayout>} />
      <Route path="/insights" element={<AuthenticatedLayout><InsightsPage /></AuthenticatedLayout>} />
      <Route path="/reports" element={<AuthenticatedLayout><ReportsPage /></AuthenticatedLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <FinanceProvider>
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
