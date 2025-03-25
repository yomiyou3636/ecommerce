import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust the path based on your folder structure
import bcrypt from "bcryptjs";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || "user", // Default to 'buyer' role if not specified
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password); // Assuming bcrypt
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Create a JWT token with email and role included
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // Ensure email is included
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/me", protect, async (req, res) => {
  try {
    const userId = req.user.id; // or req.user._id depending on how it's stored
    const user = await User.findById(userId); // Use findById instead of findOne when querying by _id

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If you want to exclude password and only return the name and email:
    res.json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", protect, async (req, res) => {
  try {
    // Invalidate the token (optional): You could add to a blacklist in your DB if necessary.

    // Respond to the client that the logout was successful
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/validate", protect, async (req, res) => {
  try {
    // Token is already validated by `protect` middleware
    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});
export default router;
