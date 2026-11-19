import express from "express";
import { User } from "../models/index.js";
import { verifyToken } from "../middleware/auth.js";
const r = express.Router();
r.get("/profile", verifyToken, async (req,res)=>{
  const u=await User.findById(req.user.id).select("-password");
  res.json(u);
});
r.patch("/profile", verifyToken, async (req,res)=>{
  const {name,phone,area,bio,image}=req.body;
  if(name!==undefined&&!name.trim()) return res.status(400).json({message:"Name is required"});
  const u=await User.findById(req.user.id);
  if(!u&&req.user.email) {
    return res.status(404).json({message:"Profile not found"});
  }
  if(!u) return res.status(404).json({message:"Profile not found"});
  if(name) u.name=name; if(phone!==undefined) u.phone=phone; if(area!==undefined) u.area=area; if(bio!==undefined) u.bio=bio; if(image) u.image=image;
  await u.save();
  res.json({success:true,user:u});
});
export default r;
