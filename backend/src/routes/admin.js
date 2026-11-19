import express from "express";
import mongoose from "mongoose";
import { Service, Booking, Payment } from "../models/index.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
import {
  getBetterAuthUsers,
  serializeBetterAuthUser,
} from "../utils/better-auth-users.js";
const r = express.Router();
r.get("/users", verifyToken, verifyAdmin, async (req,res)=>{
  const users=await getBetterAuthUsers()
    .find({}, {projection:{name:1,email:1,image:1,role:1,phone:1,area:1,bio:1,createdAt:1}})
    .sort({createdAt:-1})
    .toArray();
  res.json(users.map(serializeBetterAuthUser));
});
r.patch("/users/:id/role", verifyToken, verifyAdmin, async (req,res)=>{
  const {role}=req.body;
  if(!["customer","technician","admin"].includes(role)) return res.status(400).json({message:"Invalid role"});
  if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:"Invalid user id"});
  const users=getBetterAuthUsers();
  const targetId=new mongoose.Types.ObjectId(req.params.id);
  const target=await users.findOne({_id:targetId});
  if(!target) return res.status(404).json({message:"User not found"});
  if(target._id.toString()===req.user.id||target.email===req.user.email) {
    return res.status(403).json({message:"Cannot change own role"});
  }
  await users.updateOne({_id:target._id},{$set:{role}});
  const updated=await users.findOne(
    {_id:target._id},
    {projection:{name:1,email:1,image:1,role:1,phone:1,area:1,bio:1,createdAt:1}}
  );
  res.json({success:true,user:serializeBetterAuthUser(updated)});
});
r.get("/services", verifyToken, verifyAdmin, async (req,res)=> res.json(await Service.find().sort({createdAt:-1})));
r.get("/bookings", verifyToken, verifyAdmin, async (req,res)=> res.json(await Booking.find().sort({createdAt:-1})));
r.get("/payments", verifyToken, verifyAdmin, async (req,res)=> res.json(await Payment.find().sort({paidAt:-1})));
export default r;
