import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// User Role and Status Enums
export type UserRole = "manager" | "employee";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type ComplaintStatus = "open" | "in_review" | "resolved";

// User Schema
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["manager", "employee"], default: "employee", required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

export const User = mongoose.model<IUser>("User", userSchema);

// Task Schema
export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  link?: string;
  status: TaskStatus;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String },
  status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending", required: true },
  assignedTo: { type: String, ref: "User" },
  createdBy: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

export const Task = mongoose.model<ITask>("Task", taskSchema);

// Complaint Schema
export interface IComplaint extends Document {
  _id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  employeeId: string;
  createdAt: Date;
}

const complaintSchema = new Schema<IComplaint>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["open", "in_review", "resolved"], default: "open", required: true },
  employeeId: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

export const Complaint = mongoose.model<IComplaint>("Complaint", complaintSchema);

// Zod Schemas for validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["manager", "employee"]).optional().default("employee"),
});

export const insertUserSchema = registerSchema;

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional().default("pending"),
  assignedTo: z.string().optional(),
});

export const insertComplaintSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = IUser;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = ITask;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = IComplaint;
