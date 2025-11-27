import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import type { z } from "zod";
import type { Task, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Loader2,
  ExternalLink,
  Trash2,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TaskFormValues = z.infer<typeof insertTaskSchema>;

export default function ManagerTasks() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      status: "pending",
      assignedTo: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created successfully" });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task deleted successfully" });
      setDeleteTaskId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
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

  const onSubmit = (data: TaskFormValues) => {
    createMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-chart-5" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-chart-4" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return "Unassigned";
    const employee = employees?.find((e) => e.id === assignedTo);
    return employee?.name || "Unknown";
  };

  const isLoading = tasksLoading || employeesLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            Tasks
          </h1>
          <p className="text-muted-foreground">
            Manage and assign tasks to your team
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task and assign it to an employee
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Task title"
                          data-testid="input-task-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the task in detail..."
                          className="min-h-[100px]"
                          data-testid="input-task-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Link (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/resource"
                          data-testid="input-task-link"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-assignee">
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={employee.id}
                              data-testid={`option-employee-${employee.id}`}
                            >
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-task"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Tasks</CardTitle>
          <CardDescription>
            {tasks?.length || 0} total tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No tasks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first task to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Task</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks?.map((task) => (
                    <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getAssigneeName(task.assignedTo)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ id: task.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-status-${task.id}`}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span className="capitalize">{task.status.replace("_", " ")}</span>
                            </div>
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
                      </TableCell>
                      <TableCell>
                        {task.link ? (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                            data-testid={`link-task-${task.id}`}
                          >
                            Open
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteTaskId(task.id)}
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTaskId && deleteMutation.mutate(deleteTaskId)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
