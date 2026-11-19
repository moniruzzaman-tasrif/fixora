import express from "express";
import Stripe from "stripe";
import { Booking, Payment } from "../models/index.js";
import { verifyToken, verifyCustomer } from "../middleware/auth.js";
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const r = express.Router();
r.post("/create-checkout-session", verifyToken, verifyCustomer, async (req,res)=>{
  if(!stripe) return res.status(503).json({message:"Stripe is not configured"});
  const {bookingId}=req.body;
  const b=await Booking.findById(bookingId);
  if(!b||b.customerEmail!==req.user.email) return res.status(403).json({message:"Forbidden"});
  if(b.status!=="completed"||b.paymentStatus!=="unpaid") return res.status(400).json({message:"Not payable"});
  const existing=await Payment.findOne({stripeSessionId:{$exists:true},bookingId:b._id});
  if(existing) return res.status(409).json({message:"Already paid"});
  const session=await stripe.checkout.sessions.create({
    mode:"payment",
    line_items:[{price_data:{currency:"usd",product_data:{name:b.serviceTitle},unit_amount:Math.round(b.finalAmount*100)},quantity:1}],
    success_url:`${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:`${process.env.CLIENT_URL}/payment/cancel`,
    metadata:{bookingId:String(b._id)}
  });
  res.json({url:session.url,sessionId:session.id});
});
r.get("/verify", verifyToken, verifyCustomer, async (req,res)=>{
  if(!stripe) return res.status(503).json({message:"Stripe is not configured"});
  const {session_id}=req.query;
  const session=await stripe.checkout.sessions.retrieve(session_id);
  if(session.payment_status!=="paid") return res.status(400).json({message:"Not paid"});
  const bookingId=session.metadata.bookingId;
  const b=await Booking.findById(bookingId);
  if(!b) return res.status(404).json({message:"Booking not found"});
  if(b.customerEmail!==req.user.email) return res.status(403).json({message:"Forbidden"});
  const exists=await Payment.findOne({stripeSessionId:session.id});
  let payment=exists;
  if(!payment){
    payment=await Payment.create({bookingId:b._id,serviceTitle:b.serviceTitle,customerName:b.customerName,customerEmail:b.customerEmail,technicianName:b.technicianName,technicianEmail:b.technicianEmail,amount:b.finalAmount,currency:"usd",transactionId:session.payment_intent,stripeSessionId:session.id,paymentStatus:"paid",paidAt:new Date()});
  }
  if(b.paymentStatus!=="paid"){
    b.paymentStatus="paid";
    await b.save();
  }
  res.json({success:true,payment});
});
r.get("/mine", verifyToken, verifyCustomer, async (req,res)=>{
  res.json(await Payment.find({customerEmail:req.user.email}).sort({paidAt:-1}));
});
r.post("/webhook", async (req,res)=>{
  if(!stripe||!process.env.STRIPE_WEBHOOK_SECRET){
    return res.status(503).json({message:"Stripe webhook is not configured"});
  }
  let event;
  try{
    event=stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }catch(error){
    return res.status(400).json({
      message:error instanceof Error?error.message:"Invalid webhook signature"
    });
  }
  if(event.type==="checkout.session.completed"){
    const session=event.data.object;
    const bookingId=session.metadata?.bookingId;
    if(!bookingId||session.payment_status!=="paid") return res.json({received:true});
    const b=await Booking.findById(bookingId);
    if(!b||b.paymentStatus==="paid") return res.json({received:true});
    const exists=await Payment.findOne({bookingId:b._id,stripeSessionId:session.id});
    if(!exists){
      await Payment.create({
        bookingId:b._id,
        serviceTitle:b.serviceTitle,
        customerName:b.customerName,
        customerEmail:b.customerEmail,
        technicianName:b.technicianName,
        technicianEmail:b.technicianEmail,
        amount:b.finalAmount,
        currency:"usd",
        transactionId:session.payment_intent,
        stripeSessionId:session.id,
        paymentStatus:"paid",
        paidAt:new Date()
      });
      b.paymentStatus="paid";
      await b.save();
    }
  }
  res.json({received:true});
});
export default r;
