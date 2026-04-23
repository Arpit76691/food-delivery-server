import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// ✅ MUST be at the VERY TOP (before routes)
app.use(cors({
  origin: (origin, callback) => {
    // Allow Vercel preview deployments and production
    const allowedOrigins = [
      "https://food-delivery-client-daw2.vercel.app",
      "https://food-delivery-client-daw2-4d1r8wxxp-arpits-projects-29070a78.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5000"
    ];

    // Match any Vercel preview URL pattern
    const vercelPattern = /^https:\/\/food-delivery-client-.*\.vercel\.app$/;

    if (!origin || allowedOrigins.includes(origin) || vercelPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

// ✅ Handle preflight globally
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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