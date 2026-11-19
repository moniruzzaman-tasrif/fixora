import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import serviceRoutes from "./routes/services.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payments.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use("/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);

// Compatibility aliases keep both assignment-style route names and the
// frontend's current data-access helpers working against the same routers.
app.use("/services", serviceRoutes);
app.use("/booking", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/payments", paymentRoutes);
app.use("/users", userRoutes);
app.get("/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(port, () => console.log(`Backend on ${port}`));
});
