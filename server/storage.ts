import { 
  User as UserModel, 
  Task as TaskModel, 
  Complaint as ComplaintModel,
  type IUser, 
  type ITask,
  type IComplaint,
  type InsertUser,
  type InsertTask,
  type InsertComplaint,
} from "@shared/schema";

// Type exports matching the interface
export type User = IUser;
export type Task = ITask;
export type Complaint = IComplaint;

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

// Helper function to convert MongoDB document to plain object with string _id and id
function toPlainObject<T extends { _id: any }>(doc: T | null): (Omit<T, '_id'> & { _id: string; id: string }) | undefined {
  if (!doc) return undefined;
  const obj = doc as any;
  const id = typeof obj._id === 'object' && obj._id?.toString ? obj._id.toString() : String(obj._id);
  return {
    ...obj,
    _id: id,
    id: id, // Add id field for backward compatibility
  } as Omit<T, '_id'> & { _id: string; id: string };
}

function toPlainObjectArray<T extends { _id: any }>(docs: T[]): (Omit<T, '_id'> & { _id: string; id: string })[] {
  return docs.map(doc => {
    const obj = doc as any;
    const id = typeof obj._id === 'object' && obj._id?.toString ? obj._id.toString() : String(obj._id);
    return {
      ...obj,
      _id: id,
      id: id, // Add id field for backward compatibility
    } as Omit<T, '_id'> & { _id: string; id: string };
  });
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return toPlainObject(user as any) as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email }).lean();
    return toPlainObject(user as any) as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    await user.save();
    return toPlainObject(user.toObject() as any) as User;
  }

  async getEmployees(): Promise<User[]> {
    const employees = await UserModel.find({ role: "employee" }).lean();
    return toPlainObjectArray(employees as any) as User[];
  }

  async getTasks(): Promise<Task[]> {
    const tasks = await TaskModel.find().lean();
    return toPlainObjectArray(tasks as any) as Task[];
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const tasks = await TaskModel.find({ assignedTo: assigneeId }).lean();
    return toPlainObjectArray(tasks as any) as Task[];
  }

  async getTask(id: string): Promise<Task | undefined> {
    const task = await TaskModel.findById(id).lean();
    return toPlainObject(task as any) as Task | undefined;
  }

  async createTask(task: InsertTask & { createdBy: string }): Promise<Task> {
    const newTask = new TaskModel(task);
    await newTask.save();
    return toPlainObject(newTask.toObject() as any) as Task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();
    return toPlainObject(updatedTask as any) as Task | undefined;
  }

  async deleteTask(id: string): Promise<void> {
    await TaskModel.findByIdAndDelete(id);
  }

  async getComplaints(): Promise<Complaint[]> {
    const complaints = await ComplaintModel.find().lean();
    return toPlainObjectArray(complaints as any) as Complaint[];
  }

  async getComplaintsByEmployee(employeeId: string): Promise<Complaint[]> {
    const complaints = await ComplaintModel.find({ employeeId }).lean();
    return toPlainObjectArray(complaints as any) as Complaint[];
  }

  async createComplaint(complaint: InsertComplaint & { employeeId: string }): Promise<Complaint> {
    const newComplaint = new ComplaintModel(complaint);
    await newComplaint.save();
    return toPlainObject(newComplaint.toObject() as any) as Complaint;
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();
    return toPlainObject(updatedComplaint as any) as Complaint | undefined;
  }
}

export const storage = new DatabaseStorage();
