import { z } from "zod";

// Enums
export const userRoleEnum = z.enum(["manager", "employee"]);
export const taskStatusEnum = z.enum(["pending", "in_progress", "completed"]);
export const complaintStatusEnum = z.enum(["open", "in_review", "resolved"]);

export type UserRole = z.infer<typeof userRoleEnum>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type ComplaintStatus = z.infer<typeof complaintStatusEnum>;

// Validation schemas used on both client and server
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: userRoleEnum.optional().default("employee"),
});

export const insertUserSchema = registerSchema;

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().optional(),
  status: taskStatusEnum.optional().default("pending"),
  assignedTo: z.string().optional(),
});

export const insertComplaintSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

// Shared TypeScript types that mirror the API payloads
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  link?: string | null;
  status: TaskStatus;
  assignedTo?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  employeeId: string;
  createdAt: string;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
