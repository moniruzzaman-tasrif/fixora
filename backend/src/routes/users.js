import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getBetterAuthUsers,
  serializeBetterAuthUser,
} from "../utils/better-auth-users.js";
const r = express.Router();
r.get("/profile", verifyToken, async (req,res)=>{
  const u=await getBetterAuthUsers().findOne(
    {email:req.user.email},
    {projection:{name:1,email:1,image:1,role:1,phone:1,area:1,bio:1,createdAt:1}}
  );
  if(!u) return res.status(404).json({message:"Profile not found"});
  res.json(serializeBetterAuthUser(u));
});
r.patch("/profile", verifyToken, async (req,res)=>{
  const {name,phone,area,bio,image}=req.body;
  if(name!==undefined&&(typeof name!=="string"||!name.trim())) return res.status(400).json({message:"Name is required"});
  if(phone!==undefined&&typeof phone!=="string") return res.status(400).json({message:"Invalid phone"});
  if(area!==undefined&&typeof area!=="string") return res.status(400).json({message:"Invalid area"});
  if(bio!==undefined&&typeof bio!=="string") return res.status(400).json({message:"Invalid bio"});
  if(image!==undefined&&typeof image!=="string") return res.status(400).json({message:"Invalid image"});
  const users=getBetterAuthUsers();
  const u=await users.findOne({email:req.user.email});
  if(!u) return res.status(404).json({message:"Profile not found"});
  const changes={};
  if(name!==undefined) changes.name=name.trim();
  if(phone!==undefined) changes.phone=phone;
  if(area!==undefined) changes.area=area;
  if(bio!==undefined) changes.bio=bio;
  if(image!==undefined) changes.image=image;
  if(Object.keys(changes).length>0) await users.updateOne({_id:u._id},{$set:changes});
  const updated=await users.findOne(
    {_id:u._id},
    {projection:{name:1,email:1,image:1,role:1,phone:1,area:1,bio:1,createdAt:1}}
  );
  res.json({success:true,user:serializeBetterAuthUser(updated)});
});
export default r;
