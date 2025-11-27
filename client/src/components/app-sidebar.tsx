import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  MessageSquareWarning,
  LogOut,
  ClipboardList,
} from "lucide-react";

const managerMenuItems = [
  {
    title: "Dashboard",
    url: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/manager/tasks",
    icon: ClipboardList,
  },
  {
    title: "Employees",
    url: "/manager/employees",
    icon: Users,
  },
  {
    title: "Complaints",
    url: "/manager/complaints",
    icon: MessageSquareWarning,
  },
];

const employeeMenuItems = [
  {
    title: "My Tasks",
    url: "/employee/dashboard",
    icon: ClipboardList,
  },
  {
    title: "Submit Complaint",
    url: "/employee/complaints",
    icon: MessageSquareWarning,
  },
];

export function AppSidebar() {
  const { user, logout, isManager } = useAuth();
  const [location] = useLocation();

  const menuItems = isManager ? managerMenuItems : employeeMenuItems;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href={isManager ? "/manager/dashboard" : "/employee/dashboard"}>
          <div className="flex items-center gap-2" data-testid="link-home">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">TaskEmployeeFlow</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isManager ? "Management" : "My Workspace"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                    >
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">
              {user?.role || "Unknown"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
