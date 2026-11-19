import mongoose from "mongoose";

const USER_COLLECTION = "user";

export function getBetterAuthUsers() {
  const database = mongoose.connection.db;
  if (!database) {
    throw new Error("MongoDB is not connected");
  }
  return database.collection(USER_COLLECTION);
}

export function serializeBetterAuthUser(user) {
  if (!user) return null;
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    phone: user.phone,
    area: user.area,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}
