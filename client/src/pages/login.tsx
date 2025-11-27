import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import type { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckSquare, Shield, Users } from "lucide-react";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"manager" | "employee">("employee");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      await login(result.user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${result.user.name}`,
      });

      if (result.user.role === "manager") {
        setLocation("/manager/dashboard");
      } else {
        setLocation("/employee/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckSquare className="h-10 w-10 text-primary" />
            <span className="text-3xl font-semibold">TaskEmployeeFlow</span>
          </div>
          <p className="text-muted-foreground">
            Streamline your team's workflow
          </p>
        </div>

        <Card className="border-card-border">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={selectedRole === "employee" ? "default" : "ghost"}
                className="flex-1 gap-2"
                onClick={() => setSelectedRole("employee")}
                data-testid="button-role-employee"
              >
                <Users className="h-4 w-4" />
                Employee
              </Button>
              <Button
                type="button"
                variant={selectedRole === "manager" ? "default" : "ghost"}
                className="flex-1 gap-2"
                onClick={() => setSelectedRole("manager")}
                data-testid="button-role-manager"
              >
                <Shield className="h-4 w-4" />
                Manager
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          data-testid="input-email"
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
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
                data-testid="link-register"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          {selectedRole === "manager"
            ? "Managers can create tasks, manage employees, and oversee all operations."
            : "Employees can view and complete assigned tasks and submit complaints."}
        </p>
      </div>
    </div>
  );
}
