import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";
import { sendOrderEmail, orderPaidEmail, orderDelivered } from "../config/nodemailer.js"
import Product from "../Models/ProductModel.js";

const orderRouter = express.Router();

// CREATE ORDER
orderRouter.post("/", protect, asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    
    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });
      for(var i=0; i<orderItems.length; i++){
        const menos = await Product.findById(orderItems[i].product)
        menos.countInStock = menos.countInStock - orderItems[i].qty
        menos.save()
      }
      sendOrderEmail(req.user.name, req.user.email, orderItems.length)
      const createOrder = await order.save();
      res.status(201).json(createOrder);
    }
  })
);

// ADMIN GET ALL ORDERS
orderRouter.get("/all", protect, admin, asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);

// USER LOGIN ORDERS
orderRouter.get("/", protect, asyncHandler(async (req, res) => {
    const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });
    res.json(order);
  })
);

// GET ORDER BY ID
orderRouter.get("/:id", protect, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
      console.log(order)
    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS PAID
orderRouter.put("/:id/pay", protect, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (order) {
      orderPaidEmail(order.user.name, order.user.email, order.id)
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS DELIVERED 
orderRouter.put("/:id/delivered", protect, admin, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );;

    if (order) {
      order.isDelivered = true;
      orderDelivered(order.user.name, order.user.email, order.id)
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

export default orderRouter;
