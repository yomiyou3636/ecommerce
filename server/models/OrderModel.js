import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    orderTime: {
      type: String,
      required: true,
    },
    itemsCount: {
      type: Number,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    productId: {
      type: String, // Reference to the product's ID
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
