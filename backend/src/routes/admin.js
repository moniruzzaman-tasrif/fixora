import express from "express";
import mongoose from "mongoose";
import { Service, Booking, Payment } from "../models/index.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
import {
  getBetterAuthUsers,
  serializeBetterAuthUser,
} from "../utils/better-auth-users.js";

const r = express.Router();

const userProjection = {
  name: 1,
  email: 1,
  image: 1,
  role: 1,
  phone: 1,
  area: 1,
  bio: 1,
  createdAt: 1,
};
const allowedRoles = ["customer", "technician", "admin"];
const allowedApprovalStatuses = ["pending", "approved", "rejected"];

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

r.get("/users", verifyToken, verifyAdmin, asyncRoute(async (req, res) => {
  const users = await getBetterAuthUsers()
    .find({}, { projection: userProjection })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(users.map(serializeBetterAuthUser));
}));

r.patch("/users/:id/role", verifyToken, verifyAdmin, asyncRoute(async (req, res) => {
  const { role } = req.body ?? {};
  if (typeof role !== "string" || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const users = getBetterAuthUsers();
  const targetId = new mongoose.Types.ObjectId(req.params.id);
  const target = await users.findOne({ _id: targetId });
  if (!target) return res.status(404).json({ message: "User not found" });
  if (target._id.toString() === req.user.id || target.email === req.user.email) {
    return res.status(403).json({ message: "Cannot change own role" });
  }

  await users.updateOne({ _id: target._id }, { $set: { role } });
  const updated = await users.findOne(
    { _id: target._id },
    { projection: userProjection }
  );
  res.json({ success: true, user: serializeBetterAuthUser(updated) });
}));

r.patch("/services/:id/approval", verifyToken, verifyAdmin, asyncRoute(async (req, res) => {
  const { approvalStatus } = req.body ?? {};
  if (typeof approvalStatus !== "string" || !allowedApprovalStatuses.includes(approvalStatus)) {
    return res.status(400).json({ message: "Invalid approval status" });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid service ID" });
  }

  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { $set: { approvalStatus } },
    { new: true, runValidators: true }
  );
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json({ success: true, service });
}));

r.get("/services", verifyToken, verifyAdmin, asyncRoute(async (req, res) => {
  res.json(await Service.find().sort({ createdAt: -1 }));
}));

r.get("/bookings", verifyToken, verifyAdmin, asyncRoute(async (req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }));
}));

r.get("/payments", verifyToken, verifyAdmin, asyncRoute(async (req, res) => {
  res.json(await Payment.find().sort({ paidAt: -1 }));
}));

export default r;
