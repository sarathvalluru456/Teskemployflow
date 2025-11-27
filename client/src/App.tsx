import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ManagerDashboard from "@/pages/manager/dashboard";
import ManagerTasks from "@/pages/manager/tasks";
import ManagerEmployees from "@/pages/manager/employees";
import ManagerComplaints from "@/pages/manager/complaints";
import EmployeeDashboard from "@/pages/employee/dashboard";
import EmployeeComplaints from "@/pages/employee/complaints";
import type { CSSProperties } from "react";

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: "manager" | "employee";
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const redirectPath = user.role === "manager" ? "/manager/dashboard" : "/employee/dashboard";
    return <Redirect to={redirectPath} />;
  }

  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style: CSSProperties = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (user) {
    const redirectPath = user.role === "manager" ? "/manager/dashboard" : "/employee/dashboard";
    return <Redirect to={redirectPath} />;
  }

  return <HomePage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthRedirect} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      <Route path="/manager/dashboard">
        <ProtectedRoute allowedRole="manager">
          <DashboardLayout>
            <ManagerDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/manager/tasks">
        <ProtectedRoute allowedRole="manager">
          <DashboardLayout>
            <ManagerTasks />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/manager/employees">
        <ProtectedRoute allowedRole="manager">
          <DashboardLayout>
            <ManagerEmployees />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/manager/complaints">
        <ProtectedRoute allowedRole="manager">
          <DashboardLayout>
            <ManagerComplaints />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/employee/dashboard">
        <ProtectedRoute allowedRole="employee">
          <DashboardLayout>
            <EmployeeDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/employee/complaints">
        <ProtectedRoute allowedRole="employee">
          <DashboardLayout>
            <EmployeeComplaints />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
