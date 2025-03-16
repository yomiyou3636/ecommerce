import express from "express";
import { body, validationResult } from "express-validator";
import Product from "../models/product.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, compressImage } from "../middleware/uploadMiddleware.js";
import path from "path";
import fs from "fs";
const router = express.Router();

// Route to create a new product
router.post(
  "/post",
  protect, // Ensure the user is authenticated
  upload.single("image"), // Handle single image upload
  [
    // Validate other incoming data
    body("name").not().isEmpty().withMessage("Name is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("items").isNumeric().withMessage("Items must be a number"),
    body("category").not().isEmpty().withMessage("Category is required"),
    body("location").not().isEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Explicitly check if an image was uploaded
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: "No image found" }] });
    }

    try {
      // Compress the image using Sharp
      await compressImage(req.file.path);

      const { name, description, items, price, category, location } = req.body;

      // Generate a unique ID for the post
      const uniqueId = await generateUniqueId();

      // Create a new product with the uploaded image's path, the unique ID, and other details
      const newProduct = new Product({
        id: uniqueId, // Use the generated ID
        name,
        description,
        price,
        items,
        category,
        image: req.file.path, // Image path stored in the database
        location,
        seller: req.user.id, // Attach the seller (logged-in user)
      });

      // Save the product to the database
      const product = await newProduct.save();

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Function to generate a unique ID
const generateUniqueId = async () => {
  // Get the latest post inserted to find the last ID used
  const lastProduct = await Product.findOne().sort({ _id: -1 }).lean(); // Sort by _id descending (latest post)

  if (!lastProduct) {
    // If no product exists yet, start with A000001
    return "A000001";
  }

  // Get the last product's ID and split it into letter and numeric parts
  const lastId = lastProduct.id;
  const letter = lastId.charAt(0); // First character (A-Z)
  const number = parseInt(lastId.slice(1), 10); // The numeric part (000001 to 999999)

  // Increment the numeric part
  let newNumber = number + 1;

  if (newNumber > 999999) {
    // If we reach 999999, reset the number and move to the next letter
    newNumber = 1;
    const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1); // Increment the letter (A -> B)

    // If we reach Z, stop or handle as needed (for example, return null or throw an error)
    if (nextLetter > "Z") {
      throw new Error("ID limit reached");
    }

    return `${nextLetter}000001`;
  }

  // Format the new number to always be 6 digits long, with leading zeros
  const formattedNumber = String(newNumber).padStart(6, "0");

  return `${letter}${formattedNumber}`;
};

// POST endpoint to create a new product with a generated unique ID
router.get("/myposts", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Product.countDocuments({ seller: req.user.id });
    const totalPages = Math.ceil(totalPosts / limit);

    // Return only the image filename instead of absolute URL
    const populatedProducts = products.map((product) => {
      return {
        ...product.toObject(),
        image: product.image ? path.basename(product.image) : null, // Extract only filename
      };
    });

    res.status(200).json({
      products: populatedProducts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get all products (randomly)
router.get("/all", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // Default: 10 items per category
  const categoryLimit = parseInt(req.query.categoryLimit) || 3; // Number of random categories

  try {
    // Get distinct categories from the database
    const categories = await Product.distinct("category");

    if (categories.length === 0) {
      return res.json({ message: "No categories found", products: [] });
    }

    // Shuffle and pick a few random categories
    const randomCategories = categories
      .sort(() => 0.5 - Math.random())
      .slice(0, categoryLimit);

    // Fetch latest products from selected categories
    const products = await Product.find({ category: { $in: randomCategories } })
      .sort({ createdAt: -1 }) // Latest first
      .limit(limit);

    res.json({ categories: randomCategories, products });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/category/:categoryName", async (req, res) => {
  //http://localhost:5000/product/category/electronics?page=1&limit=5   how to accees the paginated content
  try {
    const { categoryName } = req.params;
    let { page = 1, limit = 10, excludePost } = req.query; // Pagination defaults

    page = parseInt(page);
    limit = parseInt(limit);

    // Build the query
    const query = { category: categoryName };

    // Exclude a specific post (optional, e.g., when viewing a post and suggesting others)
    if (excludePost) {
      query._id = { $ne: excludePost };
    }

    // Get products in the same category
    const products = await Product.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/update/:id", // Post ID as a parameter
  protect, // Ensure the user is authenticated
  async (req, res) => {
    // Extract the ID from the URL parameters
    const { id } = req.params;

    // Get the fields to update from the request body
    const { name, description, price, items, category, location } = req.body;

    // Validate that the ID exists (this is usually done by the MongoDB validation)
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    try {
      // Find the post by its ID
      const post = await Product.findOne({ id });

      // If the post doesn't exist, return an error
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the logged-in user is the owner of the post
      if (post.seller.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You do not have permission to edit this post" });
      }

      // Update only the fields that are provided in the request body
      if (name) post.name = name;
      if (description) post.description = description;
      if (price) post.price = price;
      if (items) post.items = items;
      if (category) post.category = category;
      if (location) post.location = location;

      // Save the updated post
      const updatedPost = await post.save();

      // Return the updated post
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
