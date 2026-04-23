import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import { apiLimiter, authLimiter, orderLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load env
dotenv.config();

// DEBUG (IMPORTANT — REMOVE LATER)
console.log("ENV CHECK:", process.env.MONGO_URI);

// Connect DB
connectDB();

const app = express();


// ✅ FINAL CORS FIX (ONLY THIS — DO NOT ADD cors() PACKAGE)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Food Delivery API is running" });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderLimiter, orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});