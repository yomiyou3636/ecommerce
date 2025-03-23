import express from "express";
import { body, validationResult } from "express-validator";
import Product from "../models/product.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, compressImage } from "../middleware/uploadMiddleware.js";
import path from "path";
import fs from "fs/promises"; // Correct import
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
// Route to get the latest products (paginated)
router.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    // Fetch latest products, sorted by creation date
    const products = await Product.find()
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // Transform image field to return only filename
    const formattedProducts = products.map((product) => ({
      ...product.toObject(),
      image: product.image ? path.basename(product.image) : null, // Extract only filename
    }));

    res.status(200).json({
      products: formattedProducts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching latest products:", error);
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
  "/update/:id",
  protect, // Ensure the user is authenticated
  upload.single("image"), // Handle single image upload

  async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, items, price, category, location } = req.body;
      const productId = req.params.id; // Get the product ID from the URL

      // Find the product by ID
      const product = await Product.findOne({ id: productId });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update product fields
      product.name = name;
      product.description = description;
      product.price = price;
      product.items = items;
      product.category = category;
      product.location = location;

      // Check if a new image was uploaded
      if (req.file) {
        // Compress the image using Sharp
        await compressImage(req.file.path);
        product.image = req.file.path; // Update image path
      }

      // Save the updated product
      const updatedProduct = await product.save();

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    console.log("req.params:", req.params);
    const productId = req.params.id;
    console.log("productId:", productId);
    const deletedProduct = await Product.findOne({ id: productId });

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (deletedProduct.image) {
      try {
        await fs.unlink(deletedProduct.image);
        console.log(`Image deleted: ${deletedProduct.image}`);
      } catch (imageDeleteError) {
        console.error("Error deleting image:", imageDeleteError);
      }
    }

    await Product.deleteOne({ id: productId });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
