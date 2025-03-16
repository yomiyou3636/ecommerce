import mongoose from "mongoose";

// Define the product schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // The product name is required
    },
    description: {
      type: String,
      required: true, // The product description is required
    },
    price: {
      type: Number,
      required: true, // The product price is required
    },
    category: {
      type: String,
      required: true, // The category of the product (e.g., shoes, clothes, electronics)
      enum: ["shoes", "clothes", "electronics", "accessories", "other"], // Optional: Add any specific categories here
    },
    image: {
      type: String,
      required: true, // The URL or path to the product image (can be stored in a cloud like AWS S3)
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model, since the product is linked to a seller
      required: true,
    },
    location: {
      type: String,
      required: true, // The location of the seller (could be a city or region)
    },
    availability: {
      type: Boolean,
      default: true, // Availability of the product, true by default (product is available for sale)
    },
    createdAt: {
      type: Date,
      default: Date.now, // Timestamp of when the product was created
    },
    items: {
      type: Number,
      required: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Product model
const Product = mongoose.model("Product", productSchema);

export default Product;
