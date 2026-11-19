import express from "express";
import mongoose from "mongoose";
import { Booking, Service } from "../models/index.js";
import { verifyToken, verifyCustomer, verifyTechnician } from "../middleware/auth.js";
const r = express.Router();
const transitions={"requested":["accepted","rejected","cancelled"],"accepted":["in-progress"],"in-progress":["completed"]};

function todayInDhaka() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isValidPreferredDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value >= todayInDhaka()
  );
}

r.post("/", verifyToken, verifyCustomer, async (req,res)=>{
  const {serviceId,customerPhone,address,preferredDate,problemDescription}=req.body ?? {};
  if(typeof serviceId!=="string"||!mongoose.isValidObjectId(serviceId)){
    return res.status(400).json({message:"Invalid service ID"});
  }
  if(typeof customerPhone!=="string"||!customerPhone.trim()){
    return res.status(400).json({message:"Phone is required"});
  }
  if(typeof address!=="string"||!address.trim()){
    return res.status(400).json({message:"Address is required"});
  }
  if(!isValidPreferredDate(preferredDate)){
    return res.status(400).json({message:"Preferred date must be today or a future date"});
  }
  if(typeof problemDescription!=="string"||problemDescription.trim().length<20){
    return res.status(400).json({message:"Problem description must be at least 20 characters"});
  }
  const svc=await Service.findById(serviceId);
  if(!svc||svc.approvalStatus!=="approved"||!svc.isAvailable) return res.status(400).json({message:"Service unavailable"});
  if(svc.technicianEmail===req.user.email) return res.status(403).json({message:"Cannot book own service"});
  const active=await Booking.findOne({customerEmail:req.user.email,serviceId,status:{$in:["requested","accepted","in-progress"]}});
  if(active) return res.status(409).json({message:"You already have an active request for this service"});
  const b=await Booking.create({serviceId,serviceTitle:svc.title,serviceImage:svc.image,category:svc.category,basePrice:svc.basePrice,technicianName:svc.technicianName,technicianEmail:svc.technicianEmail,customerName:req.user.name,customerEmail:req.user.email,customerPhone:customerPhone.trim(),address:address.trim(),preferredDate,problemDescription:problemDescription.trim(),finalAmount:svc.basePrice,status:"requested",paymentStatus:"unpaid"});
  res.status(201).json(b);
});
r.get("/my", verifyToken, verifyCustomer, async (req,res)=>{
  res.json(await Booking.find({customerEmail:req.user.email}).sort({createdAt:-1}));
});
r.get("/technician", verifyToken, verifyTechnician, async (req,res)=>{
  res.json(await Booking.find({technicianEmail:req.user.email}).sort({createdAt:-1}));
});
r.get("/mine", verifyToken, verifyCustomer, async (req,res)=>{
  res.json(await Booking.find({customerEmail:req.user.email}).sort({createdAt:-1}));
});
r.patch("/:id/cancel", verifyToken, verifyCustomer, async (req,res)=>{
  const b=await Booking.findById(req.params.id);
  if(!b||b.customerEmail!==req.user.email) return res.status(403).json({message:"Forbidden"});
  if(b.status!=="requested") return res.status(400).json({message:"Cannot cancel"});
  b.status="cancelled"; await b.save(); res.json(b);
});
r.patch("/:id/status", verifyToken, verifyTechnician, async (req,res)=>{
  const {status,finalAmount}=req.body;
  const b=await Booking.findById(req.params.id);
  if(!b||b.technicianEmail!==req.user.email) return res.status(403).json({message:"Forbidden"});
  if(!transitions[b.status]?.includes(status)) return res.status(400).json({message:"Invalid transition"});
  if(status==="completed"){ if(!finalAmount||Number(finalAmount)<=0) return res.status(400).json({message:"finalAmount required"}); b.finalAmount=Number(finalAmount); }
  b.status=status; await b.save(); res.json(b);
});
r.get("/", verifyToken, async (req,res)=>{
  const {status}=req.query;
  const q=status?{status}:{};
  if(req.user.role==="technician"){
    q.technicianEmail=req.user.email;
  }else if(req.user.role==="customer"){
    q.customerEmail=req.user.email;
  }else if(req.user.role!=="admin"){
    return res.status(403).json({message:"Forbidden"});
  }
  res.json(await Booking.find(q).sort({createdAt:-1}));
});
export default r;
