import express from "express";
import { Service } from "../models/index.js";
import { verifyToken, verifyTechnician } from "../middleware/auth.js";
const r = express.Router();
r.get("/", async (req,res)=>{
  const {category,search,mode,sort}=req.query;
  const q={approvalStatus:"approved",isAvailable:true};
  if(category) q.category=category;
  if(mode) q.serviceMode=mode;
  if(search) q.title=new RegExp(search,"i");
  let query=Service.find(q);
  if(sort==="price-low") query=query.sort({basePrice:1});
  else if(sort==="price-high") query=query.sort({basePrice:-1});
  else query=query.sort({createdAt:-1});
  const rows=await query;
  res.json(rows);
});
r.get("/mine", verifyToken, verifyTechnician, async (req,res)=>{
  res.json(await Service.find({technicianEmail:req.user.email}).sort({createdAt:-1}));
});
r.get("/:id", async (req,res)=>{
  const s=await Service.findById(req.params.id);
  if(!s) return res.status(404).json({message:"Not found"});
  if(s.approvalStatus!=="approved"||!s.isAvailable) return res.status(404).json({message:"Not found"});
  res.json(s);
});
r.post("/", verifyToken, verifyTechnician, async (req,res)=>{
  const {title,category,description,basePrice,estimatedDuration,serviceMode,serviceArea,image}=req.body;
  const allowedCategories=["Smartphone","Laptop & PC","AC","Refrigerator","TV","Washing Machine","Electrical"];
  if(!title?.trim()||!description?.trim()||!allowedCategories.includes(category)||!["Home Visit","Shop Drop-off"].includes(serviceMode)) return res.status(400).json({message:"Invalid service fields"});
  if(!Number.isFinite(Number(basePrice))||Number(basePrice)<=0||!estimatedDuration?.trim()||!serviceArea?.trim()||typeof image!=="string"||!/^https?:\/\//.test(image)) return res.status(400).json({message:"Invalid service fields"});
  const s=await Service.create({title,category,description,basePrice:Number(basePrice),estimatedDuration,serviceMode,serviceArea,image,technicianName:req.user.name,technicianEmail:req.user.email,approvalStatus:"pending",isAvailable:true});
  res.status(201).json(s);
});
r.patch("/:id", verifyToken, verifyTechnician, async (req,res)=>{
  const s=await Service.findById(req.params.id);
  if(!s) return res.status(404).json({message:"Not found"});
  if(s.technicianEmail!==req.user.email) return res.status(403).json({message:"Forbidden"});
  const {title,category,description,basePrice,estimatedDuration,serviceMode,serviceArea,image}=req.body;
  if(!title?.trim()||!description?.trim()||!Number.isFinite(Number(basePrice))||Number(basePrice)<=0) return res.status(400).json({message:"Invalid service fields"});
  Object.assign(s,{title:title.trim(),category,description:description.trim(),basePrice:Number(basePrice),estimatedDuration,serviceMode,serviceArea,image,approvalStatus:"pending"});
  await s.save();
  res.json(s);
});
r.delete("/:id", verifyToken, verifyTechnician, async (req,res)=>{
  const s=await Service.findById(req.params.id);
  if(!s) return res.status(404).json({message:"Not found"});
  if(s.technicianEmail!==req.user.email) return res.status(403).json({message:"Forbidden"});
  await s.deleteOne();
  res.json({success:true});
});
r.patch("/:id/availability", verifyToken, verifyTechnician, async (req,res)=>{
  const s=await Service.findById(req.params.id);
  if(!s||s.technicianEmail!==req.user.email) return res.status(403).json({message:"Forbidden"});
  s.isAvailable=!!req.body.isAvailable;
  await s.save();
  res.json(s);
});
export default r;
