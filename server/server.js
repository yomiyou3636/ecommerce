import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/Auth.js"; // Import auth routes
import productRoutes from "./routes/product.js"; // Import the product routes
import orderRoutes from "./routes/Order.js"; // Import the order routes

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Use Auth Routes
app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/uploads", express.static("uploads"));

// Sample route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
