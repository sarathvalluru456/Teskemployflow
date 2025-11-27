import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@shared/schema";
import type { z } from "zod";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Users, Eye, EyeOff, Copy, Check } from "lucide-react";

type EmployeeFormValues = z.infer<typeof registerSchema>;

export default function ManagerEmployees() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const { data: employees, isLoading } = useQuery<(User & { plainPassword?: string })[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      const response = await apiRequest("POST", "/api/employees", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Employee added successfully" });
      setIsCreateOpen(false);
      form.reset();
      setGeneratedPassword("");
    },
    onError: (error) => {
      toast({
        title: "Failed to add employee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    form.setValue("password", password);
  };

  const onSubmit = (data: EmployeeFormValues) => {
    createMutation.mutate(data);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            Employees
          </h1>
          <p className="text-muted-foreground">
            Manage your team members and their credentials
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-employee">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee account with login credentials
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          data-testid="input-employee-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          data-testid="input-employee-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Create a password"
                            data-testid="input-employee-password"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generatePassword}
                          data-testid="button-generate-password"
                        >
                          Generate
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {generatedPassword && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Generated password (save this):
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-mono">{generatedPassword}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(generatedPassword, "generated")}
                      >
                        {copiedId === "generated" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      form.reset();
                      setGeneratedPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-employee"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Employee"
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
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg">All Employees</CardTitle>
              <CardDescription>
                {employees?.length || 0} team members
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
              data-testid="button-toggle-passwords"
            >
              {showPasswords ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Credentials
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Credentials
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : employees?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No employees yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first employee to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {showPasswords && <TableHead>Password</TableHead>}
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees?.map((employee) => (
                    <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{employee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{employee.email}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(employee.email, `email-${employee.id}`)}
                          >
                            {copiedId === `email-${employee.id}` ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {employee.role}
                        </Badge>
                      </TableCell>
                      {showPasswords && (
                        <TableCell>
                          {employee.plainPassword ? (
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {employee.plainPassword}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  copyToClipboard(
                                    employee.plainPassword!,
                                    `pass-${employee.id}`
                                  )
                                }
                              >
                                {copiedId === `pass-${employee.id}` ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not available
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-muted-foreground">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
