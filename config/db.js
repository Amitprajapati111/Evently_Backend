import mongoose from "mongoose";

export default async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  const connection = await mongoose.connect(process.env.MONGODB_URI);
  console.info(`MongoDB connected: ${connection.connection.host}`);
}
