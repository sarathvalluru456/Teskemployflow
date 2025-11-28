import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertTaskSchema, insertComplaintSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

declare module "express-session" {
  interface SessionData {
    userId: string;
    userRole: "manager" | "employee";
  }
}

const employeePasswords = new Map<string, string>();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

function requireManager(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || req.session.userRole !== "manager") {
    return res.status(403).json({ message: "Manager access required" });
  }
  next();
}

const PgSession = pgSession(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set before initializing sessions");
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "task-employee-flow-secret-key-dev",
      resave: false,
      saveUninitialized: false,
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
        }
        req.session.userId = user.id;
        req.session.userRole = user.role;
        
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
          }
          const { password: _, ...userWithoutPassword } = user;
          res.json({ user: userWithoutPassword });
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
        }
        req.session.userId = user.id;
        req.session.userRole = user.role;
        
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
          }
          const { password: _, ...userWithoutPassword } = user;
          res.json({ user: userWithoutPassword });
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Failed to check authentication" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/tasks", requireAuth, requireManager, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/my-tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getTasksByAssignee(req.session.userId!);
      res.json(tasks);
    } catch (error) {
      console.error("Get my tasks error:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, requireManager, async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...data,
        createdBy: req.session.userId!,
      });
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create task error:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (req.session.userRole === "employee" && task.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }

      const updatedTask = await storage.updateTask(id, { status });
      res.json(updatedTask);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, requireManager, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.json({ message: "Task deleted" });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.get("/api/employees", requireAuth, requireManager, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      
      const employeesWithPasswords = employees.map(employee => ({
        ...employee,
        password: undefined,
        plainPassword: employeePasswords.get(employee.id),
      }));
      
      res.json(employeesWithPasswords);
    } catch (error) {
      console.error("Get employees error:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", requireAuth, requireManager, async (req, res) => {
    try {
      const data = registerSchema.parse({
        ...req.body,
        role: "employee",
      });
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const plainPassword = data.password;
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      employeePasswords.set(user.id, plainPassword);

      const { password: _, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, plainPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create employee error:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.get("/api/complaints", requireAuth, async (req, res) => {
    try {
      if (req.session.userRole === "manager") {
        const complaints = await storage.getComplaints();
        res.json(complaints);
      } else {
        const complaints = await storage.getComplaintsByEmployee(req.session.userId!);
        res.json(complaints);
      }
    } catch (error) {
      console.error("Get complaints error:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.get("/api/my-complaints", requireAuth, async (req, res) => {
    try {
      const complaints = await storage.getComplaintsByEmployee(req.session.userId!);
      res.json(complaints);
    } catch (error) {
      console.error("Get my complaints error:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.post("/api/complaints", requireAuth, async (req, res) => {
    try {
      const data = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint({
        ...data,
        employeeId: req.session.userId!,
      });
      res.json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create complaint error:", error);
      res.status(500).json({ message: "Failed to create complaint" });
    }
  });

  app.patch("/api/complaints/:id", requireAuth, requireManager, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedComplaint = await storage.updateComplaint(id, { status });
      if (!updatedComplaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      res.json(updatedComplaint);
    } catch (error) {
      console.error("Update complaint error:", error);
      res.status(500).json({ message: "Failed to update complaint" });
    }
  });

  return httpServer;
}
