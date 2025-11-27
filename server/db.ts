import mongoose from "mongoose";

// Connect to MongoDB
export async function connectDB() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    console.error("  The server will start but database operations will fail.");
    console.error("  Please ensure MongoDB is running or update DATABASE_URL.");
    // Don't throw - allow server to start even if DB connection fails
    // This helps with development when MongoDB might not be immediately available
  }
}

// Export mongoose connection
export { mongoose };
