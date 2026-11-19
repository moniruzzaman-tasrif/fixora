import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
const r = express.Router();
r.post("/register", async (req,res)=>{
  const {name,email,password,role}=req.body;
  const allowed=["customer","technician"];
  const safeRole = allowed.includes(role)?role:"customer";
  if(!name||!email||!password) return res.status(400).json({message:"Missing fields"});
  const exists = await User.findOne({email});
  if(exists) return res.status(409).json({message:"Email exists"});
  const hash = await bcrypt.hash(password,10);
  const user = await User.create({name,email,password:hash,role:safeRole});
  res.status(201).json({user:{_id:user._id,name:user.name,email:user.email,role:user.role}});
});
r.post("/login", async (req,res)=>{
  const {email,password}=req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(401).json({message:"Invalid"});
  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.status(401).json({message:"Invalid"});
  const token = jwt.sign({id:user._id,email:user.email,role:user.role,name:user.name}, process.env.JWT_SECRET, {expiresIn:"7d"});
  res.json({token,user:{_id:user._id,name:user.name,email:user.email,role:user.role,image:user.image}});
});
export default r;
