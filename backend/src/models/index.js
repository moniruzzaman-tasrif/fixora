import mongoose from "mongoose";
export const Service = mongoose.model("Service", new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  basePrice: { type: Number, required: true },
  estimatedDuration: String,
  serviceMode: String,
  serviceArea: String,
  technicianName: String,
  technicianEmail: { type: String, required: true },
  approvalStatus: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}));
export const Booking = mongoose.model("Booking", new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  serviceTitle: String,
  serviceImage: String,
  category: String,
  basePrice: Number,
  technicianName: String,
  technicianEmail: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  address: String,
  preferredDate: String,
  problemDescription: String,
  status: { type: String, enum: ["requested","accepted","rejected","in-progress","completed","cancelled"], default: "requested" },
  finalAmount: Number,
  paymentStatus: { type: String, enum: ["unpaid","paid"], default: "unpaid" },
  createdAt: { type: Date, default: Date.now }
}));
export const Payment = mongoose.model("Payment", new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  serviceTitle: String,
  customerName: String,
  customerEmail: String,
  technicianName: String,
  technicianEmail: String,
  amount: Number,
  currency: { type: String, default: "usd" },
  transactionId: String,
  stripeSessionId: { type: String, unique: true },
  paymentStatus: { type: String, default: "paid" },
  paidAt: { type: Date, default: Date.now }
}));
