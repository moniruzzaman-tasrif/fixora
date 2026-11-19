import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getBetterAuthUsers } from "../utils/better-auth-users.js";

export function verifyToken(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({message:"Authentication required"});
  if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Invalid authorization header"});
  const token = h.split(" ")[1];
  const secret=process.env.JWT_SECRET||process.env.BETTER_AUTH_SECRET;
  if(!secret) return res.status(500).json({message:"Authentication secret is not configured"});
  let identity;
  try {
    identity=jwt.verify(token, secret);
  } catch {
    return res.status(401).json({message:"Invalid token"});
  }
  if(typeof identity!=="object"||identity===null||
    typeof identity.id!=="string"||typeof identity.email!=="string"||
    !["customer","technician","admin"].includes(identity.role)){
    return res.status(401).json({message:"Invalid user identity"});
  }
  req.user=identity;
  next();
}
export function verifyCustomer(req,res,next){ if(req.user.role!=="customer") return res.status(403).json({message:"Forbidden"}); next(); }
export function verifyTechnician(req,res,next){ if(req.user.role!=="technician") return res.status(403).json({message:"Forbidden"}); next(); }

export async function verifyAdmin(req,res,next){
  if(req.user.role!=="admin") return res.status(403).json({message:"Forbidden"});
  if(!mongoose.isValidObjectId(req.user.id)) {
    return res.status(401).json({message:"Invalid user identity"});
  }

  try {
    const user = await getBetterAuthUsers().findOne(
      {_id:new mongoose.Types.ObjectId(req.user.id),email:req.user.email},
      {projection:{role:1}}
    );
    if(!user) return res.status(401).json({message:"User identity is no longer valid"});
    if(user.role!=="admin") return res.status(403).json({message:"Forbidden"});
    return next();
  } catch(error) {
    return next(error);
  }
}
