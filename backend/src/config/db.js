import mongoose from "mongoose";
export async function connectDB(uri) {
  if(!uri) throw new Error("MONGODB_URI or MONGODB_URL must be configured");
  await mongoose.connect(uri,{dbName:"fixora"});
  console.log("MongoDB connected");
}
