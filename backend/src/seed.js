import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { Service } from "./models/index.js";
import { getBetterAuthUsers } from "./utils/better-auth-users.js";

await connectDB(process.env.MONGODB_URI || process.env.MONGODB_URL);
try {
  const technician = await getBetterAuthUsers().findOne({role:"technician"});
  if(!technician) throw new Error("Create a technician through BetterAuth before seeding services");

  const service = {
    title:"Phone Screen Repair",
    category:"Smartphone",
    description:"Fix cracked screen",
    image:"",
    basePrice:50,
    estimatedDuration:"1-2 hours",
    serviceMode:"Shop Drop-off",
    serviceArea:"Dhaka",
    technicianName:technician.name,
    technicianEmail:technician.email,
    approvalStatus:"approved",
    isAvailable:true
  };
  await Service.updateOne(
    {title:service.title,technicianEmail:service.technicianEmail},
    {$setOnInsert:service},
    {upsert:true}
  );
  console.log("Seeded a service without changing users, bookings, or payments.");
} finally {
  await mongoose.disconnect();
}
