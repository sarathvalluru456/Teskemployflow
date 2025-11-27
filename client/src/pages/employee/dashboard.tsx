import { useQuery, useMutation } from "@tanstack/react-query";
import type { Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeeDashboard() {
  const { toast } = useToast();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/my-tasks"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-tasks"] });
      toast({ title: "Task status updated" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingTasks = tasks?.filter((t) => t.status === "pending") || [];
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress") || [];
  const completedTasks = tasks?.filter((t) => t.status === "completed") || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-chart-5" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-chart-4" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-chart-5/10 text-chart-5 border-chart-5/20">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          My Tasks
        </h1>
        <p className="text-muted-foreground">
          View and manage your assigned tasks
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-pending-count">
                {pendingTasks.length}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-progress-count">
                {inProgressTasks.length}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-chart-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-completed-count">
                {completedTasks.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Tasks</CardTitle>
          <CardDescription>
            {tasks?.length || 0} tasks assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : tasks?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No tasks assigned</h3>
              <p className="text-sm text-muted-foreground">
                Your manager will assign tasks to you soon
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks?.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border bg-card"
                  data-testid={`card-task-${task.id}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(task.status)}
                      <div className="space-y-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                  
                  <p className="text-sm text-foreground/80 mb-4 ml-8">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between gap-4 flex-wrap ml-8">
                    <div className="flex items-center gap-3">
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({ id: task.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[150px]" data-testid={`select-status-${task.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {updateStatusMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {task.link && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={task.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`link-task-${task.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Task Link
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
