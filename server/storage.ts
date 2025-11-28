import {
  type Complaint,
  type InsertComplaint,
  type InsertTask,
  type InsertUser,
  type Task,
  type User,
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getEmployees(): Promise<User[]>;

  getTasks(): Promise<Task[]>;
  getTasksByAssignee(assigneeId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask & { createdBy: string }): Promise<Task>;
  updateTask(id: string, updates: Partial<Pick<Task, "status" | "assignedTo">>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  getComplaints(): Promise<Complaint[]>;
  getComplaintsByEmployee(employeeId: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint & { employeeId: string }): Promise<Complaint>;
  updateComplaint(id: string, updates: Partial<Pick<Complaint, "status">>): Promise<Complaint | undefined>;
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
};

type TaskRow = {
  id: string;
  title: string;
  description: string;
  link: string | null;
  status: string;
  assigned_to: string | null;
  created_by: string;
  created_at: Date;
};

type ComplaintRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  employee_id: string;
  created_at: Date;
};

function mapUser(row: UserRow | undefined): User | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role as User["role"],
    createdAt: row.created_at.toISOString(),
  };
}

function mapTask(row: TaskRow | undefined): Task | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    link: row.link,
    status: row.status as Task["status"],
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    createdAt: row.created_at.toISOString(),
  };
}

function mapComplaint(row: ComplaintRow | undefined): Complaint | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Complaint["status"],
    employeeId: row.employee_id,
    createdAt: row.created_at.toISOString(),
  };
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
    return mapUser(result.rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);
    return mapUser(result.rows[0]);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.query<UserRow>(
      `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `,
      [insertUser.name, insertUser.email, insertUser.password, insertUser.role ?? "employee"],
    );
    return mapUser(result.rows[0])!;
  }

  async getEmployees(): Promise<User[]> {
    const result = await db.query<UserRow>(
      "SELECT * FROM users WHERE role = 'employee' ORDER BY created_at DESC",
    );
    return result.rows.map((row) => mapUser(row)!);
  }

  async getTasks(): Promise<Task[]> {
    const result = await db.query<TaskRow>("SELECT * FROM tasks ORDER BY created_at DESC");
    return result.rows.map((row) => mapTask(row)!);
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const result = await db.query<TaskRow>(
      "SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY created_at DESC",
      [assigneeId],
    );
    return result.rows.map((row) => mapTask(row)!);
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.query<TaskRow>("SELECT * FROM tasks WHERE id = $1", [id]);
    return mapTask(result.rows[0]);
  }

  async createTask(task: InsertTask & { createdBy: string }): Promise<Task> {
    const result = await db.query<TaskRow>(
      `
        INSERT INTO tasks (title, description, link, status, assigned_to, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `,
      [task.title, task.description, task.link ?? null, task.status ?? "pending", task.assignedTo ?? null, task.createdBy],
    );
    return mapTask(result.rows[0])!;
  }

  async updateTask(
    id: string,
    updates: Partial<Pick<Task, "status" | "assignedTo">>,
  ): Promise<Task | undefined> {
    const fields: string[] = [];
    const values: any[] = [];

    if (typeof updates.status !== "undefined") {
      values.push(updates.status);
      fields.push(`status = $${values.length + 1}`);
    }

    if (typeof updates.assignedTo !== "undefined") {
      values.push(updates.assignedTo);
      fields.push(`assigned_to = $${values.length + 1}`);
    }

    if (!fields.length) {
      return this.getTask(id);
    }

    const result = await db.query<TaskRow>(
      `
        UPDATE tasks
        SET ${fields.join(", ")}
        WHERE id = $1
        RETURNING *;
      `,
      [id, ...values],
    );

    return mapTask(result.rows[0]);
  }

  async deleteTask(id: string): Promise<void> {
    await db.query("DELETE FROM tasks WHERE id = $1", [id]);
  }

  async getComplaints(): Promise<Complaint[]> {
    const result = await db.query<ComplaintRow>("SELECT * FROM complaints ORDER BY created_at DESC");
    return result.rows.map((row) => mapComplaint(row)!);
  }

  async getComplaintsByEmployee(employeeId: string): Promise<Complaint[]> {
    const result = await db.query<ComplaintRow>(
      "SELECT * FROM complaints WHERE employee_id = $1 ORDER BY created_at DESC",
      [employeeId],
    );
    return result.rows.map((row) => mapComplaint(row)!);
  }

  async createComplaint(complaint: InsertComplaint & { employeeId: string }): Promise<Complaint> {
    const result = await db.query<ComplaintRow>(
      `
        INSERT INTO complaints (title, description, status, employee_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `,
      [complaint.title, complaint.description, "open", complaint.employeeId],
    );
    return mapComplaint(result.rows[0])!;
  }

  async updateComplaint(
    id: string,
    updates: Partial<Pick<Complaint, "status">>,
  ): Promise<Complaint | undefined> {
    if (typeof updates.status === "undefined") {
      const existing = await db.query<ComplaintRow>("SELECT * FROM complaints WHERE id = $1", [id]);
      return mapComplaint(existing.rows[0]);
    }

    const result = await db.query<ComplaintRow>(
      `
        UPDATE complaints
        SET status = $2
        WHERE id = $1
        RETURNING *;
      `,
      [id, updates.status],
    );
    return mapComplaint(result.rows[0]);
  }
}

export const storage = new DatabaseStorage();
