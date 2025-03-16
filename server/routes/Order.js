import express from "express";
import Order from "../models/OrderModel.js";
import Product from "../models/product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper function to generate the unique orderId
const generateOrderId = async () => {
  const lastOrder = await Order.findOne().sort({ orderId: -1 }).limit(1);
  const lastOrderId = lastOrder ? lastOrder.orderId : "00000A";

  const numberPart = parseInt(lastOrderId.slice(0, 5), 10);
  const letterPart = lastOrderId.slice(5);

  let newNumber = numberPart;
  let newLetter = letterPart;

  if (letterPart === "Z") {
    newLetter = "A";
    newNumber++;
  } else {
    newLetter = String.fromCharCode(letterPart.charCodeAt(0) + 1);
  }

  return `${newNumber.toString().padStart(5, "0")}${newLetter}`;
};

// Create Order
router.post("/addorder", protect, async (req, res) => {
  const { orders, customerEmail, deliveryLocation } = req.body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return res
      .status(400)
      .json({ message: "Orders must be a non-empty array." });
  }

  try {
    // Check stock availability for all items
    let insufficientStockItems = [];

    for (const item of orders) {
      const { productId, itemsCount } = item;

      if (!productId || !itemsCount) {
        return res
          .status(400)
          .json({ message: "Each order must have productId and itemsCount." });
      }

      // Find the product details
      const product = await Product.findOne({ id: productId });

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found for ID: ${productId}` });
      }

      // Check if enough stock is available
      if (product.items < itemsCount) {
        insufficientStockItems.push({
          productId,
          available: product.items,
          requested: itemsCount,
        });
      }
    }

    // If any product has insufficient stock, reject the whole order
    if (insufficientStockItems.length > 0) {
      return res.status(400).json({
        message: "Order cannot be placed due to insufficient stock.",
        insufficientStockItems,
      });
    }

    // Generate a single orderId for all items in this cart
    const orderId = await generateOrderId();

    let orderList = [];

    for (const item of orders) {
      const { productId, itemsCount } = item;

      // Find the product again to process the order
      const product = await Product.findOne({ id: productId });

      // Calculate total amount for this product
      const totalAmount = itemsCount * product.price;

      // Create the order object
      const newOrder = {
        orderId, // Shared order ID
        orderTime: new Date().toLocaleTimeString(),
        itemsCount,
        customerEmail,
        sellerId: product.seller,
        totalAmount,
        deliveryLocation,
        productId: product.id,
      };

      orderList.push(newOrder);

      // Deduct the purchased items from stock
      product.items -= itemsCount;
      await product.save();
    }

    // Save all orders in bulk
    const savedOrders = await Order.insertMany(orderList);

    res.status(201).json(savedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/cancel/:orderId", protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find all order records with the same orderId
    const orders = await Order.find({ orderId });

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if the order is already canceled
    if (orders[0].status === "canceled") {
      return res.status(400).json({ message: "Order is already canceled." });
    }

    // Restore stock for each product in the order
    for (const order of orders) {
      const product = await Product.findOne({ id: order.productId });

      if (product) {
        product.items += order.itemsCount; // Add back the stock
        await product.save();
      }
    }

    // Update all orders with this orderId to "Canceled"
    await Order.updateMany({ orderId }, { status: "Canceled" });

    res.status(200).json({ message: "Order canceled successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
