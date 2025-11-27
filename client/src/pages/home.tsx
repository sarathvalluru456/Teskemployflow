import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  CheckSquare,
  Users,
  ClipboardList,
  Shield,
  ArrowRight,
  MessageSquareWarning,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold">TaskEmployeeFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="h-4 w-4" />
                Streamline your team's workflow
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Task Management Made{" "}
                <span className="text-primary">Simple</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Empower your team with a powerful task management system.
                Managers assign, employees deliver, everyone succeeds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2" data-testid="button-hero-register">
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" data-testid="button-hero-login">
                    Sign In to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
              Built for Teams That Get Things Done
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Manager Control</h3>
                  <p className="text-muted-foreground text-sm">
                    Create tasks, assign to employees, manage your team, and oversee all operations from one dashboard.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                    <ClipboardList className="h-6 w-6 text-chart-2" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Task Management</h3>
                  <p className="text-muted-foreground text-sm">
                    Create detailed tasks with descriptions, links, and assignments. Track progress in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-chart-3" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Employee Portal</h3>
                  <p className="text-muted-foreground text-sm">
                    Employees can view their tasks, update progress, and access task resources with ease.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                    <MessageSquareWarning className="h-6 w-6 text-chart-4" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Complaint System</h3>
                  <p className="text-muted-foreground text-sm">
                    Employees can raise concerns and managers can track and resolve issues efficiently.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-4">
                    <CheckSquare className="h-6 w-6 text-chart-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Status Tracking</h3>
                  <p className="text-muted-foreground text-sm">
                    Track task progress from pending to completed with clear visual indicators and updates.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-muted-foreground text-sm">
                    Secure access control ensures managers and employees see only what they need.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join teams that use TaskEmployeeFlow to manage tasks efficiently and keep everyone aligned.
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>TaskEmployeeFlow - Streamlining team productivity</p>
        </div>
      </footer>
    </div>
  );
}
