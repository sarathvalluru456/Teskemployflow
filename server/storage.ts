import { 
  users, 
  tasks, 
  complaints,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type Complaint,
  type InsertComplaint,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getEmployees(): Promise<User[]>;
  
  getTasks(): Promise<Task[]>;
  getTasksByAssignee(assigneeId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask & { createdBy: string }): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  
  getComplaints(): Promise<Complaint[]>;
  getComplaintsByEmployee(employeeId: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint & { employeeId: string }): Promise<Complaint>;
  updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEmployees(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "employee"));
  }

  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assignedTo, assigneeId));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask & { createdBy: string }): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getComplaints(): Promise<Complaint[]> {
    return db.select().from(complaints);
  }

  async getComplaintsByEmployee(employeeId: string): Promise<Complaint[]> {
    return db.select().from(complaints).where(eq(complaints.employeeId, employeeId));
  }

  async createComplaint(complaint: InsertComplaint & { employeeId: string }): Promise<Complaint> {
    const [newComplaint] = await db
      .insert(complaints)
      .values(complaint)
      .returning();
    return newComplaint;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const [updatedComplaint] = await db
      .update(complaints)
      .set(updates)
      .where(eq(complaints.id, id))
      .returning();
    return updatedComplaint || undefined;
  }
}

export const storage = new DatabaseStorage();
