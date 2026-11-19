import express from "express";
import { User, Service, Booking, Payment } from "../models/index.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
const r = express.Router();
r.get("/users", verifyToken, verifyAdmin, async (req,res)=> res.json(await User.find().select("-password").sort({createdAt:-1})));
r.patch("/users/:id/role", verifyToken, verifyAdmin, async (req,res)=>{
  const {role}=req.body;
  if(!["customer","technician","admin"].includes(role)) return res.status(400).json({message:"Invalid role"});
  if(req.params.id===req.user.id) return res.status(403).json({message:"Cannot change own role"});
  const u=await User.findByIdAndUpdate(req.params.id,{role},{new:true}).select("-password");
  res.json({success:true,user:u});
});
r.get("/services", verifyToken, verifyAdmin, async (req,res)=> res.json(await Service.find().sort({createdAt:-1})));
r.get("/bookings", verifyToken, verifyAdmin, async (req,res)=> res.json(await Booking.find().sort({createdAt:-1})));
r.get("/payments", verifyToken, verifyAdmin, async (req,res)=> res.json(await Payment.find().sort({paidAt:-1})));
export default r;
