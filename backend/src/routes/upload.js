import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
const r = express.Router();
const upload=multer({
  storage:multer.memoryStorage(),
  limits:{fileSize:2*1024*1024},
  fileFilter:(req,file,callback)=>{
    if(!["image/jpeg","image/png","image/webp"].includes(file.mimetype)){
      return callback(new Error("Only JPG, PNG and WebP images are allowed"));
    }
    callback(null,true);
  }
});
r.post("/", verifyToken, upload.single("image"), async (req,res)=>{
  if(!req.file) return res.status(400).json({message:"No image"});
  if(!process.env.IMGBB_API_KEY) return res.status(503).json({message:"Image upload is not configured"});
  const form=new FormData();
  form.append("key",process.env.IMGBB_API_KEY);
  form.append("image",req.file.buffer.toString("base64"));
  const resp=await fetch("https://api.imgbb.com/1/upload",{method:"POST",body:form});
  const data=await resp.json();
  if(!data.success) return res.status(400).json({message:"Upload failed"});
  res.json({url:data.data.url});
});
export default r;
