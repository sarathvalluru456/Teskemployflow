import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Users, MessageSquareWarning, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Task, User, Complaint } from "@shared/schema";

export default function ManagerDashboard() {
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const isLoading = tasksLoading || employeesLoading || complaintsLoading;

  const stats = {
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter((t) => t.status === "completed").length || 0,
    pendingTasks: tasks?.filter((t) => t.status === "pending").length || 0,
    inProgressTasks: tasks?.filter((t) => t.status === "in_progress").length || 0,
    totalEmployees: employees?.length || 0,
    openComplaints: complaints?.filter((c) => c.status === "open").length || 0,
  };

  const recentTasks = tasks?.slice(0, 5) || [];
  const recentComplaints = complaints?.filter((c) => c.status === "open").slice(0, 3) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your team's tasks and performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-tasks">
                {stats.totalTasks}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-in-progress">
                {stats.inProgressTasks}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-employees">
                {stats.totalEmployees}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
            <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-open-complaints">
                {stats.openComplaints}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
            <CardDescription>Latest tasks in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`card-task-${task.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-chart-5 flex-shrink-0" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="h-4 w-4 text-chart-4 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{task.title}</span>
                    </div>
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "default"
                          : task.status === "in_progress"
                          ? "secondary"
                          : "outline"
                      }
                      className="ml-2 flex-shrink-0"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Complaints</CardTitle>
            <CardDescription>Open complaints requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquareWarning className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No open complaints</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`card-complaint-${complaint.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{complaint.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {complaint.description.slice(0, 50)}...
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-2 flex-shrink-0">
                      Open
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
