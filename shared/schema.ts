import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["manager", "employee"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed"]);
export const complaintStatusEnum = pgEnum("complaint_status", ["open", "in_review", "resolved"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("employee"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  link: text("link"),
  status: taskStatusEnum("status").notNull().default("pending"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: complaintStatusEnum("status").notNull().default("open"),
  employeeId: varchar("employee_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  complaints: many(complaints),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "createdTasks",
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  employee: one(users, {
    fields: [complaints.employeeId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  employeeId: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
