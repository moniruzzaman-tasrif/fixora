import express from "express";
import { Booking, Service } from "../models/index.js";
import { verifyToken, verifyCustomer, verifyTechnician } from "../middleware/auth.js";
const r = express.Router();
const transitions={"requested":["accepted","rejected","cancelled"],"accepted":["in-progress"],"in-progress":["completed"]};
r.post("/", verifyToken, verifyCustomer, async (req,res)=>{
  const {serviceId,customerPhone,address,preferredDate,problemDescription}=req.body;
  const svc=await Service.findById(serviceId);
  if(!svc||svc.approvalStatus!=="approved"||!svc.isAvailable) return res.status(400).json({message:"Service unavailable"});
  if(svc.technicianEmail===req.user.email) return res.status(403).json({message:"Cannot book own service"});
  const active=await Booking.findOne({customerEmail:req.user.email,serviceId,status:{$in:["requested","accepted","in-progress"]}});
  if(active) return res.status(409).json({message:"Duplicate active booking"});
  const b=await Booking.create({serviceId,serviceTitle:svc.title,serviceImage:svc.image,category:svc.category,basePrice:svc.basePrice,technicianName:svc.technicianName,technicianEmail:svc.technicianEmail,customerName:req.user.name,customerEmail:req.user.email,customerPhone,address,preferredDate,problemDescription,finalAmount:svc.basePrice,status:"requested",paymentStatus:"unpaid"});
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
